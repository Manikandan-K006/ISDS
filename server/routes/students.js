const router = require('express').Router();
const User = require('../models/User');

router.get('/', async (req, res) => {
  try {
    const { class: className, status } = req.query;
    const filter = { role: 'student' };
    if (className) filter.class = className;
    const students = await User.find(filter).select('-password').sort({ name: 1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const student = await User.findById(req.params.id).select('-password');
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password;
    delete updates.role;
    const student = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/analytics', async (req, res) => {
  res.redirect(`/api/analytics/student/${req.params.id}`);
});

module.exports = router;
