const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const prisma = require('../prisma');
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');
const config = require('../config/env');
const { resolveIntent, buildStudentContext, buildAdvisorReply, buildQuickActions } = require('../utils/advisor');

const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many AI requests, please try again later.' },
});

router.use(authenticate);
router.use(chatLimiter);

const isGeneralIntent = (intent) => !['career', 'study', 'quiz', 'assignments', 'skills', 'projects', 'cgpa', 'attendance', 'help', 'greeting'].includes(intent);

const summarizeContext = (context) => [
  `Student: ${context.user.name}`,
  `CGPA: ${context.user.cgpa != null ? context.user.cgpa : 'n/a'} (semester GPA ${context.user.currentSemesterGpa ?? 'n/a'}, backlogs ${context.user.backlogs ?? 0})`,
  `Attendance: ${context.attendance.rate}%`,
  `Pending assignments: ${context.pendingAssignments.length}, unattempted quizzes: ${context.unattemptedQuizzes.length}`,
  `Weak skills: ${context.weakSkills.length ? context.weakSkills.join(', ') : 'none'}`,
  `Best role match: ${context.topRole ? `${context.topRole.label} (${context.topRole.readiness}%)` : 'n/a'}`,
].join('\n');

const callAnthropic = async (message, history, contextSummary) => {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': config.anthropicApiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: `You are ISDS Assistant, a helpful AI academic & career advisor for students on the Intelligent Student Development System. Answer using the student's real record when relevant:\n\n${contextSummary}`,
      messages: [...(history || []), { role: 'user', content: message }],
    }),
  });
  const data = await response.json();
  return data.content?.[0]?.text || "I'm sorry, I couldn't process that request.";
};

router.post('/', asyncHandler(async (req, res) => {
  const { message } = req.body;
  if (!message || !String(message).trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const intent = resolveIntent(message);
  const context = await buildStudentContext(prisma, req.userId);

  // Open-ended questions route to the external LLM when configured;
  // otherwise the deterministic advisor answers from the student record.
  if (isGeneralIntent(intent) && config.anthropicApiKey) {
    const reply = await callAnthropic(String(message).trim(), req.body.history || [], summarizeContext(context));
    return res.json({ reply, intent, suggestions: buildQuickActions(context) });
  }

  const { reply, suggestions } = buildAdvisorReply(context, intent);
  return res.json({ reply, intent, suggestions });
}));

module.exports = router;
