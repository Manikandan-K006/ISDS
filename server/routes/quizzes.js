const router = require('express').Router();
const prisma = require('../prisma');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// GET /api/quizzes/course/:courseId
router.get('/course/:courseId', async (req, res) => {
  try {
    const quizzes = await prisma.quiz.findMany({
      where: { courseId: req.params.courseId },
      include: { _count: { select: { questions: true, results: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ quizzes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/quizzes
router.post('/', authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { courseId, title, description, timeLimit, passingScore, maxAttempts, shuffleQuestions, showResult, questions } = req.body;
    const quiz = await prisma.quiz.create({
      data: {
        courseId, title, description, timeLimit: parseInt(timeLimit) || null,
        passingScore: parseFloat(passingScore) || 40, maxAttempts: parseInt(maxAttempts) || 1,
        shuffleQuestions, showResult, createdById: req.userId,
        questions: { create: questions?.map((q, i) => ({ text: q.text, options: q.options, points: q.points || 1, order: i + 1, type: q.type || 'multiple_choice' })) || [] },
      },
      include: { questions: true },
    });
    res.status(201).json({ quiz });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/quizzes/:id/take
router.get('/:id/take', authorize('student'), async (req, res) => {
  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: req.params.id, status: 'published' },
      include: { questions: { orderBy: { order: 'asc' }, select: { id: true, text: true, options: true, type: true, points: true } } },
    });
    if (!quiz) return res.status(404).json({ error: 'Quiz not found or not published' });

    const existingResult = await prisma.quizResult.findUnique({
      where: { quizId_studentId: { quizId: quiz.id, studentId: req.userId } },
    });
    if (existingResult && quiz.maxAttempts <= 1) {
      return res.status(400).json({ error: 'You have already attempted this quiz' });
    }

    res.json({ quiz });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/quizzes/:id/submit
router.post('/:id/submit', authorize('student'), async (req, res) => {
  try {
    const { answers, timeTaken } = req.body;
    const quiz = await prisma.quiz.findUnique({
      where: { id: req.params.id },
      include: { questions: true },
    });
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    let score = 0;
    let totalPoints = 0;
    const responseData = [];

    for (const question of quiz.questions) {
      totalPoints += question.points;
      const userAnswer = answers?.[question.id] || '';
      const correctOption = question.options.find(o => o.isCorrect);
      const isCorrect = userAnswer === correctOption?.text;
      if (isCorrect) score += question.points;

      responseData.push({
        quizId: quiz.id,
        questionId: question.id,
        studentId: req.userId,
        answer: userAnswer,
        isCorrect,
      });
    }

    const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;
    const passed = percentage >= quiz.passingScore;

    const result = await prisma.quizResult.upsert({
      where: { quizId_studentId: { quizId: quiz.id, studentId: req.userId } },
      update: { score, totalPoints, percentage, passed, timeTaken: parseInt(timeTaken) || 0, answers },
      create: { quizId: quiz.id, studentId: req.userId, score, totalPoints, percentage, passed, timeTaken: parseInt(timeTaken) || 0, answers },
    });

    // Save responses
    await prisma.quizResponse.deleteMany({ where: { quizId: quiz.id, studentId: req.userId } });
    await prisma.quizResponse.createMany({ data: responseData });

    res.json({ result, showResult: quiz.showResult });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authorize('teacher', 'admin'), async (req, res) => {
  try {
    const quiz = await prisma.quiz.update({ where: { id: req.params.id }, data: req.body });
    res.json({ quiz });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authorize('teacher', 'admin'), async (req, res) => {
  try {
    await prisma.quiz.delete({ where: { id: req.params.id } });
    res.json({ message: 'Quiz deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;