const router = require('express').Router();
const prisma = require('../prisma');
const { authenticate, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');
const { canAccessStudent } = require('../utils/access');

router.use(authenticate);

// POST /api/attendance/mark
router.post('/mark', authorize('teacher', 'admin'), asyncHandler(async (req, res) => {
  const { records } = req.body; // [{studentId, status, date, courseId, remark}]
  if (!Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ error: 'Attendance records are required.' });
  }
  const validStatuses = ['present', 'absent', 'late', 'leave', 'holiday'];
  const results = [];
  for (const record of records) {
    if (!record.studentId || !record.date || !validStatuses.includes(record.status)) {
      return res.status(400).json({ error: 'Each record needs studentId, a valid date, and a valid status.' });
    }
    const attendance = await prisma.attendance.upsert({
      where: { studentId_date: { studentId: record.studentId, date: new Date(record.date) } },
      update: { status: record.status, markedById: req.userId, courseId: record.courseId || null, remark: record.remark || null },
      create: { studentId: record.studentId, date: new Date(record.date), status: record.status, markedById: req.userId, courseId: record.courseId || null, remark: record.remark || null },
    });
    results.push(attendance);
  }
  res.json({ attendance: results, count: results.length });
}));

// GET /api/attendance/student/:studentId
router.get('/student/:studentId', authorize('teacher', 'admin', 'parent', 'student'), asyncHandler(async (req, res) => {
  if (!(await canAccessStudent(prisma, req.userId, req.userRole, req.params.studentId))) {
    return res.status(403).json({ error: 'You do not have permission to view this attendance.' });
  }
  const { startDate, endDate } = req.query;
  const where = { studentId: req.params.studentId };
  if (startDate) where.date = { gte: new Date(startDate) };
  if (endDate) where.date = { ...(where.date || {}), lte: new Date(endDate) };
  const records = await prisma.attendance.findMany({ where, orderBy: { date: 'desc' } });
  res.json({ records });
}));

// GET /api/attendance/course/:courseId
router.get('/course/:courseId', authorize('teacher', 'admin'), asyncHandler(async (req, res) => {
  if (req.userRole === 'teacher') {
    const course = await prisma.course.findUnique({
      where: { id: req.params.courseId },
      select: { instructorId: true },
    });
    if (!course || course.instructorId !== req.userId) {
      return res.status(403).json({ error: 'You can only view attendance for courses you teach.' });
    }
  }
  const { date } = req.query;
  const where = { courseId: req.params.courseId };
  if (date) where.date = new Date(date);
  const records = await prisma.attendance.findMany({
    where,
    include: { student: { select: { id: true, name: true, profilePhoto: true, rollNumber: true } } },
    orderBy: { date: 'desc' },
  });
  res.json({ records });
}));

// GET /api/attendance/stats/:studentId
router.get('/stats/:studentId', authorize('teacher', 'admin', 'parent', 'student'), asyncHandler(async (req, res) => {
  if (!(await canAccessStudent(prisma, req.userId, req.userRole, req.params.studentId))) {
    return res.status(403).json({ error: 'You do not have permission to view this attendance.' });
  }
  const records = await prisma.attendance.findMany({ where: { studentId: req.params.studentId } });
  const stats = {
    present: records.filter(r => r.status === 'present').length,
    absent: records.filter(r => r.status === 'absent').length,
    late: records.filter(r => r.status === 'late').length,
    leave: records.filter(r => r.status === 'leave').length,
    total: records.length,
    rate: records.length > 0 ? Math.round((records.filter(r => r.status === 'present').length / records.length) * 100) : 0,
  };
  res.json({ stats });
}));

module.exports = router;
