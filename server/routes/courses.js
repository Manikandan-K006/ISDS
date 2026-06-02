const router = require('express').Router();
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

router.get('/', async (req, res) => {
  try {
    const { domain, difficulty, type } = req.query;
    const filter = {};
    if (domain) filter.domain = domain;
    if (difficulty) filter.difficulty = difficulty;
    if (type) filter.type = type;
    const courses = await Course.find(filter).sort({ createdAt: -1 });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    await Enrollment.deleteMany({ courseId: req.params.id });
    res.json({ message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/enroll', async (req, res) => {
  try {
    const { userId } = req.body;
    const existing = await Enrollment.findOne({ userId, courseId: req.params.id });
    if (existing) return res.status(400).json({ error: 'Already enrolled' });
    const enrollment = await Enrollment.create({ userId, courseId: req.params.id });
    res.status(201).json(enrollment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/progress', async (req, res) => {
  try {
    const { userId, progress, completedModules } = req.body;
    const enrollment = await Enrollment.findOneAndUpdate(
      { userId, courseId: req.params.id },
      { progress, completedModules, status: progress >= 100 ? 'completed' : 'in-progress' },
      { new: true }
    );
    if (progress >= 100) {
      const course = await Course.findById(req.params.id);
      if (course.creditPoints > 0) {
        await User.findByIdAndUpdate(userId, { $inc: { credits: course.creditPoints } });
      }
    }
    res.json(enrollment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
