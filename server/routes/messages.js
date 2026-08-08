const router = require('express').Router();
const prisma = require('../prisma');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const messages = await prisma.message.findMany({
      where: { OR: [{ senderId: req.userId }, { receiverId: req.userId }] },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      include: { sender: { select: { id: true, name: true, profilePhoto: true } }, receiver: { select: { id: true, name: true, profilePhoto: true } } },
    });
    const unreadCount = await prisma.message.count({ where: { receiverId: req.userId, isRead: false } });
    res.json({ messages, unreadCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/conversation/:userId', async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: req.userId, receiverId: req.params.userId },
          { senderId: req.params.userId, receiverId: req.userId },
        ],
      },
      orderBy: { createdAt: 'asc' },
      include: { sender: { select: { id: true, name: true, profilePhoto: true } } },
    });
    // Mark as read
    await prisma.message.updateMany({
      where: { senderId: req.params.userId, receiverId: req.userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { receiverId, subject, content, attachments } = req.body;
    const message = await prisma.message.create({
      data: { senderId: req.userId, receiverId, subject, content, attachments: attachments || [] },
      include: { sender: { select: { name: true, profilePhoto: true } } },
    });
    await prisma.notification.create({
      data: { userId: receiverId, title: 'New Message', message: subject || content.substring(0, 100), category: 'message', link: '/messages' },
    });
    res.status(201).json({ message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;