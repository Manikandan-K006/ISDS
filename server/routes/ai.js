const router = require('express').Router();
const prisma = require('../prisma');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// AI Study Plan
router.get('/study-plan', authorize('student'), async (req, res) => {
  try {
    let plan = await prisma.aIStudyPlan.findFirst({
      where: { studentId: req.userId, isActive: true },
    });
    if (!plan) {
      // Generate a basic plan from real data
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId: req.userId },
        include: { course: { select: { title: true, difficulty: true } } },
      });

      const upcomingAssignments = await prisma.assignment.findMany({
        where: {
          status: 'published',
          dueDate: { gte: new Date() },
          course: { enrollments: { some: { studentId: req.userId } } },
        },
        orderBy: { dueDate: 'asc' },
        take: 5,
      });

      const schedule = {
        monday: [{ time: '09:00', task: 'Review course materials', course: enrollments[0]?.course.title }],
        tuesday: [{ time: '09:00', task: 'Complete assignments', assignment: upcomingAssignments[0]?.title }],
        wednesday: [{ time: '09:00', task: 'Study & practice', course: enrollments[1]?.course.title }],
        thursday: [{ time: '09:00', task: 'Review & revise' }],
        friday: [{ time: '09:00', task: 'Weekly assessment prep' }],
      };

      plan = await prisma.aIStudyPlan.create({
        data: {
          studentId: req.userId,
          title: 'Personalized Study Plan',
          goals: { shortTerm: 'Complete pending assignments', longTerm: 'Master all enrolled courses' },
          schedule,
          isActive: true,
        },
      });
    }
    res.json({ plan });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Insights
router.get('/insights', async (req, res) => {
  try {
    const insights = await prisma.aIInsight.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    res.json({ insights });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Weakness Detection
router.get('/weaknesses', authorize('student'), async (req, res) => {
  try {
    const [quizResults, submissions] = await Promise.all([
      prisma.quizResult.findMany({
        where: { studentId: req.userId },
        include: { quiz: { select: { title: true, passingScore: true } } },
      }),
      prisma.assignmentSubmission.findMany({
        where: { studentId: req.userId, status: 'graded' },
        include: { assignment: { select: { title: true, maxMarks: true } } },
      }),
    ]);

    const weaknesses = [];
    const failedQuizzes = quizResults.filter(q => !q.passed);
    if (failedQuizzes.length > 0) {
      weaknesses.push({ area: 'Quiz Performance', message: `Failed ${failedQuizzes.length} quizzes`, score: Math.round(failedQuizzes.reduce((s, q) => s + q.percentage, 0) / failedQuizzes.length) });
    }

    const lowGrades = submissions.filter(s => s.marks < s.assignment.maxMarks * 0.6);
    if (lowGrades.length > 0) {
      weaknesses.push({ area: 'Assignments', message: `${lowGrades.length} assignments below 60%`, score: Math.round(lowGrades.reduce((s, a) => s + ((a.marks / a.assignment.maxMarks) * 100), 0) / lowGrades.length) });
    }

    res.json({ weaknesses });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Performance Prediction
router.get('/prediction', authorize('student'), async (req, res) => {
  try {
    const quizResults = await prisma.quizResult.findMany({
      where: { studentId: req.userId },
      orderBy: { attemptedAt: 'asc' },
    });

    const avgScore = quizResults.length > 0
      ? quizResults.reduce((s, q) => s + q.percentage, 0) / quizResults.length
      : 0;

    const trend = quizResults.length >= 2
      ? (quizResults[quizResults.length - 1].percentage - quizResults[0].percentage) / quizResults.length
      : 0;

    res.json({
      predictedScore: Math.min(100, Math.max(0, avgScore + trend * 5)),
      trend: trend > 0 ? 'improving' : trend < 0 ? 'declining' : 'stable',
      confidence: quizResults.length >= 5 ? 'high' : quizResults.length >= 2 ? 'medium' : 'low',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Dashboard Insights
router.get('/dashboard-insights', async (req, res) => {
  try {
    const [userActivity, notifications, messages] = await Promise.all([
      prisma.activityLog.findMany({ where: { userId: req.userId }, orderBy: { createdAt: 'desc' }, take: 5 }),
      prisma.notification.count({ where: { userId: req.userId, isRead: false } }),
      prisma.message.count({ where: { receiverId: req.userId, isRead: false } }),
    ]);

    const insights = [
      { type: 'info', title: 'Activity', description: `${userActivity.length} recent activities logged` },
      { type: 'info', title: 'Notifications', description: `${notifications} unread notifications` },
      { type: 'info', title: 'Messages', description: `${messages} unread messages` },
    ];

    res.json({ insights });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;