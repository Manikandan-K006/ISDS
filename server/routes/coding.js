const router = require('express').Router();
const prisma = require('../prisma');
const { authenticate, authorize } = require('../middleware/auth');
const config = require('../config/env');

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

const executeCode = async ({ language, code }) => {
  if (!config.codeExecutorUrl) {
    return { executed: false, reason: 'not_configured' };
  }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(`${config.codeExecutorUrl}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language, code }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!response.ok) return { executed: false, reason: 'executor_error' };
    return { executed: true, ...(await response.json()) };
  } catch (err) {
    return { executed: false, reason: 'unreachable' };
  }
};

router.get('/config', async (req, res) => {
  res.json({
    executionEnabled: Boolean(config.codeExecutorUrl),
    languages: ['javascript', 'python'],
  });
});

router.get('/problems', authorize('student', 'teacher', 'admin', 'recruiter'), async (req, res) => {
  try {
    const { difficulty, search } = req.query;
    const where = {};
    if (req.userRole !== 'admin' && req.userRole !== 'teacher') where.status = 'published';
    if (difficulty) where.difficulty = difficulty;
    if (search) where.OR = [{ title: { contains: search, mode: 'insensitive' } }];

    const problems = await prisma.codingProblem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, title: true, description: true, difficulty: true, topics: true, languages: true,
        constraints: true, status: true, createdById: true, createdAt: true, updatedAt: true,
        _count: { select: { submissions: true } },
      },
    });
    res.json({
      problems: problems.map((p) => ({ ...p, topics: parseJson(p.topics), languages: parseJson(p.languages) })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/problems/:id', authorize('student', 'teacher', 'admin', 'recruiter'), async (req, res) => {
  try {
    const problem = await prisma.codingProblem.findUnique({
      where: { id: req.params.id },
      include: { submissions: { where: { studentId: req.userId }, orderBy: { submittedAt: 'desc' }, take: 5 } },
    });
    if (!problem) return res.status(404).json({ error: 'Problem not found' });
    if (problem.status !== 'published' && req.userRole === 'student') return res.status(403).json({ error: 'Problem not available' });

    const view = {
      ...problem,
      topics: parseJson(problem.topics),
      languages: parseJson(problem.languages),
      starterCode: problem.starterCode ? parseJson(problem.starterCode) : null,
      examples: problem.examples ? parseJson(problem.examples) : null,
      testCases: req.userRole === 'student' ? null : problem.testCases,
    };
    delete view.submissions;
    res.json({ problem: view, recentSubmissions: problem.submissions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/problems', authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { title, description, difficulty, topics, languages, starterCode, testCases, examples, constraints, status } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ error: 'Problem title is required' });

    const problem = await prisma.codingProblem.create({
      data: {
        title: title.trim(),
        description: description || null,
        difficulty: difficulty || 'beginner',
        topics: JSON.stringify(topics || []),
        languages: JSON.stringify(languages || []),
        starterCode: JSON.stringify(starterCode || {}),
        testCases: JSON.stringify(testCases || []),
        examples: JSON.stringify(examples || []),
        constraints: constraints || null,
        status: status || 'draft',
        createdById: req.userId,
      },
    });
    res.status(201).json({ problem });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/problems/:id', authorize('teacher', 'admin'), async (req, res) => {
  try {
    const existing = await prisma.codingProblem.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Problem not found' });
    if (existing.createdById !== req.userId && req.userRole !== 'admin') return res.status(403).json({ error: 'You cannot edit this problem' });

    const { title, description, difficulty, topics, languages, starterCode, testCases, examples, constraints, status } = req.body;
    const data = {};
    if (title !== undefined) data.title = title.trim();
    if (description !== undefined) data.description = description;
    if (difficulty !== undefined) data.difficulty = difficulty;
    if (topics !== undefined) data.topics = JSON.stringify(topics);
    if (languages !== undefined) data.languages = JSON.stringify(languages);
    if (starterCode !== undefined) data.starterCode = JSON.stringify(starterCode);
    if (testCases !== undefined) data.testCases = JSON.stringify(testCases);
    if (examples !== undefined) data.examples = JSON.stringify(examples);
    if (constraints !== undefined) data.constraints = constraints;
    if (status !== undefined) data.status = status;

    const problem = await prisma.codingProblem.update({ where: { id: req.params.id }, data });
    res.json({ problem });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/problems/:id/submit', authorize('student', 'teacher', 'admin'), async (req, res) => {
  try {
    const problem = await prisma.codingProblem.findUnique({ where: { id: req.params.id } });
    if (!problem) return res.status(404).json({ error: 'Problem not found' });
    if (problem.status !== 'published') return res.status(400).json({ error: 'Problem is not published' });

    const { language, code } = req.body;
    if (!code) return res.status(400).json({ error: 'Code is required' });
    const languages = parseJson(problem.languages);
    if (languages.length && !languages.includes(language)) return res.status(400).json({ error: `Language not allowed (${languages.join(', ')})` });

    const result = await executeCode({ language, code });
    const submission = await prisma.codeSubmission.create({
      data: {
        problemId: problem.id,
        studentId: req.userId,
        language: language || 'javascript',
        code,
        status: result.executed ? 'executed' : 'submitted',
        output: result.executed ? String(result.output ?? '') : null,
        error: result.executed ? String(result.error ?? '') : null,
        passedTests: result.executed ? result.passedTests || 0 : 0,
        totalTests: result.executed ? result.totalTests || 0 : 0,
        accuracy: result.executed && result.totalTests ? (result.passedTests / result.totalTests) * 100 : null,
      },
    });

    res.status(201).json({
      submission,
      execution: { enabled: Boolean(config.codeExecutorUrl), ...result },
      message: result.executed
        ? `Execution complete: ${result.passedTests || 0}/${result.totalTests || 0} tests passed`
        : 'Code saved. Live execution is not configured yet — connect a code executor to run and grade tests.',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/submissions/me', authorize('student', 'teacher', 'admin'), async (req, res) => {
  try {
    const submissions = await prisma.codeSubmission.findMany({
      where: { studentId: req.userId },
      include: { problem: { select: { id: true, title: true, difficulty: true } } },
      orderBy: { submittedAt: 'desc' },
      take: 50,
    });
    res.json({ submissions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stats', authorize('student', 'teacher', 'admin'), async (req, res) => {
  try {
    const [total, executed, problems] = await Promise.all([
      prisma.codeSubmission.count({ where: { studentId: req.userId } }),
      prisma.codeSubmission.count({ where: { studentId: req.userId, status: 'executed', accuracy: { gte: 100 } } }),
      prisma.codingProblem.count({ where: { status: 'published' } }),
    ]);
    res.json({ stats: { total, executed, problems } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
