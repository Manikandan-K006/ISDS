const router = require('express').Router();
const Certificate = require('../models/Certificate');
const Notification = require('../models/Notification');
const Course = require('../models/Course');

router.get('/', async (req, res) => {
  try {
    const { studentId } = req.query;
    const filter = {};
    if (studentId) filter.studentId = studentId;
    const certificates = await Certificate.find(filter).sort({ issuedAt: -1 });
    res.json(certificates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const cert = await Certificate.create(req.body);
    const course = await Course.findById(cert.courseId);
    await Notification.create({
      userId: cert.studentId,
      title: 'Certificate Generated',
      message: `Your certificate for "${course ? course.title : 'the course'}" has been generated`,
      type: 'certificate_generated',
      relatedId: cert._id,
      link: `/certificates/${cert._id}`,
    });
    res.status(201).json(cert);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
