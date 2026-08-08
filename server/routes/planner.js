const router = require('express').Router();
const prisma = require('../prisma');
const { authenticate, authorize } = require('../middleware/auth');
const { suggestTasks } = require('../utils/planner');

router.use(authenticate);
router.use(authorize('student'));

router.get('/tasks', async (req, res) => {
  try {
    const { from, to, status } = req.query;
    const where = { studentId: req.userId };
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from);
      if (to) where.date.lte = new Date(to);
    }
    if (status) where.status = status;
    const tasks = await prisma.plannerTask.findMany({ where, orderBy: [{ date: 'asc' }, { createdAt: 'asc' }] });
    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/tasks', async (req, res) => {
  try {
    const { title, description, subject, date, duration, priority, status, deadline, source, sourceId } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ error: 'Task title is required' });
    if (!date) return res.status(400).json({ error: 'Task date is required' });

    const task = await prisma.plannerTask.create({
      data: {
        studentId: req.userId,
        title: title.trim(),
        description: description || null,
        subject: subject || null,
        date: new Date(date),
        duration: duration ? parseInt(duration) : null,
        priority: priority || 'medium',
        status: status || 'pending',
        deadline: deadline ? new Date(deadline) : null,
        source: source || 'manual',
        sourceId: sourceId || null,
      },
    });
    res.status(201).json({ task });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/tasks/:id', async (req, res) => {
  try {
    const existing = await prisma.plannerTask.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Task not found' });
    if (existing.studentId !== req.userId) return res.status(403).json({ error: 'You cannot edit this task' });

    const { title, description, subject, date, duration, priority, deadline } = req.body;
    const data = {};
    if (title !== undefined) data.title = title.trim();
    if (description !== undefined) data.description = description;
    if (subject !== undefined) data.subject = subject;
    if (date !== undefined) data.date = new Date(date);
    if (duration !== undefined) data.duration = duration ? parseInt(duration) : null;
    if (priority !== undefined) data.priority = priority;
    if (deadline !== undefined) data.deadline = deadline ? new Date(deadline) : null;

    const task = await prisma.plannerTask.update({ where: { id: req.params.id }, data });
    res.json({ task });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/tasks/:id/status', async (req, res) => {
  try {
    const existing = await prisma.plannerTask.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Task not found' });
    if (existing.studentId !== req.userId) return res.status(403).json({ error: 'You cannot update this task' });

    const { status } = req.body;
    const valid = ['pending', 'completed', 'skipped', 'rescheduled'];
    if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const task = await prisma.plannerTask.update({ where: { id: req.params.id }, data: { status } });
    res.json({ task });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/tasks/:id', async (req, res) => {
  try {
    const existing = await prisma.plannerTask.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Task not found' });
    if (existing.studentId !== req.userId) return res.status(403).json({ error: 'You cannot delete this task' });
    await prisma.plannerTask.delete({ where: { id: req.params.id } });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/suggestions', async (req, res) => {
  try {
    const [enrollments, quizzes, submissions] = await Promise.all([
      prisma.enrollment.findMany({
        where: { studentId: req.userId },
        include: { course: { select: { id: true, title: true } } },
      }),
      prisma.quiz.findMany({
        where: { status: 'published' },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      prisma.quizResult.findMany({ where: { studentId: req.userId }, select: { quizId: true } }),
    ]);

    const courseMap = Object.fromEntries(enrollments.map((e) => [e.courseId, e.course]));
    const courseIds = enrollments.map((e) => e.courseId);
    const assignments = await prisma.assignment.findMany({
      where: { courseId: { in: courseIds }, status: { in: ['published', 'scheduled'] }, dueDate: { gte: new Date() } },
      include: { course: { select: { id: true, title: true } } },
      orderBy: { dueDate: 'asc' },
    });

    const attemptedQuizIds = new Set(submissions.map((s) => s.quizId));
    const availableQuizzes = quizzes
      .filter((q) => courseMap[q.courseId])
      .filter((q) => !attemptedQuizIds.has(q.id))
      .map((q) => ({ ...q, course: courseMap[q.courseId] }));

    const tasks = suggestTasks({ assignments, quizzes: availableQuizzes, enrollments });
    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
