const router = require('express').Router();
const bcrypt = require('bcryptjs');
const prisma = require('../prisma');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize('admin'));

// GET /api/admin/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const [totalUsers, totalStudents, totalTeachers, totalParents, totalCourses, totalDepartments, recentUsers, recentActivity] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'student' } }),
      prisma.user.count({ where: { role: 'teacher' } }),
      prisma.user.count({ where: { role: 'parent' } }),
      prisma.course.count(),
      prisma.department.count(),
      prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 10, select: { id: true, name: true, email: true, role: true, profilePhoto: true, createdAt: true } }),
      prisma.activityLog.findMany({ orderBy: { createdAt: 'desc' }, take: 20, include: { user: { select: { name: true, profilePhoto: true } } } }),
    ]);

    res.json({
      stats: { totalUsers, totalStudents, totalTeachers, totalParents, totalCourses, totalDepartments },
      recentUsers,
      recentActivity,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// User Management
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, role: true, profilePhoto: true, isActive: true, isVerified: true, class: true, departmentId: true, createdAt: true, lastLogin: true },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ users, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/users/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: { department: true, settings: true, _count: { select: { enrollments: true, attendances: true, certificates: true } } },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const { name, email, role, isActive, class: className, departmentId, subject, employeeId } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { name, email, role, isActive, class: className, departmentId, subject, employeeId },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    await prisma.auditLog.create({
      data: { adminId: req.userId, action: 'update_user', resource: 'user', resourceId: user.id, details: { changes: req.body } },
    });

    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    await prisma.user.update({ where: { id: req.params.id }, data: { isActive: false } });
    await prisma.auditLog.create({
      data: { adminId: req.userId, action: 'deactivate_user', resource: 'user', resourceId: req.params.id },
    });
    res.json({ message: 'User deactivated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Department Management
router.get('/departments', async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      include: { _count: { select: { users: true, courses: true } } },
      orderBy: { name: 'asc' },
    });
    res.json({ departments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/departments', async (req, res) => {
  try {
    const { name, code, description } = req.body;
    const department = await prisma.department.create({ data: { name, code, description } });
    await prisma.auditLog.create({ data: { adminId: req.userId, action: 'create_department', resource: 'department', resourceId: department.id } });
    res.status(201).json({ department });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/departments/:id', async (req, res) => {
  try {
    const department = await prisma.department.update({ where: { id: req.params.id }, data: req.body });
    res.json({ department });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/departments/:id', async (req, res) => {
  try {
    await prisma.department.delete({ where: { id: req.params.id } });
    res.json({ message: 'Department deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/analytics
router.get('/analytics', async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;
    const now = new Date();
    let startDate;
    if (period === 'daily') startDate = new Date(now.setDate(now.getDate() - 30));
    else if (period === 'weekly') startDate = new Date(now.setDate(now.getDate() - 90));
    else startDate = new Date(now.setFullYear(now.getFullYear() - 1));

    const [enrollments, attendance, courses, users] = await Promise.all([
      prisma.enrollment.findMany({ where: { enrolledAt: { gte: startDate } }, orderBy: { enrolledAt: 'asc' } }),
      prisma.attendance.findMany({ where: { date: { gte: startDate } }, orderBy: { date: 'asc' } }),
      prisma.course.findMany({ include: { _count: { select: { enrollments: true } } } }),
      prisma.user.groupBy({ by: ['role'], _count: true }),
    ]);

    res.json({ enrollments, attendance, courses, users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/audit-logs
router.get('/audit-logs', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } } },
      }),
      prisma.auditLog.count(),
    ]);
    res.json({ logs, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/settings
router.get('/settings', async (req, res) => {
  try {
    const settings = await prisma.systemSetting.findMany();
    res.json({ settings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/settings', async (req, res) => {
  try {
    const { key, value, category } = req.body;
    const setting = await prisma.systemSetting.upsert({
      where: { key },
      update: { value, category },
      create: { key, value, category },
    });
    res.json({ setting });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/announcements
router.post('/announcements', async (req, res) => {
  try {
    const { title, content, priority, pinned } = req.body;
    const announcement = await prisma.announcement.create({
      data: { authorId: req.userId, title, content, priority: priority || 'normal', pinned: pinned || false },
    });

    // Notify all users
    const users = await prisma.user.findMany({ select: { id: true } });
    await prisma.notification.createMany({
      data: users.map(u => ({
        userId: u.id,
        title: 'System Announcement',
        message: title,
        category: 'announcement',
        priority: priority || 'normal',
      })),
    });

    res.status(201).json({ announcement });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/database-health
router.get('/database-health', async (req, res) => {
  try {
    const counts = await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.enrollment.count(),
      prisma.assignment.count(),
      prisma.attendance.count(),
      prisma.quiz.count(),
      prisma.certificate.count(),
      prisma.notification.count(),
      prisma.message.count(),
    ]);

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      counts: {
        users: counts[0],
        courses: counts[1],
        enrollments: counts[2],
        assignments: counts[3],
        attendance: counts[4],
        quizzes: counts[5],
        certificates: counts[6],
        notifications: counts[7],
        messages: counts[8],
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;