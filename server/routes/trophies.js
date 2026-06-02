const router = require('express').Router();
const Trophy = require('../models/Trophy');

router.get('/', async (req, res) => {
  try {
    const { studentId } = req.query;
    const filter = {};
    if (studentId) filter.studentId = studentId;
    const trophies = await Trophy.find(filter).sort({ earnedAt: -1 });
    res.json(trophies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const trophy = await Trophy.create(req.body);
    res.status(201).json(trophy);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/auto-check', async (req, res) => {
  try {
    const { studentId } = req.body;
    const count = await Trophy.countDocuments({ studentId });
    res.json({ newBadges: count === 0 ? 1 : 0, message: 'Auto-check complete' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
