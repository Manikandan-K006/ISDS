const express = require('express');
const router = express.Router();
const { collection, addDoc, getDoc, queryDocs, updateDoc, deleteDoc, countDocs, formatDoc, formatDocs } = require('../config/firestore');

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

router.get('/', auth, async (req, res) => {
  try {
    const { limit = 20, unread } = req.query;
    const conditions = [['userId', '==', req.userId]];
    if (unread === 'true') conditions.push(['isRead', '==', false]);
    const notifications = await queryDocs('notifications', conditions, 'createdAt', 'desc');
    const unreadCount = await countDocs('notifications', [['userId', '==', req.userId], ['isRead', '==', false]]);
    res.json({ notifications: notifications.slice(0, parseInt(limit)), unreadCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await getDoc('notifications', req.params.id);
    if (!notification || notification.userId !== req.userId) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    const updated = await updateDoc('notifications', req.params.id, { isRead: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/read-all', auth, async (req, res) => {
  try {
    const notifications = await queryDocs('notifications', [['userId', '==', req.userId], ['isRead', '==', false]]);
    for (const n of notifications) {
      await updateDoc('notifications', n._id, { isRead: true });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await getDoc('notifications', req.params.id);
    if (!notification || notification.userId !== req.userId) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    await deleteDoc('notifications', req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/unread-count', auth, async (req, res) => {
  try {
    const count = await countDocs('notifications', [['userId', '==', req.userId], ['isRead', '==', false]]);
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
