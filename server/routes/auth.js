const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyFirebaseToken, hasFirebaseAdminConfig } = require('../config/firebaseAdmin');

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  class: user.class,
  profilePhoto: user.profilePhoto,
  credits: user.credits,
});

// Verify Firebase ID token, find or create user, return JWT
router.post('/firebase', async (req, res) => {
  try {
    const { idToken, name, role, class: className } = req.body;

    if (!hasFirebaseAdminConfig()) {
      return res.status(500).json({ error: 'Firebase Admin is not configured on the server.' });
    }

    const decoded = await verifyFirebaseToken(idToken);
    const { email, uid, picture } = decoded;

    let user = await User.findOne({ email });

    if (!user) {
      const userName = name || decoded.name || email.split('@')[0];
      const userRole = role || 'student';
      user = await User.create({
        name: userName,
        email,
        password: uid,
        role: userRole,
        class: className || '',
        profilePhoto: picture || '',
      });
    }

    const token = generateToken(user);
    res.json({ user: formatUser(user), token });
  } catch (err) {
    console.error('Firebase auth error:', err.message);
    res.status(401).json({ error: 'Authentication failed: ' + err.message });
  }
});

// Legacy email/password login (deprecated - kept for backward compat)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
    const token = generateToken(user);
    res.json({ user: formatUser(user), token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Legacy register (deprecated - kept for backward compat)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, class: className, rollNumber, parentContact } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already exists' });
    const user = await User.create({ name, email, password, role, class: className, rollNumber, parentContact });
    const token = generateToken(user);
    res.status(201).json({ user: formatUser(user), token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/forgot-password', async (req, res) => {
  res.json({ message: 'OTP sent to email' });
});

router.post('/reset-password', async (req, res) => {
  res.json({ message: 'Password reset successful' });
});

router.post('/refresh-token', async (req, res) => {
  res.json({ message: 'Token refreshed' });
});

module.exports = router;
