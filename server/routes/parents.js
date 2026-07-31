const router = require('express').Router();
const prisma = require('../prisma');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize('parent'));

// GET /api/parents/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const parent = await prisma.user.findUnique({ where: { id: req.userId } });
    const studentIds = parent.studentIds || [];

    if (studentIds.length === 0) {
      return res.json({ students: [], stats: {} });
    }

    const students = await prisma.user.findMany({
      where: { id: { in: studentIds } },
      select: {
        id: true, name: true, email: true, profilePhoto: true, class: true, rollNumber: true,
      },
    });

    const studentsData = await Promise.all(students.map(async (student) => {
      const [attendance, assignments, quizResults, enrollments] = await Promise.all([
        prisma.attendance.findMany({
          where: { studentId: student.id },
          orderBy: { date: 'desc' },
          take: 30,
        }),
        prisma.assignmentSubmission.findMany({
          where: { studentId: student.id, status: 'graded' },
          include: { assignment: { select: { title: true, maxMarks: true } } },
          orderBy: { submittedAt: 'desc' },
          take: 10,
        }),
        prisma.quizResult.findMany({
          where: { studentId: student.id },
          orderBy: { attemptedAt: 'desc' },
          take: 10,
        }),
        prisma.enrollment.findMany({
          where: { studentId: student.id },
          include: { course: { select: { title: true, thumbnail: true } } },
        }),
      ]);

      const presentDays = attendance.filter(a => a.status === 'present').length;
      const attendanceRate = attendance.length > 0 ? Math.round((presentDays / attendance.length) * 100) : 0;
      const avgScore = quizResults.length > 0
        ? Math.round(quizResults.reduce((s, q) => s + q.percentage, 0) / quizResults.length)
        : 0;

      return {
        ...student,
        attendanceRate,
        avgScore,
        totalCourses: enrollments.length,
        completedAssignments: assignments.length,
        recentGrades: assignments.slice(0, 5),
        enrollments,
      };
    }));

    res.json({ students: studentsData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/parents/students/:studentId/performance
router.get('/students/:studentId/performance', async (req, res) => {
  try {
    const parent = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!(parent.studentIds || []).includes(req.params.studentId)) {
      return res.status(403).json({ error: 'Not authorized to view this student' });
    }

    const [attendance, assignments, quizResults, enrollments] = await Promise.all([
      prisma.attendance.findMany({
        where: { studentId: req.params.studentId },
        orderBy: { date: 'desc' },
      }),
      prisma.assignmentSubmission.findMany({
        where: { studentId: req.params.studentId },
        include: { assignment: { select: { title: true, maxMarks: true, dueDate: true } } },
        orderBy: { submittedAt: 'desc' },
      }),
      prisma.quizResult.findMany({
        where: { studentId: req.params.studentId },
        include: { quiz: { select: { title: true, passingScore: true } } },
        orderBy: { attemptedAt: 'desc' },
      }),
      prisma.enrollment.findMany({
        where: { studentId: req.params.studentId },
        include: { course: { select: { id: true, title: true, thumbnail: true, difficulty: true } } },
      }),
    ]);

    res.json({ attendance, assignments, quizResults, enrollments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/parents/students/:studentId/report
router.get('/students/:studentId/report', async (req, res) => {
  try {
    const parent = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!(parent.studentIds || []).includes(req.params.studentId)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const student = await prisma.user.findUnique({
      where: { id: req.params.studentId },
      select: { id: true, name: true, email: true, class: true, rollNumber: true, profilePhoto: true },
    });

    const [attendance, assignments, quizResults, enrollments] = await Promise.all([
      prisma.attendance.findMany({ where: { studentId: req.params.studentId } }),
      prisma.assignmentSubmission.findMany({
        where: { studentId: req.params.studentId, status: 'graded' },
        include: { assignment: { select: { title: true, maxMarks: true } } },
      }),
      prisma.quizResult.findMany({ where: { studentId: req.params.studentId } }),
      prisma.enrollment.findMany({
        where: { studentId: req.params.studentId },
        include: { course: { select: { title: true } } },
      }),
    ]);

    const presentCount = attendance.filter(a => a.status === 'present').length;
    const attendanceRate = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0;
    const avgGrade = assignments.length > 0
      ? Math.round(assignments.reduce((s, a) => s + ((a.marks / a.assignment.maxMarks) * 100), 0) / assignments.length)
      : 0;
    const avgQuizScore = quizResults.length > 0
      ? Math.round(quizResults.reduce((s, q) => s + q.percentage, 0) / quizResults.length)
      : 0;

    res.json({
      student,
      report: {
        attendance: { rate: attendanceRate, present: presentCount, total: attendance.length },
        grades: { average: avgGrade, total: assignments.length },
        quizzes: { average: avgQuizScore, total: quizResults.length },
        courses: enrollments.map(e => ({ title: e.course.title, progress: e.progress, completed: e.isCompleted })),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/parents/ai-summary/:studentId
router.get('/ai-summary/:studentId', async (req, res) => {
  try {
    const parent = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!(parent.studentIds || []).includes(req.params.studentId)) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Get AI insights for this student
    const insights = await prisma.aIInsight.findMany({
      where: { userId: req.params.studentId, type: 'summary' },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });

    // Generate summary from real data
    const [attendance, assignments, quizResults] = await Promise.all([
      prisma.attendance.findMany({ where: { studentId: req.params.studentId }, orderBy: { date: 'desc' }, take: 30 }),
      prisma.assignmentSubmission.findMany({
        where: { studentId: req.params.studentId, status: 'graded' },
        include: { assignment: { select: { title: true, maxMarks: true } } },
      }),
      prisma.quizResult.findMany({ where: { studentId: req.params.studentId }, orderBy: { attemptedAt: 'desc' }, take: 5 }),
    ]);

    const attendanceRate = attendance.length > 0
      ? Math.round((attendance.filter(a => a.status === 'present').length / attendance.length) * 100)
      : 0;
    const avgGrade = assignments.length > 0
      ? Math.round(assignments.reduce((s, a) => s + ((a.marks / a.assignment.maxMarks) * 100), 0) / assignments.length)
      : 0;

    const summary = {
      attendance: `${attendanceRate}% attendance rate over the last ${attendance.length} days`,
      performance: assignments.length > 0 ? `Average grade: ${avgGrade}% across ${assignments.length} assignments` : 'No graded assignments yet',
      quizzes: quizResults.length > 0 ? `Recent quiz average: ${Math.round(quizResults.reduce((s, q) => s + q.percentage, 0) / quizResults.length)}%` : 'No quizzes attempted',
      strengths: avgGrade >= 80 ? 'Strong academic performance' : attendanceRate >= 90 ? 'Excellent attendance' : 'Making steady progress',
      areasToImprove: avgGrade < 70 ? 'Consider focusing on assignments and seeking help' : attendanceRate < 80 ? 'Attendance could be improved' : 'Continue the good work',
    };

    res.json({ summary, insights: insights[0] || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;