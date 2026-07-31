const router = require('express').Router();
const prisma = require('../prisma');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// GET /api/analytics/enrollment-trend
router.get('/enrollment-trend', authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;
    const enrollments = await prisma.enrollment.findMany({
      orderBy: { enrolledAt: 'asc' },
      select: { enrolledAt: true, course: { select: { title: true } } },
    });
    res.json({ enrollments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/attendance-trend
router.get('/attendance-trend', authorize('admin', 'teacher'), async (req, res) => {
  try {
    const records = await prisma.attendance.findMany({
      orderBy: { date: 'asc' },
      select: { date: true, status: true },
    });
    res.json({ records });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/assignment-completion
router.get('/assignment-completion', authorize('admin', 'teacher'), async (req, res) => {
  try {
    const submissions = await prisma.assignmentSubmission.findMany({
      include: { assignment: { select: { title: true, course: { select: { title: true } } } } },
    });
    res.json({ submissions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/teacher-productivity
router.get('/teacher-productivity', authorize('admin'), async (req, res) => {
  try {
    const teachers = await prisma.user.findMany({
      where: { role: 'teacher' },
      select: {
        id: true, name: true, profilePhoto: true,
        _count: { select: { coursesTaught: true } },
        coursesTaught: {
          select: {
            _count: { select: { enrollments: true, assignments: true } },
          },
        },
      },
    });
    res.json({ teachers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/student-performance
router.get('/student-performance', authorize('admin', 'teacher'), async (req, res) => {
  try {
    const students = await prisma.user.findMany({
      where: { role: 'student' },
      select: {
        id: true, name: true, profilePhoto: true, class: true,
        _count: { select: { enrollments: true, submissions: true, quizResults: true } },
      },
    });
    res.json({ students });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/course-completion
router.get('/course-completion', authorize('admin'), async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      select: {
        id: true, title: true,
        enrollments: { select: { isCompleted: true, progress: true } },
      },
    });
    res.json({ courses });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/quiz-statistics
router.get('/quiz-statistics', authorize('admin', 'teacher'), async (req, res) => {
  try {
    const quizzes = await prisma.quiz.findMany({
      include: {
        _count: { select: { results: true } },
        results: { select: { percentage: true, passed: true } },
      },
    });
    res.json({ quizzes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/monthly-reports
router.get('/monthly-reports', authorize('admin'), async (req, res) => {
  try {
    const now = new Date();
    const sixMonthsAgo = new Date(now.setMonth(now.getMonth() - 6));
    const [enrollments, attendance, submissions] = await Promise.all([
      prisma.enrollment.count({ where: { enrolledAt: { gte: sixMonthsAgo } } }),
      prisma.attendance.count({ where: { date: { gte: sixMonthsAgo } } }),
      prisma.assignmentSubmission.count({ where: { submittedAt: { gte: sixMonthsAgo } } }),
    ]);
    res.json({ enrollments, attendance, submissions, period: '6months' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;