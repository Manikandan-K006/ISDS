const router = require('express').Router();
const prisma = require('../prisma');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

const parseJson = (value, fallback = []) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch {
      return fallback;
    }
  }
  return fallback;
};

const decorate = (p) => ({
  ...p,
  techStack: parseJson(p.techStack),
  team: parseJson(p.team),
  screenshots: parseJson(p.screenshots),
  evaluation: p.evaluation ? (typeof p.evaluation === 'string' ? JSON.parse(p.evaluation) : p.evaluation) : null,
});

async function getVisibleScope(req) {
  const role = req.userRole;
  if (role === 'student') {
    return { studentId: req.userId };
  }
  if (role === 'recruiter') {
    return { visibility: 'public' };
  }
  if (role === 'admin') {
    return {};
  }
  if (role === 'teacher') {
    const teacherCourses = await prisma.course.findMany({ where: { instructorId: req.userId }, select: { id: true } });
    const courseIds = teacherCourses.map((c) => c.id);
    const students = courseIds.length
      ? await prisma.enrollment.findMany({ where: { courseId: { in: courseIds } }, select: { studentId: true }, distinct: ['studentId'] })
      : [];
    const studentIds = students.map((s) => s.studentId);
    return { OR: [{ mentorId: req.userId }, { studentId: { in: studentIds } }] };
  }
  return { id: '__none__' };
}

router.get('/', async (req, res) => {
  try {
    const where = await getVisibleScope(req);
    const projects = await prisma.project.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        student: { select: { id: true, name: true, profilePhoto: true } },
        reviews: { include: { reviewer: { select: { id: true, name: true, profilePhoto: true } } }, orderBy: { createdAt: 'desc' } },
      },
    });
    res.json({ projects: projects.map((p) => ({ ...decorate(p), student: p.student, reviews: p.reviews })) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        student: { select: { id: true, name: true, profilePhoto: true, email: true } },
        reviews: { include: { reviewer: { select: { id: true, name: true, profilePhoto: true } } }, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.visibility !== 'public' && project.studentId !== req.userId && req.userRole !== 'admin' && project.mentorId !== req.userId) {
      return res.status(403).json({ error: 'You cannot view this project' });
    }
    res.json({ project: decorate(project) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authorize('student'), async (req, res) => {
  try {
    const { title, description, techStack, githubUrl, demoUrl, team, mentorId, mentorName, screenshots, status, visibility, startDate, endDate } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ error: 'Project title is required' });

    const project = await prisma.project.create({
      data: {
        studentId: req.userId,
        title: title.trim(),
        description: description || null,
        techStack: JSON.stringify(techStack || []),
        githubUrl: githubUrl || null,
        demoUrl: demoUrl || null,
        team: JSON.stringify(team || []),
        mentorId: mentorId || null,
        mentorName: mentorName || null,
        screenshots: JSON.stringify(screenshots || []),
        status: status || 'idea',
        visibility: visibility || 'private',
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
      include: { student: { select: { id: true, name: true, profilePhoto: true } } },
    });
    res.status(201).json({ project: decorate(project) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authorize('student', 'teacher', 'admin'), async (req, res) => {
  try {
    const existing = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Project not found' });
    if (existing.studentId !== req.userId && req.userRole !== 'admin' && existing.mentorId !== req.userId) {
      return res.status(403).json({ error: 'You cannot edit this project' });
    }

    const allowed = ['title', 'description', 'githubUrl', 'demoUrl', 'status', 'visibility', 'mentorId', 'mentorName', 'startDate', 'endDate', 'evaluation'];
    const data = {};
    allowed.forEach((k) => {
      if (req.body[k] !== undefined) {
        if (['techStack', 'team', 'screenshots'].includes(k)) data[k] = JSON.stringify(req.body[k]);
        else if (k === 'startDate' || k === 'endDate') data[k] = req.body[k] ? new Date(req.body[k]) : null;
        else data[k] = req.body[k];
      }
    });
    if (req.body.techStack !== undefined) data.techStack = JSON.stringify(req.body.techStack || []);
    if (req.body.team !== undefined) data.team = JSON.stringify(req.body.team || []);
    if (req.body.screenshots !== undefined) data.screenshots = JSON.stringify(req.body.screenshots || []);

    const project = await prisma.project.update({ where: { id: req.params.id }, data });
    res.json({ project: decorate(project) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authorize('student', 'admin'), async (req, res) => {
  try {
    const existing = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Project not found' });
    if (existing.studentId !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'You cannot delete this project' });
    }
    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/reviews', authorize('teacher', 'admin'), async (req, res) => {
  try {
    const existing = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Project not found' });
    const { rating, feedback } = req.body;
    if (rating == null || rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be between 1 and 5' });

    const review = await prisma.projectReview.create({
      data: { projectId: req.params.id, reviewerId: req.userId, rating: parseInt(rating), feedback: feedback || null },
    });

    const allReviews = await prisma.projectReview.findMany({ where: { projectId: req.params.id }, select: { rating: true } });
    const avgRating = Math.round((allReviews.reduce((a, b) => a + b.rating, 0) / allReviews.length) * 10) / 10;
    await prisma.project.update({
      where: { id: req.params.id },
      data: { evaluation: JSON.stringify({ avgRating, count: allReviews.length, reviewedAt: new Date() }) },
    });

    await prisma.notification.create({
      data: {
        userId: existing.studentId,
        title: 'Project reviewed',
        message: `${req.user.name} reviewed "${existing.title}" (${rating}/5)`,
        category: 'achievement',
        link: '/projects',
      },
    });

    res.status(201).json({ review });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
