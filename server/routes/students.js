const router = require('express').Router();
const { queryDocs, getDoc, updateDoc } = require('../config/firestore');

router.get('/', async (req, res) => {
  try {
    const { class: className } = req.query;
    const conditions = [['role', '==', 'student']];
    if (className) conditions.push(['class', '==', className]);
    const students = await queryDocs('users', conditions, 'name', 'asc');
    const safe = students.map(({ password, ...u }) => ({ ...u }));
    res.json(safe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const student = await getDoc('users', req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    const { password, ...safe } = student;
    res.json(safe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { password, role, ...updates } = req.body;
    const student = await updateDoc('users', req.params.id, updates);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    const { password: pwd, ...safe } = student;
    res.json(safe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/analytics', (req, res) => {
  res.redirect(`/api/analytics/student/${req.params.id}`);
});

module.exports = router;
