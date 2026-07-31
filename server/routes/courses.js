const router = require('express').Router();
const prisma = require('../prisma');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');

// GET /api/courses - Public course catalog
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 12, search, department, difficulty } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { status: 'published', isPublished: true };
    if (search) where.title = { contains: search, mode: 'insensitive' };
    if (department) where.departmentId = department;
    if (difficulty) where.difficulty = difficulty;

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          instructor: { select: { id: true, name: true, profilePhoto: true } },
          department: { select: { name: true } },
          _count: { select: { enrollments: true, modules: true } },
        },
      }),
      prisma.course.count({ where }),
    ]);

    res.json({ courses, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/courses/:id
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: {
        instructor: { select: { id: true, name: true, profilePhoto: true, bio: true } },
        department: { select: { name: true } },
        modules: {
          where: { isPublished: true },
          orderBy: { order: 'asc' },
          include: {
            lessons: { where: { isPublished: true }, orderBy: { order: 'asc' }, select: { id: true, title: true, duration: true, order: true } },
            _count: { select: { lessons: true, resources: true } },
          },
        },
        _count: { select: { enrollments: true, modules: true, announcements: true } },
      },
    });

    if (!course) return res.status(404).json({ error: 'Course not found' });

    let isEnrolled = false;
    let enrollment = null;
    if (req.userId) {
      enrollment = await prisma.enrollment.findUnique({
        where: { studentId_courseId: { studentId: req.userId, courseId: course.id } },
      });
      isEnrolled = !!enrollment;
    }

    res.json({ course, isEnrolled, enrollment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/courses/:id/enroll
router.post('/:id/enroll', authenticate, authorize('student'), async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course || !course.isPublished) return res.status(404).json({ error: 'Course not found' });

    const existing = await prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId: req.userId, courseId } },
    });
    if (existing) return res.status(400).json({ error: 'Already enrolled' });

    const enrollment = await prisma.enrollment.create({
      data: { studentId: req.userId, courseId },
      include: { course: { select: { title: true } } },
    });

    res.status(201).json({ enrollment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/courses (teacher/admin)
router.post('/', authenticate, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { title, description, thumbnail, departmentId, difficulty, duration, credits, tags } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const course = await prisma.course.create({
      data: {
        title,
        description,
        thumbnail,
        instructorId: req.userId,
        departmentId,
        difficulty: difficulty || 'beginner',
        duration,
        credits: credits || 0,
        tags: tags || [],
      },
    });

    res.status(201).json({ course });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/courses/:id
router.put('/:id', authenticate, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const course = await prisma.course.findUnique({ where: { id: req.params.id } });
    if (!course) return res.status(404).json({ error: 'Course not found' });
    if (req.userRole !== 'admin' && course.instructorId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updated = await prisma.course.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        version: { increment: 1 },
      },
    });

    res.json({ course: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/courses/:id
router.delete('/:id', authenticate, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const course = await prisma.course.findUnique({ where: { id: req.params.id } });
    if (!course) return res.status(404).json({ error: 'Course not found' });
    if (req.userRole !== 'admin' && course.instructorId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.course.delete({ where: { id: req.params.id } });
    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Module CRUD
router.post('/:courseId/modules', authenticate, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { title, description } = req.body;
    const courseId = req.params.courseId;
    const lastModule = await prisma.module.findFirst({
      where: { courseId },
      orderBy: { order: 'desc' },
    });

    const module = await prisma.module.create({
      data: { courseId, title, description, order: (lastModule?.order || 0) + 1 },
    });

    res.status(201).json({ module });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/modules/:id', authenticate, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const module = await prisma.module.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ module });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/modules/:id', authenticate, authorize('teacher', 'admin'), async (req, res) => {
  try {
    await prisma.module.delete({ where: { id: req.params.id } });
    res.json({ message: 'Module deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lesson CRUD
router.post('/modules/:moduleId/lessons', authenticate, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { title, content, videoUrl, duration } = req.body;
    const moduleId = req.params.moduleId;
    const lastLesson = await prisma.lesson.findFirst({
      where: { moduleId },
      orderBy: { order: 'desc' },
    });

    const lesson = await prisma.lesson.create({
      data: { moduleId, title, content, videoUrl, duration: parseInt(duration) || 0, order: (lastLesson?.order || 0) + 1 },
    });

    res.status(201).json({ lesson });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/lessons/:id', authenticate, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const lesson = await prisma.lesson.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ lesson });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/lessons/:id', authenticate, authorize('teacher', 'admin'), async (req, res) => {
  try {
    await prisma.lesson.delete({ where: { id: req.params.id } });
    res.json({ message: 'Lesson deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/courses/:courseId/announcements
router.get('/:courseId/announcements', optionalAuth, async (req, res) => {
  try {
    const announcements = await prisma.announcement.findMany({
      where: { courseId: req.params.courseId },
      orderBy: { publishedAt: 'desc' },
      include: { author: { select: { name: true, profilePhoto: true } } },
    });
    res.json({ announcements });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;