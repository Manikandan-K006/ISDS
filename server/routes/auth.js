const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../prisma');
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');
const { sendEmail } = require('../services/email');
const config = require('../config/env');

const JWT_SECRET = config.jwtSecret;
const ADMIN_SECRET_KEY = config.adminSecretKey;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, v: user.tokenVersion || 0 },
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

const revokeUserSessions = async (userId) => {
  await prisma.refreshToken.deleteMany({ where: { userId } });
  await prisma.user.update({
    where: { id: userId },
    data: { tokenVersion: { increment: 1 } },
  });
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
router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password, role, class: className, rollNumber, departmentId, subject, employeeId, adminSecretKey } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  const validRoles = ['student', 'teacher', 'parent', 'admin'];
  const selectedRole = validRoles.includes(role) ? role : 'student';

  if (selectedRole === 'admin') {
    if (!adminSecretKey || !ADMIN_SECRET_KEY || adminSecretKey !== ADMIN_SECRET_KEY) {
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
}));

// POST /api/auth/login
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { department: true },
  });

  const isMatch = user && user.password ? await bcrypt.compare(password, user.password) : false;
  if (!user || !isMatch) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  if (!user.isActive) {
    return res.status(403).json({ error: 'Account has been deactivated.' });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: 'login',
      details: { method: 'email' },
      ipAddress: req.ip,
      userAgent: req.get('user-agent') || null,
    },
  });

  const token = generateToken(user);
  const refreshToken = await generateRefreshToken(user.id);

  res.json({
    user: formatUser(user),
    token,
    refreshToken,
  });
}));

// POST /api/auth/firebase
router.post('/firebase', asyncHandler(async (req, res) => {
  const { idToken, name, role, class: className, adminSecretKey } = req.body;

  const { verifyFirebaseToken } = require('../config/firebaseAdmin');
  const decoded = await verifyFirebaseToken(idToken);
  const { email, uid, picture } = decoded;

  let user = await prisma.user.findUnique({
    where: { email },
    include: { department: true },
  });

  if (user) {
    const updateData = { lastLogin: new Date() };
    if (!user.firebaseUid) {
      updateData.firebaseUid = uid;
      updateData.profilePhoto = picture || user.profilePhoto;
    }
    user = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      include: { department: true },
    });

    const token = generateToken(user);
    const refreshToken = await generateRefreshToken(user.id);
    return res.json({ user: formatUser(user), token, refreshToken });
  }

  const selectedRole = role || 'student';
  if (selectedRole === 'admin') {
    if (!adminSecretKey || !ADMIN_SECRET_KEY || adminSecretKey !== ADMIN_SECRET_KEY) {
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
}));

// POST /api/auth/refresh-token
router.post('/refresh-token', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token is required.' });
  }

  const stored = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: { include: { department: true } } },
  });

  if (!stored || stored.expiresAt < new Date() || !stored.user.isActive) {
    return res.status(401).json({ error: 'Invalid or expired refresh token.' });
  }

  await prisma.refreshToken.delete({ where: { id: stored.id } });

  const token = generateToken(stored.user);
  const newRefreshToken = await generateRefreshToken(stored.user.id);

  res.json({
    user: formatUser(stored.user),
    token,
    refreshToken: newRefreshToken,
  });
}));

// POST /api/auth/forgot-password
router.post('/forgot-password', asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'A valid email is required.' });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (user && user.password) {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: crypto.createHash('sha256').update(resetToken).digest('hex'),
        passwordResetExpires: resetExpires,
      },
    });

    try {
      await sendEmail({
        to: email,
        subject: 'Password Reset - ISDS',
        html: `<p>Click <a href="${config.frontendUrl}/reset-password?token=${resetToken}">here</a> to reset your password. This link expires in 1 hour.</p>`,
      });
    } catch (emailErr) {
      console.error('Email send error:', emailErr);
    }
  }

  res.json({ message: 'If an account exists with this email, a password reset link has been sent.' });
}));

// POST /api/auth/reset-password
router.post('/reset-password', asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ error: 'Token and new password are required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await prisma.user.findFirst({
    where: { passwordResetToken: hashedToken },
  });

  if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
    return res.status(400).json({ error: 'Password reset token is invalid or has expired.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  });
  await revokeUserSessions(user.id);

  res.json({ message: 'Password has been reset successfully. You can now log in.' });
}));

// POST /api/auth/change-password
router.post('/change-password', authenticate, asyncHandler(async (req, res) => {
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
  await revokeUserSessions(req.userId);

  res.json({ message: 'Password changed successfully. Please log in again.' });
}));

// POST /api/auth/logout
router.post('/logout', authenticate, asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  }

  await prisma.activityLog.create({
    data: {
      userId: req.userId,
      action: 'logout',
      ipAddress: req.ip,
      userAgent: req.get('user-agent') || null,
    },
  });

  res.json({ message: 'Logged out successfully.' });
}));

// GET /api/auth/me
router.get('/me', authenticate, asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    include: { department: true, settings: true },
  });
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json({ user: formatUser(user) });
}));

module.exports = router;
