const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: 'Google credential is required' });

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        password: googleId,
        role: 'student',
        profilePhoto: payload.picture || '',
      });
    }

    const token = generateToken(user);
    res.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role, class: user.class, profilePhoto: user.profilePhoto, credits: user.credits },
      token
    });
  } catch (err) {
    res.status(500).json({ error: 'Google authentication failed: ' + err.message });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, class: className, rollNumber, parentContact } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already exists' });
    const user = await User.create({ name, email, password, role, class: className, rollNumber, parentContact });
    const token = generateToken(user);
    res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role, class: user.class }, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
    const token = generateToken(user);
    res.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role, class: user.class, profilePhoto: user.profilePhoto, credits: user.credits },
      token
    });
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
