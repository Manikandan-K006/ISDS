const router = require('express').Router();

router.post('/', async (req, res) => {
  try {
    const { message, history, context } = req.body;
    const apiKey = process.env.ANTHROPIC_API_KEY || 'mock_key';
    if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
      const mockResponses = {
        'what\'s my homework': 'Your pending assignments: 1) Calculus Problem Set (due Jun 15), 2) Physics Lab Report (due Jun 20). Check the Assignments page for details!',
        'explain': 'Sure! Which topic would you like me to explain? Please mention the subject and chapter name.',
        'exam': 'Your upcoming exams: Mathematics - Jun 20, Physics - Jun 25, Chemistry - Jun 28.',
        'improve': 'Great question! Based on your performance, focus on weak subjects and submit assignments on time.',
      };
      const lower = (message || '').toLowerCase();
      let reply = Object.entries(mockResponses).find(([key]) => lower.includes(key));
      res.json({ reply: reply ? reply[1] : "I'm your ISDS Assistant! I can help with course queries, assignment doubts, scheduling, and academic guidance. What would you like to know?" });
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
