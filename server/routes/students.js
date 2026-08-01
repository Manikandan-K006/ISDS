const router = require('express').Router();
const prisma = require('../prisma');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// GET /api/students/dashboard
router.get('/dashboard', authorize('student'), async (req, res) => {
  try {
    const studentId = req.userId;

    const [enrollments, assignments, attendance, quizResults, notifications] = await Promise.all([
      prisma.enrollment.findMany({
        where: { studentId },
        include: {
          course: { select: { id: true, title: true, thumbnail: true, difficulty: true, instructor: { select: { name: true } } } },
        },
        orderBy: { enrolledAt: 'desc' },
      }),
      prisma.assignmentSubmission.findMany({
        where: { studentId },
        include: { assignment: { select: { id: true, title: true, dueDate: true, maxMarks: true, course: { select: { title: true } } } } },
        orderBy: { submittedAt: 'desc' },
        take: 10,
      }),
      prisma.attendance.findMany({
        where: { studentId },
        orderBy: { date: 'desc' },
        take: 30,
      }),
      prisma.quizResult.findMany({
        where: { studentId },
        include: { quiz: { select: { title: true } } },
        orderBy: { attemptedAt: 'desc' },
        take: 10,
      }),
      prisma.notification.findMany({
        where: { userId: studentId, isRead: false },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    // Calculate stats
    const totalCourses = enrollments.length;
    const completedCourses = enrollments.filter(e => e.isCompleted).length;
    const avgProgress = enrollments.length > 0
      ? enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length
      : 0;
    const presentDays = attendance.filter(a => a.status === 'present').length;
    const totalDays = attendance.length || 1;
    const attendanceRate = Math.round((presentDays / totalDays) * 100);
    const avgQuizScore = quizResults.length > 0
      ? quizResults.reduce((sum, q) => sum + q.percentage, 0) / quizResults.length
      : 0;

    // Get upcoming deadlines
    const upcomingAssignments = await prisma.assignment.findMany({
      where: {
        status: 'published',
        dueDate: { gte: new Date() },
        course: { enrollments: { some: { studentId } } },
      },
      orderBy: { dueDate: 'asc' },
      take: 5,
      include: { course: { select: { title: true } } },
    });

    res.json({
      enrollments,
      assignments,
      attendance,
      quizResults,
      notifications,
      upcomingAssignments,
      stats: {
        totalCourses,
        completedCourses,
        avgProgress: Math.round(avgProgress),
        attendanceRate,
        avgQuizScore: Math.round(avgQuizScore),
        pendingAssignments: assignments.filter(a => a.status !== 'graded').length,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/students/courses
router.get('/courses', authorize('student'), async (req, res) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: req.userId },
      include: {
        course: {
          include: {
            instructor: { select: { name: true, profilePhoto: true } },
            modules: { where: { isPublished: true }, select: { id: true, title: true, _count: { select: { lessons: true } } } },
            _count: { select: { modules: true, enrollments: true } },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    res.json({ enrollments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/students/progress/:courseId
router.get('/progress/:courseId', authorize('student'), async (req, res) => {
  try {
    const { courseId } = req.params;
    const enrollment = await prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId: req.userId, courseId } },
      include: {
        course: {
          include: {
            modules: {
              where: { isPublished: true },
              orderBy: { order: 'asc' },
              include: {
                lessons: {
                  where: { isPublished: true },
                  orderBy: { order: 'asc' },
                  include: {
                    progress: { where: { studentId: req.userId } },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!enrollment) return res.status(404).json({ error: 'Enrollment not found' });

    res.json({ enrollment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/students/lessons/:lessonId/progress
router.post('/lessons/:lessonId/progress', authorize('student'), async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { completed, timeSpent } = req.body;

    const progress = await prisma.lessonProgress.upsert({
      where: { studentId_lessonId: { studentId: req.userId, lessonId } },
      update: { completed: completed || false, timeSpent: timeSpent || 0, lastAccessed: new Date() },
      create: { studentId: req.userId, lessonId, completed: completed || false, timeSpent: timeSpent || 0 },
    });

    // Update enrollment progress
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: { include: { course: true } } },
    });

    if (lesson) {
      const totalLessons = await prisma.lesson.count({
        where: { module: { courseId: lesson.module.courseId }, isPublished: true },
      });
      const completedLessons = await prisma.lessonProgress.count({
        where: { studentId: req.userId, completed: true, lesson: { module: { courseId: lesson.module.courseId } } },
      });
      const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      await prisma.enrollment.update({
        where: { studentId_courseId: { studentId: req.userId, courseId: lesson.module.courseId } },
        data: { progress: progressPct, isCompleted: progressPct >= 100 },
      });
    }

    res.json({ progress });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/students/attendance
router.get('/attendance', authorize('student'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = { studentId: req.userId };
    if (startDate) where.date = { gte: new Date(startDate) };
    if (endDate) where.date = { ...where.date, lte: new Date(endDate) };

    const records = await prisma.attendance.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    const stats = {
      present: records.filter(r => r.status === 'present').length,
      absent: records.filter(r => r.status === 'absent').length,
      late: records.filter(r => r.status === 'late').length,
      leave: records.filter(r => r.status === 'leave').length,
      total: records.length,
    };

    res.json({ records, stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/students/assignments
router.get('/assignments', authorize('student'), async (req, res) => {
  try {
    const submissions = await prisma.assignmentSubmission.findMany({
      where: { studentId: req.userId },
      include: {
        assignment: {
          include: { course: { select: { id: true, title: true } } },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    // Get pending assignments
    const pendingAssignments = await prisma.assignment.findMany({
      where: {
        status: 'published',
        course: { enrollments: { some: { studentId: req.userId } } },
        submissions: { none: { studentId: req.userId } },
      },
      include: { course: { select: { id: true, title: true } } },
      orderBy: { dueDate: 'asc' },
    });

    res.json({ submissions, pendingAssignments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/students/assignments/:id/submit
router.post('/assignments/:id/submit', authorize('student'), async (req, res) => {
  try {
    const { id } = req.params;
    const { content, attachments } = req.body;

    const assignment = await prisma.assignment.findUnique({ where: { id } });
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

    const isLate = new Date() > assignment.dueDate;
    if (isLate && !assignment.allowLateSubmission) {
      return res.status(400).json({ error: 'Submission deadline has passed' });
    }

    const submission = await prisma.assignmentSubmission.upsert({
      where: { assignmentId_studentId: { assignmentId: id, studentId: req.userId } },
      update: { content, attachments: attachments || [], status: isLate ? 'late' : 'submitted', submittedAt: new Date() },
      create: { assignmentId: id, studentId: req.userId, content, attachments: attachments || [], status: isLate ? 'late' : 'submitted' },
    });

    // Create notification for teacher
    const course = await prisma.course.findUnique({ where: { id: assignment.courseId } });
    await prisma.notification.create({
      data: {
        userId: course.instructorId,
        title: 'New Assignment Submission',
        message: `${req.user.name} submitted "${assignment.title}"`,
        category: 'assignment',
        link: `/admin/assignments`,
      },
    });

    res.json({ submission });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/students/leaderboard
router.get('/leaderboard', authorize('student'), async (req, res) => {
  try {
    const { period = 'all' } = req.query;
    const entries = await prisma.leaderboardEntry.findMany({
      where: { period },
      orderBy: { points: 'desc' },
      take: 50,
      include: { user: { select: { id: true, name: true, profilePhoto: true, class: true } } },
    });

    const myEntry = entries.find(e => e.userId === req.userId);
    res.json({ entries, myEntry });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/students/achievements
router.get('/achievements', authorize('student'), async (req, res) => {
  try {
    const achievements = await prisma.userAchievement.findMany({
      where: { userId: req.userId },
      include: { achievement: true },
      orderBy: { earnedAt: 'desc' },
    });

    const allAchievements = await prisma.achievement.findMany();
    res.json({ achievements, allAchievements });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/students/skills
router.get('/skills', authorize('student'), async (req, res) => {
  try {
    const skills = await prisma.userSkill.findMany({
      where: { userId: req.userId },
      include: { skill: true },
      orderBy: { level: 'desc' },
    });
    res.json({ skills });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/students/calendar
router.get('/calendar', authorize('student'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = {
      OR: [
        { userId: req.userId },
        { userId: null },
      ],
    };
    if (startDate) where.startDate = { gte: new Date(startDate) };
    if (endDate) where.endDate = { ...where.endDate, lte: new Date(endDate) };

    const events = await prisma.calendarEvent.findMany({
      where,
      orderBy: { startDate: 'asc' },
    });

    res.json({ events });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/students/quiz-results
router.get('/quiz-results', authorize('student'), async (req, res) => {
  try {
    const results = await prisma.quizResult.findMany({
      where: { studentId: req.userId },
      include: { quiz: { select: { id: true, title: true, passingScore: true, course: { select: { title: true } } } } },
      orderBy: { attemptedAt: 'desc' },
    });
    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/students/certificates
router.get('/certificates', authorize('student'), async (req, res) => {
  try {
    const certificates = await prisma.certificate.findMany({
      where: { studentId: req.userId },
      include: { course: { select: { title: true, thumbnail: true } } },
      orderBy: { issuedAt: 'desc' },
    });
    res.json({ certificates });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/students/analytics
router.get('/analytics', authorize('student'), async (req, res) => {
  try {
    const studentId = req.userId;

    // Weekly attendance trend
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const attendanceRecords = await prisma.attendance.findMany({
      where: { studentId, date: { gte: thirtyDaysAgo } },
      orderBy: { date: 'asc' },
    });

    // Quiz performance trend
    const quizResults = await prisma.quizResult.findMany({
      where: { studentId },
      orderBy: { attemptedAt: 'asc' },
      take: 20,
    });

    // Course progress
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId },
      include: { course: { select: { title: true } } },
    });

    // Assignment grades
    const submissions = await prisma.assignmentSubmission.findMany({
      where: { studentId, status: 'graded' },
      include: { assignment: { select: { title: true, maxMarks: true } } },
    });

    res.json({
      attendanceTrend: attendanceRecords,
      quizPerformance: quizResults,
      courseProgress: enrollments,
      assignmentGrades: submissions,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/students/profile
router.get('/profile', authorize('student'), async (req, res) => {
  try {
    const studentId = req.userId;
    const [user, internships, researchPapers] = await Promise.all([
      prisma.user.findUnique({
        where: { id: studentId },
        include: { department: true, program: true, facultyAdvisor: { select: { id: true, name: true, email: true, subject: true } } },
      }),
      prisma.internship.findMany({ where: { studentId }, orderBy: { createdAt: 'desc' } }),
      prisma.researchPaper.findMany({ where: { studentId }, orderBy: { createdAt: 'desc' } }),
    ]);
    if (!user) return res.status(404).json({ error: 'Student not found' });
    res.json({
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        bio: user.bio,
        profilePhoto: user.profilePhoto,
        registerNumber: user.registerNumber,
        rollNumber: user.rollNumber,
        class: user.class,
        section: user.section,
        semester: user.semester,
        batch: user.batch,
        departmentId: user.departmentId,
        department: user.department?.name || null,
        programId: user.programId,
        program: user.program?.name || null,
        facultyAdvisorId: user.facultyAdvisorId,
        facultyAdvisor: user.facultyAdvisor || null,
        cgpa: user.cgpa,
        currentSemesterGpa: user.currentSemesterGpa,
        creditsEarned: user.creditsEarned,
        creditsRequired: user.creditsRequired,
        backlogs: user.backlogs,
        placementStatus: user.placementStatus,
        careerGoal: user.careerGoal,
        github: user.github,
        leetcode: user.leetcode,
        codeforces: user.codeforces,
        hackerrank: user.hackerrank,
        codingProblemsSolved: user.codingProblemsSolved,
        codingStreak: user.codingStreak,
      },
      internships,
      researchPapers,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/students/profile
router.put('/profile', authorize('student'), async (req, res) => {
  try {
    const {
      name, phone, bio, profilePhoto,
      registerNumber, section, semester, batch, programId, facultyAdvisorId,
      cgpa, currentSemesterGpa, creditsEarned, creditsRequired, backlogs,
      placementStatus, careerGoal, github, leetcode, codeforces, hackerrank,
    } = req.body;
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: {
        name, phone, bio, profilePhoto,
        registerNumber, section,
        semester: semester !== undefined && semester !== null && semester !== '' ? parseInt(semester) : undefined,
        batch, programId, facultyAdvisorId,
        cgpa: cgpa !== undefined && cgpa !== null && cgpa !== '' ? parseFloat(cgpa) : undefined,
        currentSemesterGpa: currentSemesterGpa !== undefined && currentSemesterGpa !== null && currentSemesterGpa !== '' ? parseFloat(currentSemesterGpa) : undefined,
        creditsEarned: creditsEarned !== undefined && creditsEarned !== null && creditsEarned !== '' ? parseInt(creditsEarned) : undefined,
        creditsRequired: creditsRequired !== undefined && creditsRequired !== null && creditsRequired !== '' ? parseInt(creditsRequired) : undefined,
        backlogs: backlogs !== undefined && backlogs !== null && backlogs !== '' ? parseInt(backlogs) : undefined,
        placementStatus, careerGoal, github, leetcode, codeforces, hackerrank,
      },
      select: { id: true, name: true, email: true, phone: true, bio: true, profilePhoto: true, role: true, class: true, rollNumber: true, registerNumber: true, section: true, semester: true, batch: true, programId: true, departmentId: true, cgpa: true, currentSemesterGpa: true, creditsEarned: true, creditsRequired: true, backlogs: true, placementStatus: true, careerGoal: true, github: true, leetcode: true, codeforces: true, hackerrank: true },
    });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------------------------------------------------
// Internships (student-owned CRUD)
// ------------------------------------------------------------
router.get('/internships', authorize('student'), async (req, res) => {
  try {
    const internships = await prisma.internship.findMany({ where: { studentId: req.userId }, orderBy: { createdAt: 'desc' } });
    res.json({ internships });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/internships', authorize('student'), async (req, res) => {
  try {
    const { company, role, startDate, endDate, status, offerLetterUrl, completionCertificateUrl, mentorName, summary } = req.body;
    if (!company || !role) return res.status(400).json({ error: 'Company and role are required.' });
    const internship = await prisma.internship.create({
      data: {
        studentId: req.userId, company, role,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        status: status || 'completed', offerLetterUrl, completionCertificateUrl, mentorName, summary,
      },
    });
    res.status(201).json({ internship });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/internships/:id', authorize('student'), async (req, res) => {
  try {
    const existing = await prisma.internship.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.studentId !== req.userId) return res.status(403).json({ error: 'Not authorized' });
    const { company, role, startDate, endDate, status, offerLetterUrl, completionCertificateUrl, mentorName, summary } = req.body;
    const internship = await prisma.internship.update({
      where: { id: req.params.id },
      data: {
        company, role,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        status, offerLetterUrl, completionCertificateUrl, mentorName, summary,
      },
    });
    res.json({ internship });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/internships/:id', authorize('student'), async (req, res) => {
  try {
    const existing = await prisma.internship.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.studentId !== req.userId) return res.status(403).json({ error: 'Not authorized' });
    await prisma.internship.delete({ where: { id: req.params.id } });
    res.json({ message: 'Internship deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------------------------------------------------
// Research papers (student-owned CRUD)
// ------------------------------------------------------------
router.get('/research', authorize('student'), async (req, res) => {
  try {
    const researchPapers = await prisma.researchPaper.findMany({ where: { studentId: req.userId }, orderBy: { createdAt: 'desc' } });
    res.json({ researchPapers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/research', authorize('student'), async (req, res) => {
  try {
    const { title, type, venue, year, authors, doi, link, status } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required.' });
    const paper = await prisma.researchPaper.create({
      data: {
        studentId: req.userId, title, type: type || 'journal', venue,
        year: year ? parseInt(year) : null,
        authors: Array.isArray(authors) ? JSON.stringify(authors) : '[]',
        doi, link, status: status || 'published',
      },
    });
    res.status(201).json({ paper });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/research/:id', authorize('student'), async (req, res) => {
  try {
    const existing = await prisma.researchPaper.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.studentId !== req.userId) return res.status(403).json({ error: 'Not authorized' });
    const { title, type, venue, year, authors, doi, link, status } = req.body;
    const paper = await prisma.researchPaper.update({
      where: { id: req.params.id },
      data: {
        title, type, venue,
        year: year !== undefined && year !== null && year !== '' ? parseInt(year) : null,
        authors: Array.isArray(authors) ? JSON.stringify(authors) : '[]',
        doi, link, status,
      },
    });
    res.json({ paper });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/research/:id', authorize('student'), async (req, res) => {
  try {
    const existing = await prisma.researchPaper.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.studentId !== req.userId) return res.status(403).json({ error: 'Not authorized' });
    await prisma.researchPaper.delete({ where: { id: req.params.id } });
    res.json({ message: 'Research paper deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;