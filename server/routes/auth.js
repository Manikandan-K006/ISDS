const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { collection, addDoc, getDoc, queryDocs, updateDoc, deleteDoc, auth, verifyFirebaseToken } = require('../config/firestore');

const ADMIN_AUTH_PASSWORD = 'mani@2006';

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  class: user.class,
  rollNumber: user.rollNumber,
  department: user.department,
  subject: user.subject,
  employeeId: user.employeeId,
  profilePhoto: user.profilePhoto,
  credits: user.credits,
});

router.post('/firebase', async (req, res) => {
  try {
    const { idToken, name, role, class: className, adminAuthorizationPassword, rollNumber, department, subject, employeeId } = req.body;
    const decoded = await verifyFirebaseToken(idToken);
    const { email, uid, picture } = decoded;

    const existing = await queryDocs('users', [['email', '==', email]]);

    if (existing[0]) {
      const user = existing[0];
      const token = generateToken(user);
      return res.json({ user: formatUser(user), token });
    }

    const selectedRole = role || 'student';

    if (selectedRole === 'admin') {
      if (!adminAuthorizationPassword || adminAuthorizationPassword !== ADMIN_AUTH_PASSWORD) {
        return res.status(403).json({ error: 'Invalid administrator authorization password. Registration denied.' });
      }
    }

    const userName = name || decoded.name || email.split('@')[0];
    const hashedPassword = await bcrypt.hash(uid, 10);
    const userData = {
      name: userName,
      email,
      password: hashedPassword,
      role: selectedRole,
      class: className || '',
      profilePhoto: picture || '',
      rollNumber: rollNumber || '',
      department: department || '',
      subject: subject || '',
      employeeId: employeeId || '',
    };
    const user = await addDoc('users', userData);

    const token = generateToken(user);
    res.json({ user: formatUser(user), token });
  } catch (err) {
    console.error('Firebase auth error:', err.message);
    res.status(401).json({ error: 'Authentication failed: ' + err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const users = await queryDocs('users', [['email', '==', email]]);
    const user = users[0];
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
    const token = generateToken(user);
    res.json({ user: formatUser(user), token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, class: className, rollNumber, department, subject, employeeId, adminAuthorizationPassword } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const validRoles = ['student', 'teacher', 'admin'];
    const selectedRole = validRoles.includes(role) ? role : 'student';

    if (selectedRole === 'admin') {
      if (!adminAuthorizationPassword || adminAuthorizationPassword !== ADMIN_AUTH_PASSWORD) {
        return res.status(403).json({ error: 'Invalid administrator authorization password. Registration denied.' });
      }
    }

    const existing = await queryDocs('users', [['email', '==', email]]);
    if (existing[0]) return res.status(400).json({ error: 'An account with this email already exists.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = {
      name,
      email,
      password: hashedPassword,
      role: selectedRole,
      class: className || '',
      rollNumber: rollNumber || '',
      department: department || '',
      subject: subject || '',
      employeeId: employeeId || '',
    };
    const user = await addDoc('users', userData);

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

router.post('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Current and new password are required' });
    if (newPassword.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' });
    const user = await getDoc('users', req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Current password is incorrect' });
    const hashed = await bcrypt.hash(newPassword, 10);
    await updateDoc('users', req.userId, { password: hashed });
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
