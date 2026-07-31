const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../prisma');
const { authenticate } = require('../middleware/auth');
const { sendEmail } = require('../services/email');

const JWT_SECRET = process.env.JWT_SECRET || 'sidts_jwt_secret_key_2024';
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'mani@2006';

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const generateRefreshToken = async (userId) => {
  const token = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  await prisma.refreshToken.create({
    data: { token, userId, expiresAt },
  });
  return token;
};

const formatUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  class: user.class,
  rollNumber: user.rollNumber,
  departmentId: user.departmentId,
  department: user.department?.name || null,
  subject: user.subject,
  employeeId: user.employeeId,
  profilePhoto: user.profilePhoto,
  isVerified: user.isVerified,
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, class: className, rollNumber, departmentId, subject, employeeId, adminSecretKey } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const validRoles = ['student', 'teacher', 'parent', 'admin'];
    const selectedRole = validRoles.includes(role) ? role : 'student';

    // Admin registration requires secret key
    if (selectedRole === 'admin') {
      if (!adminSecretKey || adminSecretKey !== ADMIN_SECRET_KEY) {
        return res.status(403).json({ error: 'Invalid administrator secret key. Registration denied.' });
      }
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: selectedRole,
        class: className || null,
        rollNumber: rollNumber || null,
        departmentId: departmentId || null,
        subject: subject || null,
        employeeId: employeeId || null,
        settings: {
          create: { theme: 'dark', language: 'en' },
        },
      },
      include: { department: true },
    });

    const token = generateToken(user);
    const refreshToken = await generateRefreshToken(user.id);

    res.status(201).json({
      user: formatUser(user),
      token,
      refreshToken,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { department: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account has been deactivated.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'login',
        details: { method: 'email' },
        ipAddress: req.ip,
      },
    });

    const token = generateToken(user);
    const refreshToken = await generateRefreshToken(user.id);

    res.json({
      user: formatUser(user),
      token,
      refreshToken,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/firebase
router.post('/firebase', async (req, res) => {
  try {
    const { idToken, name, role, class: className, adminSecretKey } = req.body;

    // Verify Firebase token
    const { verifyFirebaseToken } = require('../config/firebaseAdmin');
    const decoded = await verifyFirebaseToken(idToken);
    const { email, uid, picture } = decoded;

    let user = await prisma.user.findUnique({
      where: { email },
      include: { department: true },
    });

    if (user) {
      // Update firebaseUid if not set
      if (!user.firebaseUid) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { firebaseUid: uid, lastLogin: new Date(), profilePhoto: picture || user.profilePhoto },
          include: { department: true },
        });
      } else {
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        });
      }

      const token = generateToken(user);
      const refreshToken = await generateRefreshToken(user.id);
      return res.json({ user: formatUser(user), token, refreshToken });
    }

    // New user registration via Firebase
    const selectedRole = role || 'student';
    if (selectedRole === 'admin') {
      if (!adminSecretKey || adminSecretKey !== ADMIN_SECRET_KEY) {
        return res.status(403).json({ error: 'Invalid administrator secret key.' });
      }
    }

    const userName = name || decoded.name || email.split('@')[0];
    const hashedPassword = await bcrypt.hash(uid, 10);

    user = await prisma.user.create({
      data: {
        name: userName,
        email,
        password: hashedPassword,
        role: selectedRole,
        firebaseUid: uid,
        profilePhoto: picture || null,
        class: className || null,
        isVerified: true,
        settings: { create: { theme: 'dark', language: 'en' } },
      },
      include: { department: true },
    });

    const token = generateToken(user);
    const refreshToken = await generateRefreshToken(user.id);

    res.status(201).json({
      user: formatUser(user),
      token,
      refreshToken,
    });
  } catch (err) {
    console.error('Firebase auth error:', err);
    res.status(401).json({ error: 'Authentication failed: ' + err.message });
  }
});

// POST /api/auth/refresh-token
router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required.' });
    }

    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: { include: { department: true } } },
    });

    if (!stored || stored.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Invalid or expired refresh token.' });
    }

    // Delete old refresh token
    await prisma.refreshToken.delete({ where: { id: stored.id } });

    const token = generateToken(stored.user);
    const newRefreshToken = await generateRefreshToken(stored.user.id);

    res.json({
      user: formatUser(stored.user),
      token,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email.' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        // Store reset token in a field or use a separate mechanism
        // For now, we'll use a simple approach
      },
    });

    // Send email
    try {
      await sendEmail({
        to: email,
        subject: 'Password Reset - SIDTS',
        html: `<p>Click <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}">here</a> to reset your password. This link expires in 1 hour.</p>`,
      });
    } catch (emailErr) {
      console.error('Email send error:', emailErr);
    }

    res.json({ message: 'If an account exists with this email, a password reset link has been sent.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/change-password
router.post('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Current password is incorrect.' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.userId },
      data: { password: hashed },
    });

    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/logout
router.post('/logout', authenticate, async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    }

    await prisma.activityLog.create({
      data: {
        userId: req.userId,
        action: 'logout',
        ipAddress: req.ip,
      },
    });

    res.json({ message: 'Logged out successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { department: true, settings: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ user: formatUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;