const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');
const config = require('../config/env');

const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many AI requests, please try again later.' },
});

router.use(authenticate);
router.use(chatLimiter);

router.post('/', asyncHandler(async (req, res) => {
  const { message, history } = req.body;
  const apiKey = config.anthropicApiKey;
  if (!apiKey) {
    return res.json({ reply: 'AI assistant is not configured. Please set the ANTHROPIC_API_KEY environment variable.' });
  }
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: 'You are ISDS Assistant, a helpful AI for students and teachers on the Intelligent Student Development System. Help with course queries, assignment doubts, schedule questions, and general academic guidance.',
      messages: [...(history || []), { role: 'user', content: message }],
    }),
  });
  const data = await response.json();
  const reply = data.content?.[0]?.text || "I'm sorry, I couldn't process that request.";
  res.json({ reply });
}));

module.exports = router;
