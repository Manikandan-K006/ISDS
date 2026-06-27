const router = require('express').Router();
const { collection, addDoc, getDoc, queryDocs, updateDoc, deleteDoc, deleteDocs, countDocs, auth } = require('../config/firestore');
const { notify, notifyTeacher } = require('../services/notify');

router.get('/', async (req, res) => {
  try {
    const { courseId, studentId } = req.query;

    if (studentId) {
      const submissions = await queryDocs('submissions', [['studentId', '==', studentId]]);
      const ids = [...new Set(submissions.map(s => s.assignmentId))];
      if (ids.length === 0) return res.json([]);
      const assignments = (await Promise.all(ids.map(id => getDoc('assignments', id)))).filter(Boolean);
      assignments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.json(assignments);
    }

    const conditions = [];
    if (courseId) conditions.push(['courseId', '==', courseId]);
    const assignments = await queryDocs('assignments', conditions, 'createdAt', 'desc');
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const assignment = await getDoc('assignments', req.params.id);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { title, description, courseId, deadline, maxMarks } = req.body;
    if (!title || !courseId || !deadline) {
      return res.status(400).json({ error: 'Title, courseId, and deadline are required' });
    }
    const assignment = await addDoc('assignments', {
      title, description, courseId, deadline, maxMarks,
      createdBy: req.userId,
    });
    const enrollments = await queryDocs('enrollments', [['courseId', '==', courseId]]);
    const course = await getDoc('courses', courseId);
    await Promise.all(enrollments.map(async enr => {
      const student = await getDoc('users', enr.userId);
      await notify({
        userId: enr.userId,
        title: 'New Assignment',
        message: `A new assignment "${assignment.title}" has been posted`,
        type: 'assignment_created',
        relatedId: assignment._id,
        link: `/assignments/${assignment._id}`,
        templateData: { studentName: student?.name || 'Student', courseName: course?.title || 'Course', title: assignment.title },
      });
    }));
    res.status(201).json(assignment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const assignment = await updateDoc('assignments', req.params.id, req.body);
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await deleteDoc('assignments', req.params.id);
    await deleteDocs('submissions', [['assignmentId', '==', req.params.id]]);
    res.json({ message: 'Assignment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/submit', async (req, res) => {
  try {
    const { studentId, content, fileUrl } = req.body;
    if (!studentId) return res.status(400).json({ error: 'studentId is required' });
    const assignment = await getDoc('assignments', req.params.id);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    const existing = await queryDocs('submissions', [
      ['assignmentId', '==', req.params.id],
      ['studentId', '==', studentId],
    ]);
    let submission;
    if (existing.length > 0) {
      submission = await updateDoc('submissions', existing[0]._id, { content, fileUrl, status: 'submitted' });
    } else {
      submission = await addDoc('submissions', { assignmentId: req.params.id, studentId, content, fileUrl, status: 'submitted' });
    }
    const course = await getDoc('courses', assignment.courseId);
    if (course && course.teacherId) {
      const teacher = await getDoc('users', course.teacherId);
      const student = await getDoc('users', studentId);
      await notify({
        userId: course.teacherId,
        title: 'Assignment Submitted',
        message: `A student has submitted "${assignment.title}"`,
        type: 'assignment_submitted',
        relatedId: assignment._id,
        link: `/assignments/${assignment._id}`,
        templateData: { teacherName: teacher?.name || 'Teacher', studentName: student?.name || 'Student', title: assignment.title },
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
    const submission = await updateDoc('submissions', req.params.submissionId, { grade, feedback, status: 'graded' });
    const assignment = await getDoc('assignments', submission.assignmentId);
    const student = await getDoc('users', submission.studentId);
    const course = assignment ? await getDoc('courses', assignment.courseId) : null;
    await notify({
      userId: submission.studentId,
      title: 'Assignment Graded',
      message: `Your assignment "${assignment.title}" has been graded: ${submission.grade}/${assignment.maxMarks}`,
      type: 'assignment_graded',
      relatedId: assignment._id,
      link: `/assignments/${assignment._id}`,
      templateData: { studentName: student?.name || 'Student', courseName: course?.title || 'Course', title: assignment.title, grade: `${submission.grade}/${assignment.maxMarks}` },
    });
    res.json(submission);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
