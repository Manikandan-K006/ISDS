const router = require('express').Router();
const prisma = require('../prisma');
const { authenticate, authorize } = require('../middleware/auth');
const { evaluateAnswer, evaluateSession } = require('../utils/interview');
const { INTERVIEW_ROLES, QUESTION_PLAN, ANSWER_MIN_LENGTH, ANSWER_MAX_LENGTH } = require('../config/interview');

router.use(authenticate);

const parseJson = (value, fallback = []) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
  return fallback;
};

router.get('/roles', authorize('student', 'teacher', 'admin', 'recruiter'), async (req, res) => {
  const seeded = await prisma.interviewQuestion.findMany({ distinct: ['role'], select: { role: true } });
  const seededKeys = new Set(seeded.map((s) => s.role));
  const roles = INTERVIEW_ROLES.filter((r) => seededKeys.has(r.key) || r.key === 'communication');
  res.json({ roles });
});

router.get('/questions', authorize('student', 'teacher', 'admin', 'recruiter'), async (req, res) => {
  try {
    const { role, level } = req.query;
    const where = {};
    if (role) where.role = role;
    if (level) where.level = level;

    const questions = await prisma.interviewQuestion.findMany({ where, orderBy: { createdAt: 'asc' } });
    res.json({ questions: questions.map((q) => ({ id: q.id, role: q.role, category: q.category, question: q.question, level: q.level })) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function pickQuestionsForSession(role) {
  const where = role === 'communication' ? { role: 'communication' } : { role };
  const all = await prisma.interviewQuestion.findMany({ where, select: { id: true, question: true, category: true, level: true, keywords: true } });
  const byLevel = { basic: [], intermediate: [], advanced: [] };
  all.forEach((q) => { (byLevel[q.level] || byLevel.basic).push(q); });

  const picked = [];
  for (const plan of QUESTION_PLAN) {
    const pool = byLevel[plan.level] || [];
    for (let i = 0; i < plan.count && pool.length; i += 1) {
      picked.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    }
  }
  while (picked.length < 5 && all.length) {
    const extra = all[Math.floor(Math.random() * all.length)];
    if (!picked.some((p) => p.id === extra.id)) picked.push(extra);
  }
  return picked;
}

router.post('/sessions', authorize('student'), async (req, res) => {
  try {
    const { role } = req.body;
    if (!role) return res.status(400).json({ error: 'Role is required' });
    const validRole = INTERVIEW_ROLES.find((r) => r.key === role);
    if (!validRole) return res.status(400).json({ error: 'Unknown interview role' });

    const questions = await pickQuestionsForSession(role);
    if (!questions.length) return res.status(400).json({ error: 'No interview questions available for this role yet' });

    const session = await prisma.interviewSession.create({
      data: {
        studentId: req.userId,
        role,
        status: 'in_progress',
        answers: JSON.stringify([]),
      },
    });

    res.status(201).json({
      session,
      questions: questions.map((q) => ({ id: q.id, question: q.question, category: q.category, level: q.level })),
      totalQuestions: questions.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/sessions', authorize('student', 'teacher', 'admin'), async (req, res) => {
  try {
    const where = req.userRole === 'student' ? { studentId: req.userId } : {};
    const sessions = await prisma.interviewSession.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { student: req.userRole === 'student' ? false : { select: { id: true, name: true, profilePhoto: true } } },
      take: 50,
    });
    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/sessions/:id', authorize('student', 'teacher', 'admin'), async (req, res) => {
  try {
    const session = await prisma.interviewSession.findUnique({
      where: { id: req.params.id },
      include: { student: { select: { id: true, name: true, profilePhoto: true } } },
    });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.studentId !== req.userId && req.userRole !== 'admin') return res.status(403).json({ error: 'You cannot view this session' });

    const questions = await prisma.interviewQuestion.findMany({ where: { role: session.role } });
    res.json({
      session: {
        ...session,
        answers: session.answers ? parseJson(session.answers) : [],
        strengths: session.strengths ? parseJson(session.strengths) : null,
        weakAreas: session.weakAreas ? parseJson(session.weakAreas) : null,
        recommendations: session.recommendations ? parseJson(session.recommendations) : null,
      },
      questions,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/sessions/:id/answer', authorize('student'), async (req, res) => {
  try {
    const session = await prisma.interviewSession.findUnique({ where: { id: req.params.id } });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.studentId !== req.userId) return res.status(403).json({ error: 'You cannot answer this session' });
    if (session.status === 'completed') return res.status(400).json({ error: 'Session already completed' });

    const { questionId, answer } = req.body;
    if (!questionId || !answer) return res.status(400).json({ error: 'questionId and answer are required' });
    if (answer.trim().length < ANSWER_MIN_LENGTH) return res.status(400).json({ error: `Answer too short (min ${ANSWER_MIN_LENGTH} characters)` });
    if (answer.trim().length > ANSWER_MAX_LENGTH) return res.status(400).json({ error: `Answer too long (max ${ANSWER_MAX_LENGTH} characters)` });

    const question = await prisma.interviewQuestion.findUnique({ where: { id: questionId } });
    if (!question) return res.status(404).json({ error: 'Question not found' });

    const evaluation = evaluateAnswer(answer, question.keywords);
    const answers = parseJson(session.answers, []);
    const idx = answers.findIndex((a) => a.questionId === questionId);
    const entry = { questionId, question: question.question, answer, score: evaluation.score, missing: evaluation.missing, feedback: evaluation.feedback };
    if (idx >= 0) answers[idx] = entry;
    else answers.push(entry);

    await prisma.interviewSession.update({ where: { id: session.id }, data: { answers: JSON.stringify(answers) } });
    res.json({ evaluation, answered: answers.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/sessions/:id/complete', authorize('student'), async (req, res) => {
  try {
    const session = await prisma.interviewSession.findUnique({ where: { id: req.params.id } });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.studentId !== req.userId) return res.status(403).json({ error: 'You cannot complete this session' });
    if (session.status === 'completed') return res.status(400).json({ error: 'Session already completed' });

    const answers = parseJson(session.answers, []);
    const summary = evaluateSession(answers);

    await prisma.interviewSession.update({
      where: { id: session.id },
      data: {
        status: 'completed',
        completedAt: new Date(),
        score: summary.score,
        strengths: JSON.stringify(summary.strengths),
        weakAreas: JSON.stringify(summary.weakAreas),
        recommendations: JSON.stringify(summary.recommendations),
      },
    });

    res.json({ summary, answered: answers.length, total: 5 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
