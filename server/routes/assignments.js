const router = require('express').Router();
const prisma = require('../prisma');
const { authenticate, authorize } = require('../middleware/auth');
const { canManageCourse } = require('../utils/access');

router.use(authenticate);

// GET /api/assignments/course/:courseId
router.get('/course/:courseId', async (req, res) => {
  try {
    const assignments = await prisma.assignment.findMany({
      where: { courseId: req.params.courseId },
      orderBy: { dueDate: 'asc' },
      include: {
        _count: { select: { submissions: true } },
        submissions: { where: { studentId: req.userId }, select: { id: true, status: true, marks: true, submittedAt: true } },
      },
    });
    res.json({ assignments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/assignments
router.post('/', authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { courseId, title, description, instructions, dueDate, maxMarks, passingMarks, allowLateSubmission, lateSubmissionDeadline, rubrics } = req.body;
    if (!(await canManageCourse(prisma, req.userId, req.userRole, courseId))) {
      return res.status(403).json({ error: 'You can only create assignments for your own courses' });
    }
    const assignment = await prisma.assignment.create({
      data: {
        courseId, title, description, instructions, dueDate: new Date(dueDate),
        maxMarks: parseFloat(maxMarks) || 100, passingMarks: parseFloat(passingMarks) || 40,
        allowLateSubmission, lateSubmissionDeadline: lateSubmissionDeadline ? new Date(lateSubmissionDeadline) : null,
        rubrics, createdById: req.userId,
      },
    });

    const enrollments = await prisma.enrollment.findMany({ where: { courseId }, select: { studentId: true } });
    await prisma.notification.createMany({
      data: enrollments.map(e => ({
        userId: e.studentId, title: 'New Assignment', message: `${title} has been posted`, category: 'assignment', link: `/assignments`,
      })),
    });

    res.status(201).json({ assignment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authorize('teacher', 'admin'), async (req, res) => {
  try {
    const existing = await prisma.assignment.findUnique({ where: { id: req.params.id }, select: { courseId: true } });
    if (!existing) return res.status(404).json({ error: 'Assignment not found' });
    if (!(await canManageCourse(prisma, req.userId, req.userRole, existing.courseId))) {
      return res.status(403).json({ error: 'You can only update assignments for your own courses' });
    }
    const assignment = await prisma.assignment.update({ where: { id: req.params.id }, data: req.body });
    res.json({ assignment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authorize('teacher', 'admin'), async (req, res) => {
  try {
    const existing = await prisma.assignment.findUnique({ where: { id: req.params.id }, select: { courseId: true } });
    if (!existing) return res.status(404).json({ error: 'Assignment not found' });
    if (!(await canManageCourse(prisma, req.userId, req.userRole, existing.courseId))) {
      return res.status(403).json({ error: 'You can only delete assignments for your own courses' });
    }
    await prisma.assignment.delete({ where: { id: req.params.id } });
    res.json({ message: 'Assignment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;