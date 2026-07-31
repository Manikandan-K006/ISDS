const router = require('express').Router();
const prisma = require('../prisma');
const { optionalAuth } = require('../middleware/auth');
const { computeStudentSkills } = require('../utils/skills');

router.use(optionalAuth);

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

router.get('/', async (req, res) => {
  try {
    const profiles = await prisma.careerProfile.findMany({
      where: { isPublic: true },
      select: {
        studentId: true,
        headline: true,
        summary: true,
        github: true,
        linkedin: true,
        portfolioUrl: true,
        student: { select: { id: true, name: true, email: true, profilePhoto: true } },
      },
    });
    res.json({ candidates: profiles });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:studentId', async (req, res) => {
  try {
    const student = await prisma.user.findUnique({
      where: { id: req.params.studentId },
      select: { id: true, name: true, email: true, profilePhoto: true, role: true, department: { select: { name: true } } },
    });
    if (!student || student.role !== 'student') return res.status(404).json({ error: 'Student not found' });

    const careerProfile = await prisma.careerProfile.findUnique({ where: { studentId: student.id } });
    if (!careerProfile || careerProfile.isPublic !== true) {
      return res.status(403).json({ error: 'This profile is private' });
    }

    const [skills, projects, certificates, enrollments] = await Promise.all([
      computeStudentSkills(prisma, student.id),
      prisma.project.findMany({ where: { studentId: student.id, visibility: 'public' }, orderBy: { updatedAt: 'desc' } }),
      prisma.certificate.findMany({ where: { studentId: student.id, status: 'verified', visibility: 'public' }, take: 6 }),
      prisma.enrollment.findMany({
        where: { studentId: student.id, isCompleted: true, score: { not: null } },
        include: { course: { select: { title: true } } },
      }),
    ]);

    const avgScore = enrollments.length ? enrollments.reduce((a, e) => a + e.score, 0) / enrollments.length : 0;

    res.json({
      portfolio: {
        student,
        headline: careerProfile.headline,
        summary: careerProfile.summary,
        links: {
          github: careerProfile.github,
          linkedin: careerProfile.linkedin,
          portfolioUrl: careerProfile.portfolioUrl,
        },
        topSkills: skills.filter((s) => s.score > 0).sort((a, b) => b.score - a.score).slice(0, 10).map((s) => ({ name: s.name, score: s.score, category: s.category })),
        projects: projects.map((p) => ({ id: p.id, title: p.title, description: p.description, techStack: parseJson(p.techStack), githubUrl: p.githubUrl, demoUrl: p.demoUrl, status: p.status, evaluation: p.evaluation ? parseJson(p.evaluation) : null })),
        certificates: certificates.map((c) => ({ title: c.title, organization: c.organization, percentage: c.percentage, issueDate: c.issueDate })),
        academics: { courses: enrollments.length, averageScore: Math.round(avgScore * 100) / 100 },
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
