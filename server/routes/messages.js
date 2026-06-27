const router = require('express').Router();
const { queryDocs, addDoc, getDoc } = require('../config/firestore');

const auth = (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ error: 'No token provided' });
    const jwt = require('jsonwebtoken');
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'isds_jwt_secret_key_2024');
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch { res.status(401).json({ error: 'Invalid token' }); }
};

router.get('/conversations', auth, async (req, res) => {
  try {
    const sent = await queryDocs('messages', [['fromId', '==', req.userId]], 'createdAt', 'desc');
    const received = await queryDocs('messages', [['toId', '==', req.userId]], 'createdAt', 'desc');
    const all = [...sent, ...received].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const seen = new Set();
    const convs = [];
    for (const m of all) {
      const otherId = m.fromId === req.userId ? m.toId : m.fromId;
      if (seen.has(otherId)) continue;
      seen.add(otherId);
      const other = await getDoc('users', otherId);
      convs.push({
        userId: otherId,
        userName: other?.name || 'Unknown',
        userRole: other?.role || '',
        lastMessage: m.content,
        lastTime: m.createdAt,
        unread: m.fromId !== req.userId && !m.read,
      });
    }
    res.json(convs);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/conversations/:userId', auth, async (req, res) => {
  try {
    const fromId = req.userId;
    const toId = req.params.userId;
    const sent = await queryDocs('messages', [['fromId', '==', fromId], ['toId', '==', toId]], 'createdAt', 'asc');
    const received = await queryDocs('messages', [['fromId', '==', toId], ['toId', '==', fromId]], 'createdAt', 'asc');
    const all = [...sent, ...received].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    res.json(all);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { toId, content } = req.body;
    if (!toId || !content) return res.status(400).json({ error: 'toId and content required' });
    const msg = await addDoc('messages', { fromId: req.userId, toId, content, read: false });
    res.status(201).json(msg);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
