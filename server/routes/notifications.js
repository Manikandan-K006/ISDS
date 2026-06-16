const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
// Middleware: simple token verification (extract userId from JWT)
const auth = (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const token = header.split(' ')[1];
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'isds_jwt_secret_key_2024');
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// GET /api/notifications - Get notifications for current user
router.get('/', auth, async (req, res) => {
  try {
    const { limit = 20, unread } = req.query;
    const filter = { userId: req.userId };
    if (unread === 'true') filter.isRead = false;
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    const unreadCount = await Notification.countDocuments({ userId: req.userId, isRead: false });
    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/notifications/:id/read - Mark single notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { isRead: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/notifications/read-all - Mark all as read
router.put('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.userId, isRead: false },
      { isRead: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/notifications/:id - Delete a notification
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/notifications/unread-count - Get unread count only
router.get('/unread-count', auth, async (req, res) => {
  try {
    const count = await Notification.countDocuments({ userId: req.userId, isRead: false });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
