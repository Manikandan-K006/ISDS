const express = require('express');
const router = express.Router();
const { collection, getDoc, queryDocs, countDocs, formatDoc, formatDocs } = require('../config/firestore');

const auth = (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const token = header.split(' ')[1];
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'isds_jwt_secret_key_2024');
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

router.get('/dashboard', auth, async (req, res) => {
  try {
    const totalStudents = await countDocs('users', [['role', '==', 'student']]);
    const totalCourses = await countDocs('courses');
    const totalEnrollments = await countDocs('enrollments');
    const totalAssignments = await countDocs('assignments');
    const totalSubmissions = await countDocs('submissions');
    const totalCertificates = await countDocs('certificates');
    const attendanceRecords = await countDocs('attendance');
    const presentRecords = await countDocs('attendance', [['status', '==', 'present']]);
    const attendanceRate = attendanceRecords > 0 ? Math.round((presentRecords / attendanceRecords) * 100) : 0;
    const completedEnrollments = await countDocs('enrollments', [['status', '==', 'completed']]);
    const completionRate = totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0;

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    const recentEnrollmentsRaw = await queryDocs('enrollments', [['createdAt', '>=', twelveMonthsAgo.toISOString()]], 'createdAt', 'desc');
    const enrollmentsByMonth = {};
    recentEnrollmentsRaw.forEach(e => {
      const m = new Date(e.createdAt).getMonth() + 1;
      enrollmentsByMonth[m] = (enrollmentsByMonth[m] || 0) + 1;
    });

    const coursesRaw = await queryDocs('courses', [], 'createdAt', 'desc');
    const coursesByDomain = {};
    coursesRaw.forEach(c => {
      const d = c.domain || 'Uncategorized';
      coursesByDomain[d] = (coursesByDomain[d] || 0) + 1;
    });

    const studentUsers = await queryDocs('users', [['role', '==', 'student']], 'createdAt', 'desc');
    const registrationsByMonth = {};
    studentUsers.forEach(u => {
      const m = new Date(u.createdAt).getMonth() + 1;
      registrationsByMonth[m] = (registrationsByMonth[m] || 0) + 1;
    });

    const gradedSubmissions = await queryDocs('submissions', [], 'createdAt', 'desc');
    const gradeDistribution = { 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0 };
    gradedSubmissions.forEach(s => {
      if (s.grade == null) return;
      if (s.grade >= 90) gradeDistribution['A']++;
      else if (s.grade >= 80) gradeDistribution['B']++;
      else if (s.grade >= 70) gradeDistribution['C']++;
      else if (s.grade >= 60) gradeDistribution['D']++;
      else gradeDistribution['F']++;
    });

    const recentEnrollments = await queryDocs('enrollments', [], 'createdAt', 'desc');
    const recent10 = recentEnrollments.slice(0, 10);
    const enriched = [];
    for (const e of recent10) {
      const student = e.userId ? await getDoc('users', e.userId) : null;
      const course = e.courseId ? await getDoc('courses', e.courseId) : null;
      enriched.push({
        id: e._id,
        student: student ? { id: student._id, name: student.name, email: student.email } : null,
        course: course ? { id: course._id, title: course.title } : null,
        status: e.status,
        progress: e.progress,
        date: e.createdAt,
      });
    }

    res.json({
      totalStudents,
      totalCourses,
      totalEnrollments,
      totalAssignments,
      totalSubmissions,
      totalCertificates,
      attendanceRate,
      completionRate,
      enrollmentsByMonth: Object.entries(enrollmentsByMonth).map(([month, count]) => ({ month: parseInt(month), count })),
      coursesByDomain: Object.entries(coursesByDomain).map(([name, count]) => ({ name, count })),
      registrationsByMonth: Object.entries(registrationsByMonth).map(([month, count]) => ({ month: parseInt(month), count })),
      gradeDistribution,
      recentEnrollments: enriched,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/student/:id', auth, async (req, res) => {
  try {
    const student = await getDoc('users', req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const enrollments = await queryDocs('enrollments', [['userId', '==', req.params.id]], 'createdAt', 'desc');
    const completedCourses = enrollments.filter(e => e.status === 'completed').length;
    const inProgressCourses = enrollments.filter(e => e.status === 'in-progress').length;
    const avgProgress = enrollments.length > 0
      ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length)
      : 0;

    const totalAttendance = await countDocs('attendance', [['studentId', '==', req.params.id]]);
    const presentDays = await countDocs('attendance', [['studentId', '==', req.params.id], ['status', '==', 'present']]);
    const absentDays = await countDocs('attendance', [['studentId', '==', req.params.id], ['status', '==', 'absent']]);
    const attendancePct = totalAttendance > 0 ? Math.round((presentDays / totalAttendance) * 100) : 0;

    const submissions = await queryDocs('submissions', [['studentId', '==', req.params.id]], 'createdAt', 'desc');
    const graded = submissions.filter(s => s.grade != null);
    const avgGrade = graded.length > 0
      ? Math.round(graded.reduce((sum, s) => sum + (s.grade || 0), 0) / graded.length)
      : 0;
    const allAssignments = await queryDocs('assignments');
    const totalAssignmentsCount = allAssignments.length;
    const pendingAssignments = totalAssignmentsCount - submissions.length;

    const certificatesCount = await countDocs('certificates', [['studentId', '==', req.params.id]]);

    const performanceByCourseMap = {};
    for (const s of graded) {
      const assignment = s.assignmentId ? await getDoc('assignments', s.assignmentId) : null;
      const course = assignment && assignment.courseId ? await getDoc('courses', assignment.courseId) : null;
      const courseTitle = course?.title || 'Unknown';
      if (!performanceByCourseMap[courseTitle]) {
        performanceByCourseMap[courseTitle] = { grades: [], submissions: 0, maxGrade: 0 };
      }
      performanceByCourseMap[courseTitle].grades.push(s.grade);
      performanceByCourseMap[courseTitle].submissions++;
      if (s.grade > performanceByCourseMap[courseTitle].maxGrade) {
        performanceByCourseMap[courseTitle].maxGrade = s.grade;
      }
    }
    const performanceByCourse = Object.entries(performanceByCourseMap).map(([course, data]) => ({
      course,
      avgGrade: Math.round(data.grades.reduce((a, b) => a + b, 0) / data.grades.length),
      submissions: data.submissions,
      maxGrade: data.maxGrade,
    }));

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const attendanceRecords = await queryDocs('attendance', [['studentId', '==', req.params.id]], 'date', 'asc');
    const monthlyAttendanceMap = {};
    attendanceRecords.forEach(a => {
      const d = new Date(a.date);
      if (d >= sixMonthsAgo) {
        const m = d.getMonth() + 1;
        if (!monthlyAttendanceMap[m]) monthlyAttendanceMap[m] = { present: 0, total: 0 };
        monthlyAttendanceMap[m].total++;
        if (a.status === 'present') monthlyAttendanceMap[m].present++;
      }
    });
    const monthlyAttendance = Object.entries(monthlyAttendanceMap).map(([month, data]) => ({
      month: parseInt(month),
      present: data.present,
      total: data.total,
      rate: Math.round((data.present / data.total) * 100),
    }));

    res.json({
      student: { id: student._id, name: student.name, email: student.email, class: student.class, rollNumber: student.rollNumber },
      analytics: {
        totalEnrollments: enrollments.length,
        completedCourses,
        inProgressCourses,
        avgProgress,
        attendancePct,
        totalAttendance,
        presentDays,
        absentDays,
        avgGrade,
        totalAssignments: totalAssignmentsCount,
        submittedAssignments: submissions.length,
        pendingAssignments: Math.max(0, pendingAssignments),
        certificates: certificatesCount,
        performanceByCourse,
        monthlyAttendance,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/courses', auth, async (req, res) => {
  try {
    const courses = await queryDocs('courses', [], 'createdAt', 'desc');
    const result = [];
    for (const course of courses) {
      const enrollments = await countDocs('enrollments', [['courseId', '==', course._id]]);
      const completed = await countDocs('enrollments', [['courseId', '==', course._id], ['status', '==', 'completed']]);
      const assignments = await countDocs('assignments', [['courseId', '==', course._id]]);

      const courseAssignments = await queryDocs('assignments', [['courseId', '==', course._id]]);
      let submissions = 0;
      for (const a of courseAssignments) {
        submissions += await countDocs('submissions', [['assignmentId', '==', a._id]]);
      }

      const certificates = await countDocs('certificates', [['courseId', '==', course._id]]);
      result.push({
        id: course._id,
        title: course.title,
        domain: course.domain,
        difficulty: course.difficulty,
        enrollments,
        completed,
        completionRate: enrollments > 0 ? Math.round((completed / enrollments) * 100) : 0,
        assignments,
        submissions,
        certificates,
      });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
