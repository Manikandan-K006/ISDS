const router = require('express').Router();
const prisma = require('../prisma');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize('admin'));

// GET /api/admin/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const [totalUsers, totalStudents, totalTeachers, totalParents, totalRecruiters, totalCourses, totalDepartments, totalPrograms, totalSemesters, recentUsers, recentActivity] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'student' } }),
      prisma.user.count({ where: { role: 'teacher' } }),
      prisma.user.count({ where: { role: 'parent' } }),
      prisma.user.count({ where: { role: 'recruiter' } }),
      prisma.course.count(),
      prisma.department.count(),
      prisma.program.count(),
      prisma.semester.count(),
      prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 10, select: { id: true, name: true, email: true, role: true, profilePhoto: true, createdAt: true } }),
      prisma.activityLog.findMany({ orderBy: { createdAt: 'desc' }, take: 20, include: { user: { select: { name: true, profilePhoto: true } } } }),
    ]);

    res.json({
      stats: { totalUsers, totalStudents, totalTeachers, totalParents, totalRecruiters, totalCourses, totalDepartments, totalPrograms, totalSemesters },
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
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, role: true, profilePhoto: true, isActive: true, isVerified: true, class: true, departmentId: true, programId: true, section: true, semester: true, registerNumber: true, cgpa: true, placementStatus: true, subject: true, employeeId: true, createdAt: true, lastLogin: true, department: { select: { id: true, name: true, code: true } }, program: { select: { id: true, name: true, code: true } } },
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
      include: { department: true, program: true, facultyAdvisor: { select: { id: true, name: true, email: true } }, settings: true, internships: true, researchPapers: true, _count: { select: { enrollments: true, attendances: true, certificates: true } } },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const { name, email, role, isActive, class: className, departmentId, programId, section, semester, batch, registerNumber, placementStatus, subject, employeeId } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        name, email, role, isActive,
        class: className,
        departmentId, programId, section,
        semester: semester !== undefined && semester !== null && semester !== '' ? parseInt(semester) : undefined,
        batch, registerNumber, placementStatus,
        subject, employeeId,
      },
      select: { id: true, name: true, email: true, role: true, isActive: true, section: true, semester: true, programId: true },
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
      include: { _count: { select: { users: true, courses: true, programs: true } } },
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

// Program Management
router.get('/programs', async (req, res) => {
  try {
    const programs = await prisma.program.findMany({
      include: { department: { select: { id: true, name: true, code: true } }, _count: { select: { users: true, semesters: true } } },
      orderBy: { name: 'asc' },
    });
    res.json({ programs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/programs', async (req, res) => {
  try {
    const { name, code, departmentId, level, durationYears, creditsRequired } = req.body;
    if (!name || !code || !departmentId) return res.status(400).json({ error: 'Name, code, and department are required.' });
    const program = await prisma.program.create({
      data: { name, code, departmentId, level: level || 'UG', durationYears: parseInt(durationYears) || 4, creditsRequired: parseInt(creditsRequired) || 0 },
    });
    await prisma.auditLog.create({ data: { adminId: req.userId, action: 'create_program', resource: 'program', resourceId: program.id } });
    res.status(201).json({ program });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/programs/:id', async (req, res) => {
  try {
    const { name, code, departmentId, level, durationYears, creditsRequired, isActive } = req.body;
    const program = await prisma.program.update({
      where: { id: req.params.id },
      data: { name, code, departmentId, level, durationYears: durationYears !== undefined && durationYears !== '' ? parseInt(durationYears) : undefined, creditsRequired: creditsRequired !== undefined && creditsRequired !== '' ? parseInt(creditsRequired) : undefined, isActive },
    });
    res.json({ program });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/programs/:id', async (req, res) => {
  try {
    await prisma.program.delete({ where: { id: req.params.id } });
    res.json({ message: 'Program deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Semester Management
router.get('/semesters', async (req, res) => {
  try {
    const { programId } = req.query;
    const semesters = await prisma.semester.findMany({
      where: programId ? { programId } : undefined,
      include: { program: { select: { id: true, name: true, code: true } } },
      orderBy: [{ program: { name: 'asc' } }, { number: 'asc' }],
    });
    res.json({ semesters });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/semesters', async (req, res) => {
  try {
    const { programId, number, name, startDate, endDate, isActive } = req.body;
    if (!programId || !number) return res.status(400).json({ error: 'Program and semester number are required.' });
    const semester = await prisma.semester.create({
      data: { programId, number: parseInt(number), name, startDate: startDate ? new Date(startDate) : null, endDate: endDate ? new Date(endDate) : null, isActive: !!isActive },
    });
    res.status(201).json({ semester });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/semesters/:id', async (req, res) => {
  try {
    const { number, name, startDate, endDate, isActive } = req.body;
    const semester = await prisma.semester.update({
      where: { id: req.params.id },
      data: { number: number !== undefined && number !== '' ? parseInt(number) : undefined, name, startDate: startDate ? new Date(startDate) : null, endDate: endDate ? new Date(endDate) : null, isActive },
    });
    res.json({ semester });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/semesters/:id', async (req, res) => {
  try {
    await prisma.semester.delete({ where: { id: req.params.id } });
    res.json({ message: 'Semester deleted' });
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
      }),
      prisma.auditLog.count(),
    ]);

    const adminIds = [...new Set(logs.map((l) => l.adminId).filter(Boolean))];
    const admins = adminIds.length
      ? await prisma.user.findMany({ where: { id: { in: adminIds } }, select: { id: true, name: true, email: true } })
      : [];
    const adminMap = Object.fromEntries(admins.map((a) => [a.id, a]));

    res.json({
      logs: logs.map((l) => ({ ...l, admin: adminMap[l.adminId] || null })),
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
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

// ------------------------------------------------------------
// Jobs (admin-managed)
// ------------------------------------------------------------
const parseJson = (value, fallback = []) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
  return fallback;
};

router.get('/jobs', async (req, res) => {
  try {
    const { status, type } = req.query;
    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;
    const jobs = await prisma.job.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { postedBy: { select: { id: true, name: true } }, _count: { select: { applications: true } } },
    });
    res.json({ jobs: jobs.map((j) => ({ ...j, requiredSkills: parseJson(j.requiredSkills) })) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/jobs', async (req, res) => {
  try {
    const { title, company, type, description, location, stipend, minCGPA, minAttendance, minProjects, requiredSkills, minSkillScore, experienceLevel, status, deadline } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ error: 'Job title is required' });
    if (!company || !company.trim()) return res.status(400).json({ error: 'Company is required' });

    const job = await prisma.job.create({
      data: {
        title: title.trim(),
        company: company.trim(),
        type: type || 'job',
        description: description || null,
        location: location || null,
        stipend: stipend || null,
        minCGPA: minCGPA != null ? parseFloat(minCGPA) : null,
        minAttendance: minAttendance != null ? parseFloat(minAttendance) : null,
        minProjects: minProjects != null ? parseInt(minProjects) : 0,
        requiredSkills: JSON.stringify(requiredSkills || []),
        minSkillScore: minSkillScore != null ? parseInt(minSkillScore) : 0,
        experienceLevel: experienceLevel || null,
        status: status || 'draft',
        deadline: deadline ? new Date(deadline) : null,
        postedById: req.userId,
      },
    });
    res.status(201).json({ job });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/jobs/:id', async (req, res) => {
  try {
    const existing = await prisma.job.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Job not found' });

    const allowed = ['title', 'company', 'type', 'description', 'location', 'stipend', 'minCGPA', 'minAttendance', 'minProjects', 'minSkillScore', 'experienceLevel', 'status', 'deadline'];
    const data = {};
    allowed.forEach((k) => {
      if (req.body[k] !== undefined) {
        if (k === 'minCGPA' || k === 'minAttendance') data[k] = parseFloat(req.body[k]);
        else if (k === 'minProjects' || k === 'minSkillScore') data[k] = parseInt(req.body[k]);
        else if (k === 'deadline') data[k] = req.body[k] ? new Date(req.body[k]) : null;
        else data[k] = req.body[k];
      }
    });
    if (req.body.requiredSkills !== undefined) data.requiredSkills = JSON.stringify(req.body.requiredSkills);

    const job = await prisma.job.update({ where: { id: req.params.id }, data });
    res.json({ job });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/jobs/:id', async (req, res) => {
  try {
    await prisma.job.delete({ where: { id: req.params.id } });
    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/applications', async (req, res) => {
  try {
    const { status, jobId } = req.query;
    const where = {};
    if (status) where.status = status;
    if (jobId) where.jobId = jobId;
    const applications = await prisma.jobApplication.findMany({
      where,
      include: { job: { select: { id: true, title: true, company: true } }, student: { select: { id: true, name: true, email: true, profilePhoto: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ applications });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------------------------------------------------
// Certificate review
// ------------------------------------------------------------
router.get('/certificates/review', async (req, res) => {
  try {
    const { status = 'pending', page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [certificates, total] = await Promise.all([
      prisma.certificate.findMany({
        where: { status },
        skip,
        take: parseInt(limit),
        orderBy: { issuedAt: 'desc' },
        include: { student: { select: { id: true, name: true, email: true } } },
      }),
      prisma.certificate.count({ where: { status } }),
    ]);
    res.json({ certificates, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/certificates/:id/status', async (req, res) => {
  try {
    const { status, reviewNote } = req.body;
    if (!['pending', 'verified', 'rejected'].includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const certificate = await prisma.certificate.findUnique({ where: { id: req.params.id } });
    if (!certificate) return res.status(404).json({ error: 'Certificate not found' });

    const updated = await prisma.certificate.update({
      where: { id: req.params.id },
      data: { status, reviewNote: reviewNote || null },
    });

    await prisma.notification.create({
      data: {
        userId: certificate.studentId,
        title: status === 'verified' ? 'Certificate verified' : 'Certificate review update',
        message: `"${certificate.title}" was ${status}${reviewNote ? ` — ${reviewNote}` : ''}`,
        category: 'certificate',
        link: '/student/certificates',
      },
    });

    res.json({ certificate: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;