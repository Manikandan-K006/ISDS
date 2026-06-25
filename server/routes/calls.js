const router = require('express').Router();
const { queryDocs, addDoc } = require('../config/firestore');

router.get('/', async (req, res) => {
  try {
    const { teacherId, studentId } = req.query;
    let conditions = [];
    if (teacherId) conditions.push(['teacherId', '==', teacherId]);
    if (studentId) conditions.push(['studentId', '==', studentId]);
    const logs = await queryDocs('callLogs', conditions, 'createdAt', 'desc');
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const log = await addDoc('callLogs', req.body);
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
