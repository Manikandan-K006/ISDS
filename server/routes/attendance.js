const router = require('express').Router();
const Attendance = require('../models/Attendance');

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
