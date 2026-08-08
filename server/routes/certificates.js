const router = require('express').Router();
const path = require('path');
const fs = require('fs');
const prisma = require('../prisma');
const { authenticate, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');
const { parseJson } = require('../utils/json');
const { sendEmail } = require('../services/email');
const {
  generateCertificateId,
  generateVerificationHash,
  saveCertificateFiles,
  getCertificateDir,
} = require('../services/certificateGenerator');

const toDate = (v) => (v ? new Date(v) : null);

const canAccessCertificate = async (req, certificate) => {
  if (req.userRole === 'admin') return true;
  if (req.userRole === 'student') return certificate.studentId === req.userId;
  if (req.userRole === 'teacher') {
    const course = await prisma.course.findUnique({
      where: { id: certificate.courseId },
      select: { instructorId: true },
    });
    return !!course && course.instructorId === req.userId;
  }
  return false;
};

const buildCertData = (certificate, studentName, courseTitle) => ({
  certificateId: certificate.certificateId,
  studentName,
  courseName: courseTitle,
  duration: parseJson(certificate.metadata, {})?.duration || null,
  percentage: certificate.percentage,
  score: certificate.score,
  grade: certificate.grade,
  completionDate: certificate.completionDate || certificate.issuedAt,
});

const sendStudentEmail = async (email, certificate) => {
  try {
    await sendEmail({
      to: email,
      subject: `Certificate Issued - ${certificate.title}`,
      html: `<p>Congratulations! Your certificate for <strong>${certificate.title}</strong> has been issued.</p><p>Verify it at ${process.env.FRONTEND_URL || ''}/verify/${certificate.certificateId}</p>`,
    });
  } catch (err) {
    console.error('Certificate email error:', err.message);
  }
};

// Public: verify a certificate by id or certificateId (ISDS-....)
router.get('/verify/:id', asyncHandler(async (req, res) => {
  let certificate = await prisma.certificate.findUnique({
    where: { id: req.params.id },
    include: { student: { select: { name: true } }, course: { select: { title: true } } },
  });
  if (!certificate) {
    certificate = await prisma.certificate.findFirst({
      where: { certificateId: req.params.id },
      include: { student: { select: { name: true } }, course: { select: { title: true } } },
    });
  }
  if (!certificate) {
    return res.status(404).json({ error: 'Certificate not found', valid: false });
  }
  await prisma.certificateVerification.create({
    data: { certificateId: certificate.id, verifierIp: req.ip },
  });
  res.json({
    valid: true,
    certificate: {
      id: certificate.id,
      certificateId: certificate.certificateId,
      studentName: certificate.student.name,
      courseTitle: certificate.course.title,
      title: certificate.title,
      grade: certificate.grade,
      percentage: certificate.percentage,
      issuedAt: certificate.issuedAt,
      isRevoked: certificate.isRevoked,
    },
  });
}));

router.use(authenticate);

// GET /api/certificates
router.get('/', asyncHandler(async (req, res) => {
  let where = {};
  if (req.userRole === 'student') {
    where = { studentId: req.userId };
  } else if (req.userRole === 'teacher') {
    const courses = await prisma.course.findMany({
      where: { instructorId: req.userId },
      select: { id: true },
    });
    where = { courseId: { in: courses.map((c) => c.id) } };
  }
  const certificates = await prisma.certificate.findMany({
    where,
    include: { course: { select: { title: true, thumbnail: true } }, student: { select: { name: true } } },
    orderBy: { issuedAt: 'desc' },
  });
  res.json({ certificates });
}));

// POST /api/certificates (issue)
router.post('/', authorize('teacher', 'admin'), asyncHandler(async (req, res) => {
  const { studentId, courseId, title, description, grade, percentage, score, completionDate } = req.body;
  if (!studentId || !courseId) {
    return res.status(400).json({ error: 'studentId and courseId are required.' });
  }

  const [student, course] = await Promise.all([
    prisma.user.findUnique({ where: { id: studentId } }),
    prisma.course.findUnique({ where: { id: courseId } }),
  ]);
  if (!student) return res.status(404).json({ error: 'Student not found.' });
  if (!course) return res.status(404).json({ error: 'Course not found.' });
  if (req.userRole === 'teacher' && course.instructorId !== req.userId) {
    return res.status(403).json({ error: 'You can only issue certificates for courses you teach.' });
  }

  const existing = await prisma.certificate.findUnique({
    where: { studentId_courseId: { studentId, courseId } },
  });
  if (existing && !existing.isRevoked) {
    return res.status(400).json({ error: 'Certificate already issued for this student and course.' });
  }

  const certificateId = generateCertificateId('gen');
  const verificationHash = generateVerificationHash();
  const certTitle = title || `${course.title} - Certificate`;
  const pct = percentage !== undefined && percentage !== null ? parseFloat(percentage) : null;
  const certDataForFiles = {
    certificateId,
    studentName: student.name,
    courseName: course.title,
    duration: course.duration,
    percentage: pct,
    score: score !== undefined ? score : null,
    grade: grade || null,
    completionDate: toDate(completionDate),
  };

  let fileUrls = {};
  try {
    fileUrls = await saveCertificateFiles(certDataForFiles);
  } catch (err) {
    console.error('Certificate file generation failed:', err.message);
  }

  const certificate = await prisma.certificate.create({
    data: {
      certificateId,
      studentId,
      courseId,
      title: certTitle,
      description: description || null,
      grade: grade || null,
      percentage: pct,
      score: score !== undefined ? parseFloat(score) : null,
      completionDate: toDate(completionDate),
      certificateUrl: fileUrls.pdfUrl || null,
      verificationHash,
      metadata: { duration: course.duration },
    },
  });

  await prisma.notification.create({
    data: {
      userId: studentId,
      title: 'Certificate Issued',
      message: `You earned "${certTitle}"`,
      category: 'certificate',
      link: '/certificates',
    },
  });

  await sendStudentEmail(student.email, certificate);

  res.status(201).json({ certificate });
}));

// GET /api/certificates/admin/stats
router.get('/admin/stats', authorize('admin'), asyncHandler(async (req, res) => {
  const [total, revoked, agg, verifications] = await Promise.all([
    prisma.certificate.count(),
    prisma.certificate.count({ where: { isRevoked: true } }),
    prisma.certificate.aggregate({ _sum: { downloads: true, shares: true } }),
    prisma.certificateVerification.count(),
  ]);
  const recent = await prisma.certificate.findMany({
    orderBy: { issuedAt: 'desc' },
    take: 5,
    include: { student: { select: { name: true } }, course: { select: { title: true } } },
  });
  res.json({
    stats: {
      total,
      revoked,
      active: total - revoked,
      downloads: agg._sum.downloads || 0,
      shares: agg._sum.shares || 0,
      verifications,
    },
    recent,
  });
}));

// GET /api/certificates/admin/logs
router.get('/admin/logs', authorize('admin'), asyncHandler(async (req, res) => {
  const logs = await prisma.certificateVerification.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { certificate: { select: { certificateId: true, title: true } } },
  });
  res.json({ logs });
}));

// GET /api/certificates/:id
router.get('/:id', asyncHandler(async (req, res) => {
  const certificate = await prisma.certificate.findUnique({
    where: { id: req.params.id },
    include: {
      course: { select: { title: true, thumbnail: true, duration: true } },
      student: { select: { id: true, name: true, email: true } },
    },
  });
  if (!certificate) return res.status(404).json({ error: 'Certificate not found' });
  if (!(await canAccessCertificate(req, certificate))) {
    return res.status(403).json({ error: 'You do not have permission to view this certificate.' });
  }
  res.json({ certificate });
}));

// GET /api/certificates/file/:type/:id
router.get('/file/:type/:id', asyncHandler(async (req, res) => {
  const { type, id } = req.params;
  const allowed = { pdf: 'application/pdf', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', png: 'image/png' };
  if (!allowed[type]) return res.status(400).json({ error: 'Unsupported file type.' });

  const certificate = await prisma.certificate.findFirst({
    where: { OR: [{ id }, { certificateId: id }] },
  });
  if (!certificate) return res.status(404).json({ error: 'Certificate not found' });
  if (!(await canAccessCertificate(req, certificate)) && type !== 'png') {
    return res.status(403).json({ error: 'You do not have permission to download this file.' });
  }

  const baseName = (certificate.certificateId || certificate.id).replace(/[^a-zA-Z0-9-]/g, '_');
  const filePath = path.join(getCertificateDir(), `${baseName}.${type}`);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Certificate file not generated yet.' });
  }
  res.setHeader('Content-Type', allowed[type]);
  res.sendFile(filePath);
}));

// PUT /api/certificates/:id/revoke
router.put('/:id/revoke', authorize('teacher', 'admin'), asyncHandler(async (req, res) => {
  const certificate = await prisma.certificate.findUnique({ where: { id: req.params.id } });
  if (!certificate) return res.status(404).json({ error: 'Certificate not found' });
  if (req.userRole === 'teacher' && !(await canAccessCertificate(req, certificate))) {
    return res.status(403).json({ error: 'You can only revoke certificates for courses you teach.' });
  }
  const { reason } = req.body;
  const updated = await prisma.certificate.update({
    where: { id: certificate.id },
    data: { isRevoked: true, revokedAt: new Date(), revokedReason: reason || null },
  });
  res.json({ certificate: updated });
}));

// PUT /api/certificates/:id/restore
router.put('/:id/restore', authorize('teacher', 'admin'), asyncHandler(async (req, res) => {
  const certificate = await prisma.certificate.findUnique({ where: { id: req.params.id } });
  if (!certificate) return res.status(404).json({ error: 'Certificate not found' });
  if (req.userRole === 'teacher' && !(await canAccessCertificate(req, certificate))) {
    return res.status(403).json({ error: 'You can only restore certificates for courses you teach.' });
  }
  const updated = await prisma.certificate.update({
    where: { id: certificate.id },
    data: { isRevoked: false, revokedAt: null, revokedReason: null },
  });
  res.json({ certificate: updated });
}));

// PUT /api/certificates/:id/regenerate
router.put('/:id/regenerate', authorize('teacher', 'admin'), asyncHandler(async (req, res) => {
  const certificate = await prisma.certificate.findUnique({
    where: { id: req.params.id },
    include: { student: { select: { name: true } }, course: { select: { title: true, duration: true } } },
  });
  if (!certificate) return res.status(404).json({ error: 'Certificate not found' });
  if (req.userRole === 'teacher' && certificate.course.instructorId !== req.userId) {
    return res.status(403).json({ error: 'You can only regenerate certificates for courses you teach.' });
  }
  const certData = buildCertData(certificate, certificate.student.name, certificate.course.title);
  const fileUrls = await saveCertificateFiles(certData);
  const updated = await prisma.certificate.update({
    where: { id: certificate.id },
    data: { certificateUrl: fileUrls.pdfUrl || certificate.certificateUrl },
  });
  res.json({ certificate: updated });
}));

// PUT /api/certificates/:id/download
router.put('/:id/download', asyncHandler(async (req, res) => {
  const certificate = await prisma.certificate.findUnique({ where: { id: req.params.id } });
  if (!certificate) return res.status(404).json({ error: 'Certificate not found' });
  if (!(await canAccessCertificate(req, certificate))) {
    return res.status(403).json({ error: 'You do not have permission to download this certificate.' });
  }
  const updated = await prisma.certificate.update({
    where: { id: certificate.id },
    data: { downloads: { increment: 1 } },
  });
  res.json({ certificate: updated });
}));

// PUT /api/certificates/:id/share
router.put('/:id/share', asyncHandler(async (req, res) => {
  const certificate = await prisma.certificate.findUnique({ where: { id: req.params.id } });
  if (!certificate) return res.status(404).json({ error: 'Certificate not found' });
  if (!(await canAccessCertificate(req, certificate))) {
    return res.status(403).json({ error: 'You do not have permission to share this certificate.' });
  }
  const updated = await prisma.certificate.update({
    where: { id: certificate.id },
    data: { shares: { increment: 1 } },
  });
  res.json({ certificate: updated });
}));

// DELETE /api/certificates/:id
router.delete('/:id', authorize('admin'), asyncHandler(async (req, res) => {
  const certificate = await prisma.certificate.findUnique({ where: { id: req.params.id } });
  if (!certificate) return res.status(404).json({ error: 'Certificate not found' });
  await prisma.certificate.delete({ where: { id: certificate.id } });
  res.json({ success: true });
}));

module.exports = router;
