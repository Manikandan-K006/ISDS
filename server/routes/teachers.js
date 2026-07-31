const router = require('express').Router();
const prisma = require('../prisma');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize('teacher', 'admin'));

// GET /api/teachers/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const teacherId = req.userId;
    const [courses, submissions, todayAttendance] = await Promise.all([
      prisma.course.findMany({
        where: { instructorId: teacherId },
        include: {
          _count: { select: { enrollments: true, modules: true } },
          enrollments: {
            take: 10,
            orderBy: { enrolledAt: 'desc' },
            include: { student: { select: { id: true, name: true, profilePhoto: true } } },
          },
        },
      }),
      prisma.assignmentSubmission.findMany({
        where: {
          assignment: { course: { instructorId: teacherId } },
          status: { in: ['submitted', 'late'] },
        },
        include: {
          assignment: { select: { id: true, title: true, dueDate: true } },
          student: { select: { id: true, name: true, profilePhoto: true } },
        },
        orderBy: { submittedAt: 'desc' },
        take: 20,
      }),
      prisma.attendance.count({
        where: {
          date: new Date(new Date().toDateString()),
          markedById: teacherId,
        },
      }),
    ]);

    const totalStudents = courses.reduce((sum, c) => sum + c._count.enrollments, 0);
    const totalCourses = courses.length;
    const pendingGrading = submissions.length;

    res.json({
      courses,
      submissions,
      todayAttendance,
      stats: { totalStudents, totalCourses, pendingGrading },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/teachers/courses
router.get('/courses', async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      where: { instructorId: req.userId },
      include: {
        department: { select: { name: true } },
        _count: { select: { enrollments: true, modules: true, assignments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ courses });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/teachers/students
router.get('/students', async (req, res) => {
  try {
    const students = await prisma.user.findMany({
      where: {
        role: 'student',
        enrollments: { some: { course: { instructorId: req.userId } } },
      },
      select: {
        id: true,
        name: true,
        email: true,
        profilePhoto: true,
        class: true,
        rollNumber: true,
        _count: { select: { enrollments: true } },
      },
      orderBy: { name: 'asc' },
    });
    res.json({ students });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/teachers/analytics
router.get('/analytics', async (req, res) => {
  try {
    const teacherId = req.userId;
    const courses = await prisma.course.findMany({
      where: { instructorId: teacherId },
      include: {
        enrollments: {
          include: { student: { select: { name: true, profilePhoto: true } } },
        },
        assignments: {
          include: { submissions: true },
        },
      },
    });

    const analytics = courses.map(course => ({
      courseId: course.id,
      courseTitle: course.title,
      totalStudents: course.enrollments.length,
      avgProgress: course.enrollments.length > 0
        ? Math.round(course.enrollments.reduce((s, e) => s + e.progress, 0) / course.enrollments.length)
        : 0,
      assignmentsCount: course.assignments.length,
      submissionsCount: course.assignments.reduce((s, a) => s + a.submissions.length, 0),
      gradedCount: course.assignments.reduce((s, a) => s + a.submissions.filter(sub => sub.status === 'graded').length, 0),
    }));

    res.json({ analytics });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/teachers/gradebook/:courseId
router.get('/gradebook/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    const submissions = await prisma.assignmentSubmission.findMany({
      where: { assignment: { courseId } },
      include: {
        student: { select: { id: true, name: true, profilePhoto: true, rollNumber: true } },
        assignment: { select: { id: true, title: true, maxMarks: true, dueDate: true } },
      },
      orderBy: [{ student: { name: 'asc' } }, { submittedAt: 'desc' }],
    });

    // Group by student
    const gradebook = {};
    submissions.forEach(sub => {
      if (!gradebook[sub.student.id]) {
        gradebook[sub.student.id] = {
          student: sub.student,
          assignments: [],
          totalMarks: 0,
          maxMarks: 0,
        };
      }
      gradebook[sub.student.id].assignments.push(sub);
      gradebook[sub.student.id].totalMarks += sub.marks || 0;
      gradebook[sub.student.id].maxMarks += sub.assignment.maxMarks;
    });

    res.json({ gradebook: Object.values(gradebook) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/teachers/submissions/:id/grade
router.put('/submissions/:id/grade', async (req, res) => {
  try {
    const { id } = req.params;
    const { marks, feedback } = req.body;

    const submission = await prisma.assignmentSubmission.update({
      where: { id },
      data: { marks: parseFloat(marks), feedback, status: 'graded', gradedAt: new Date(), gradedById: req.userId },
      include: { student: { select: { id: true, name: true } }, assignment: { select: { title: true } } },
    });

    // Notify student
    await prisma.notification.create({
      data: {
        userId: submission.studentId,
        title: 'Assignment Graded',
        message: `Your submission for "${submission.assignment.title}" has been graded: ${marks}/${submission.assignment.maxMarks}`,
        category: 'grade',
        link: `/assignments`,
      },
    });

    res.json({ submission });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/teachers/announcements
router.post('/announcements', async (req, res) => {
  try {
    const { courseId, title, content, priority, pinned } = req.body;
    const announcement = await prisma.announcement.create({
      data: { courseId, authorId: req.userId, title, content, priority: priority || 'normal', pinned: pinned || false },
    });

    // Notify all enrolled students
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      select: { studentId: true },
    });
    await prisma.notification.createMany({
      data: enrollments.map(e => ({
        userId: e.studentId,
        title: 'New Announcement',
        message: title,
        category: 'announcement',
        link: `/courses/${courseId}`,
      })),
    });

    res.status(201).json({ announcement });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;