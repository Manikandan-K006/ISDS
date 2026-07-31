const router = require('express').Router();
const prisma = require('../prisma');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// POST /api/attendance/mark
router.post('/mark', authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { records } = req.body; // [{studentId, status, date, courseId, remark}]
    const results = [];
    for (const record of records) {
      const attendance = await prisma.attendance.upsert({
        where: { studentId_date: { studentId: record.studentId, date: new Date(record.date) } },
        update: { status: record.status, markedById: req.userId, courseId: record.courseId, remark: record.remark },
        create: { studentId: record.studentId, date: new Date(record.date), status: record.status, markedById: req.userId, courseId: record.courseId, remark: record.remark },
      });
      results.push(attendance);
    }
    res.json({ attendance: results, count: results.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/attendance/student/:studentId
router.get('/student/:studentId', authorize('teacher', 'admin', 'parent'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = { studentId: req.params.studentId };
    if (startDate) where.date = { gte: new Date(startDate) };
    if (endDate) where.date = { ...where.date, lte: new Date(endDate) };
    const records = await prisma.attendance.findMany({ where, orderBy: { date: 'desc' } });
    res.json({ records });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/attendance/course/:courseId
router.get('/course/:courseId', authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { date } = req.query;
    const where = { courseId: req.params.courseId };
    if (date) where.date = new Date(date);
    const records = await prisma.attendance.findMany({
      where,
      include: { student: { select: { id: true, name: true, profilePhoto: true, rollNumber: true } } },
      orderBy: { date: 'desc' },
    });
    res.json({ records });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/attendance/stats/:studentId
router.get('/stats/:studentId', authorize('teacher', 'admin', 'parent', 'student'), async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;