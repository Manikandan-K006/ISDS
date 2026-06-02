const router = require('express').Router();
const User = require('../models/User');
const Certificate = require('../models/Certificate');

router.get('/', async (req, res) => {
  try {
    const { class: className } = req.query;
    const filter = { role: 'student' };
    if (className) filter.class = className;
    const students = await User.find(filter).select('name class credits');
    const totalStudents = students.length;
    const avgCredits = students.reduce((sum, s) => sum + (s.credits || 0), 0) / (totalStudents || 1);
    res.json({ totalStudents, avgCredits, students });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/student/:id', async (req, res) => {
  try {
    const student = await User.findById(req.params.id).select('-password');
    const certs = await Certificate.countDocuments({ studentId: req.params.id });
    res.json({ ...student.toObject(), certificatesCount: certs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
