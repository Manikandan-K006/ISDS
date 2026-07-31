const router = require('express').Router();
const prisma = require('../prisma');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// GET /api/certificates
router.get('/', async (req, res) => {
  try {
    const where = req.userRole === 'student' ? { studentId: req.userId } : {};
    const certificates = await prisma.certificate.findMany({
      where,
      include: { course: { select: { title: true, thumbnail: true } }, student: { select: { name: true } } },
      orderBy: { issuedAt: 'desc' },
    });
    res.json({ certificates });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/certificates/issue
router.post('/issue', authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { studentId, courseId, title, description } = req.body;
    const existing = await prisma.certificate.findUnique({ where: { studentId_courseId: { studentId, courseId } } });
    if (existing) return res.status(400).json({ error: 'Certificate already issued' });

    const certificate = await prisma.certificate.create({
      data: { studentId, courseId, title, description },
    });

    await prisma.notification.create({
      data: { userId: studentId, title: 'Certificate Issued', message: `You earned "${title}"`, category: 'certificate', link: '/certificates' },
    });

    res.status(201).json({ certificate });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/certificates/verify/:id
router.get('/verify/:id', async (req, res) => {
  try {
    const certificate = await prisma.certificate.findUnique({
      where: { id: req.params.id },
      include: { student: { select: { name: true } }, course: { select: { title: true } } },
    });
    if (!certificate) return res.status(404).json({ error: 'Certificate not found', valid: false });
    res.json({ certificate, valid: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;