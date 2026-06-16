const router = require('express').Router();
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Enrollment = require('../models/Enrollment');
const Notification = require('../models/Notification');

router.get('/', async (req, res) => {
  try {
    const { courseId, status } = req.query;
    const filter = {};
    if (courseId) filter.courseId = courseId;
    const assignments = await Assignment.find(filter).sort({ deadline: 1 });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const assignment = await Assignment.create(req.body);
    const enrollments = await Enrollment.find({ courseId: assignment.courseId });
    for (const enr of enrollments) {
      await Notification.create({
        userId: enr.userId,
        title: 'New Assignment',
        message: `A new assignment "${assignment.title}" has been posted`,
        type: 'assignment_created',
        relatedId: assignment._id,
        link: `/assignments/${assignment._id}`,
      });
    }
    res.status(201).json(assignment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Assignment.findByIdAndDelete(req.params.id);
    await Submission.deleteMany({ assignmentId: req.params.id });
    res.json({ message: 'Assignment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/submit', async (req, res) => {
  try {
    const submission = await Submission.create({ assignmentId: req.params.id, ...req.body });
    const assignment = await Assignment.findById(req.params.id);
    if (assignment.createdBy) {
      await Notification.create({
        userId: assignment.createdBy,
        title: 'Assignment Submitted',
        message: `A student has submitted "${assignment.title}"`,
        type: 'assignment_submitted',
        relatedId: assignment._id,
        link: `/assignments/${assignment._id}`,
      });
    }
    res.status(201).json(submission);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/grade/:submissionId', async (req, res) => {
  try {
    const { grade, feedback } = req.body;
    const submission = await Submission.findByIdAndUpdate(
      req.params.submissionId,
      { grade, feedback, status: 'graded' },
      { new: true }
    );
    const assignment = await Assignment.findById(submission.assignmentId);
    await Notification.create({
      userId: submission.studentId,
      title: 'Assignment Graded',
      message: `Your assignment "${assignment.title}" has been graded: ${submission.grade}/${assignment.maxMarks}`,
      type: 'assignment_graded',
      relatedId: assignment._id,
      link: `/assignments/${assignment._id}`,
    });
    res.json(submission);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
