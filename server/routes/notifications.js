const router = require('express').Router();
const prisma = require('../prisma');
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');

router.use(authenticate);

router.get('/', asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, unread } = req.query;
  const where = { userId: req.userId };
  if (unread === 'true') where.isRead = false;

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId: req.userId, isRead: false } }),
  ]);

  res.json({ notifications, total, unreadCount, page: parseInt(page) });
}));

router.put('/:id/read', asyncHandler(async (req, res) => {
  const notification = await prisma.notification.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!notification) {
    return res.status(404).json({ error: 'Notification not found' });
  }
  await prisma.notification.update({ where: { id: notification.id }, data: { isRead: true } });
  res.json({ success: true });
}));

router.put('/read-all', asyncHandler(async (req, res) => {
  await prisma.notification.updateMany({ where: { userId: req.userId, isRead: false }, data: { isRead: true } });
  res.json({ success: true });
}));

router.get('/unread-count', asyncHandler(async (req, res) => {
  const count = await prisma.notification.count({ where: { userId: req.userId, isRead: false } });
  res.json({ count });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const notification = await prisma.notification.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!notification) {
    return res.status(404).json({ error: 'Notification not found' });
  }
  await prisma.notification.delete({ where: { id: notification.id } });
  res.json({ success: true });
}));

module.exports = router;
