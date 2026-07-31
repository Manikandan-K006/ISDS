const router = require('express').Router();
const prisma = require('../prisma');
const { authenticate, authorize } = require('../middleware/auth');

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
    const assignment = await prisma.assignment.update({ where: { id: req.params.id }, data: req.body });
    res.json({ assignment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authorize('teacher', 'admin'), async (req, res) => {
  try {
    await prisma.assignment.delete({ where: { id: req.params.id } });
    res.json({ message: 'Assignment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;