const router = require('express').Router();

router.post('/', async (req, res) => {
  try {
    const { message, history, context } = req.body;
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
      res.json({ reply: 'AI assistant is not configured. Please set the ANTHROPIC_API_KEY environment variable.' });
      return;
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
  } catch (err) {
    res.status(500).json({ reply: "I'm having trouble connecting. Please try again later." });
  }
});

module.exports = router;
