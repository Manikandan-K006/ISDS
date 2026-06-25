const router = require('express').Router();
const { queryDocs, addDoc, countDocs } = require('../config/firestore');

router.get('/', async (req, res) => {
  try {
    const { studentId } = req.query;
    let conditions = [];
    if (studentId) conditions.push(['studentId', '==', studentId]);
    const trophies = await queryDocs('trophies', conditions, 'earnedAt', 'desc');
    res.json(trophies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const trophy = await addDoc('trophies', req.body);
    res.status(201).json(trophy);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/auto-check', async (req, res) => {
  try {
    const { studentId } = req.body;
    const count = await countDocs('trophies', [['studentId', '==', studentId]]);
    if (count === 0) {
      const badge = await addDoc('trophies', {
        studentId,
        title: 'First Achievement',
        earnedAt: new Date().toISOString(),
      });
      return res.json({ newBadges: 1, message: 'Badge awarded!', badge });
    }
    res.json({ newBadges: 0, message: 'Auto-check complete' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
