const router = require('express').Router();
const CallLog = require('../models/CallLog');

router.get('/', async (req, res) => {
  try {
    const { teacherId, studentId } = req.query;
    const filter = {};
    if (teacherId) filter.teacherId = teacherId;
    if (studentId) filter.studentId = studentId;
    const logs = await CallLog.find(filter).sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const log = await CallLog.create(req.body);
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
