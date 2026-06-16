const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Attendance = require('../models/Attendance');
const Certificate = require('../models/Certificate');

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

// GET /api/analytics/dashboard - Main analytics data for admin/teacher dashboard
router.get('/dashboard', auth, async (req, res) => {
  try {
    // Real counts from database
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalCourses = await Course.countDocuments();
    const totalEnrollments = await Enrollment.countDocuments();
    const totalAssignments = await Assignment.countDocuments();
    const totalSubmissions = await Submission.countDocuments();
    const totalCertificates = await Certificate.countDocuments();

    // Attendance rate: count present vs total attendance records
    const attendanceRecords = await Attendance.countDocuments();
    const presentRecords = await Attendance.countDocuments({ status: 'present' });
    const attendanceRate = attendanceRecords > 0 ? Math.round((presentRecords / attendanceRecords) * 100) : 0;

    // Completion rate: completed enrollments vs total
    const completedEnrollments = await Enrollment.countDocuments({ status: 'completed' });
    const completionRate = totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0;

    // Enrollments by month (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    const enrollmentsByMonth = await Enrollment.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      { $group: { _id: { $month: '$createdAt' }, count: { $sum: 1 } } },
      { $sort: { '_id': 1 } }
    ]);

    // Course distribution by domain
    const coursesByDomain = await Course.aggregate([
      { $group: { _id: '$domain', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Student registrations by month
    const registrationsByMonth = await User.aggregate([
      { $match: { role: 'student', createdAt: { $gte: twelveMonthsAgo } } },
      { $group: { _id: { $month: '$createdAt' }, count: { $sum: 1 } } },
      { $sort: { '_id': 1 } }
    ]);

    // Grade distribution
    const gradedSubmissions = await Submission.find({ grade: { $exists: true, $ne: null } });
    const gradeDistribution = { 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0 };
    gradedSubmissions.forEach(s => {
      if (s.grade >= 90) gradeDistribution['A']++;
      else if (s.grade >= 80) gradeDistribution['B']++;
      else if (s.grade >= 70) gradeDistribution['C']++;
      else if (s.grade >= 60) gradeDistribution['D']++;
      else gradeDistribution['F']++;
    });

    // Recent enrollments (last 10)
    const recentEnrollments = await Enrollment.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name email')
      .populate('courseId', 'title');

    res.json({
      totalStudents,
      totalCourses,
      totalEnrollments,
      totalAssignments,
      totalSubmissions,
      totalCertificates,
      attendanceRate,
      completionRate,
      enrollmentsByMonth: enrollmentsByMonth.map(e => ({ month: e._id, count: e.count })),
      coursesByDomain: coursesByDomain.map(c => ({ name: c._id || 'Uncategorized', count: c.count })),
      registrationsByMonth: registrationsByMonth.map(r => ({ month: r._id, count: r.count })),
      gradeDistribution,
      recentEnrollments: recentEnrollments.map(e => ({
        id: e._id,
        student: e.userId ? { id: e.userId._id, name: e.userId.name, email: e.userId.email } : null,
        course: e.courseId ? { id: e.courseId._id, title: e.courseId.title } : null,
        status: e.status,
        progress: e.progress,
        date: e.createdAt,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/student/:id - Analytics for a specific student
router.get('/student/:id', auth, async (req, res) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    // Enrollments & progress
    const enrollments = await Enrollment.find({ userId: req.params.id }).populate('courseId', 'title domain creditPoints');
    const completedCourses = enrollments.filter(e => e.status === 'completed').length;
    const inProgressCourses = enrollments.filter(e => e.status === 'in-progress').length;
    const avgProgress = enrollments.length > 0
      ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length)
      : 0;

    // Attendance
    const totalAttendance = await Attendance.countDocuments({ studentId: req.params.id });
    const presentDays = await Attendance.countDocuments({ studentId: req.params.id, status: 'present' });
    const absentDays = await Attendance.countDocuments({ studentId: req.params.id, status: 'absent' });
    const attendancePct = totalAttendance > 0 ? Math.round((presentDays / totalAttendance) * 100) : 0;

    // Assignments & grades
    const submissions = await Submission.find({ studentId: req.params.id });
    const graded = submissions.filter(s => s.grade != null);
    const avgGrade = graded.length > 0
      ? Math.round(graded.reduce((sum, s) => sum + (s.grade || 0), 0) / graded.length)
      : 0;
    const totalAssignments = await Assignment.countDocuments();
    const pendingAssignments = totalAssignments - submissions.length;

    // Certificates
    const certificates = await Certificate.countDocuments({ studentId: req.params.id });

    // Performance by course
    const performanceByCourse = await Submission.aggregate([
      { $match: { studentId: require('mongoose').Types.ObjectId.createFromHexString(req.params.id), grade: { $exists: true, $ne: null } } },
      { $lookup: { from: 'assignments', localField: 'assignmentId', foreignField: '_id', as: 'assignment' } },
      { $unwind: { path: '$assignment', preserveNullAndEmptyArrays: true } },
      { $lookup: { from: 'courses', localField: 'assignment.courseId', foreignField: '_id', as: 'course' } },
      { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } },
      { $group: { _id: '$course.title', avgGrade: { $avg: '$grade' }, submissions: { $sum: 1 }, maxGrade: { $max: '$grade' } } },
    ]);

    // Monthly attendance (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyAttendance = await Attendance.aggregate([
      { $match: { studentId: require('mongoose').Types.ObjectId.createFromHexString(req.params.id), date: { $gte: sixMonthsAgo } } },
      { $group: { _id: { $month: '$date' }, present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } }, total: { $sum: 1 } } },
      { $sort: { '_id': 1 } },
    ]);

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
        totalAssignments,
        submittedAssignments: submissions.length,
        pendingAssignments: Math.max(0, pendingAssignments),
        certificates,
        performanceByCourse: performanceByCourse.map(p => ({
          course: p._id || 'Unknown',
          avgGrade: Math.round(p.avgGrade || 0),
          submissions: p.submissions,
          maxGrade: p.maxGrade || 0,
        })),
        monthlyAttendance: monthlyAttendance.map(m => ({
          month: m._id,
          present: m.present,
          total: m.total,
          rate: Math.round((m.present / m.total) * 100),
        })),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/courses - Course-level analytics
router.get('/courses', auth, async (req, res) => {
  try {
    const courses = await Course.find();
    const result = [];
    for (const course of courses) {
      const enrollments = await Enrollment.countDocuments({ courseId: course._id });
      const completed = await Enrollment.countDocuments({ courseId: course._id, status: 'completed' });
      const assignments = await Assignment.countDocuments({ courseId: course._id });
      const submissions = await Submission.countDocuments({
        assignmentId: { $in: (await Assignment.find({ courseId: course._id }).select('_id')).map(a => a._id) }
      });
      const certificates = await Certificate.countDocuments({ courseId: course._id });
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
