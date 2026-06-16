const router = require('express').Router();
const Attendance = require('../models/Attendance');
const Notification = require('../models/Notification');

router.get('/', async (req, res) => {
  try {
    const { studentId, month, year } = req.query;
    const filter = {};
    if (studentId) filter.studentId = studentId;
    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0);
      filter.date = { $gte: start, $lte: end };
    }
    const records = await Attendance.find(filter).sort({ date: 1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { studentId, date, status, reason } = req.body;
    const record = await Attendance.findOneAndUpdate(
      { studentId, date },
      { status, reason },
      { upsert: true, new: true }
    );
    if (record.status === 'absent') {
      await Notification.create({
        userId: record.studentId,
        title: 'Attendance Alert',
        message: `You were marked absent on ${record.date.toISOString().split('T')[0]}`,
        type: 'attendance_alert',
        relatedId: record._id,
        link: '/attendance',
      });
    }
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/leave', async (req, res) => {
  try {
    const { studentId, date, reason } = req.body;
    const record = await Attendance.findOneAndUpdate(
      { studentId, date },
      { status: 'leave', reason },
      { upsert: true, new: true }
    );
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
