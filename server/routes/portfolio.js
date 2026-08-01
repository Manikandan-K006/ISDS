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

// Shared builder for a public portfolio. Only information a student
// opted into (public projects/certificates, verified internships and
// research, a public career profile) is exposed to unauthenticated
// viewers. Everything else stays private.
async function buildPortfolio(studentId) {
  const student = await prisma.user.findUnique({
    where: { id: studentId },
    select: {
      id: true, name: true, email: true, profilePhoto: true, role: true,
      registerNumber: true, semester: true, batch: true, cgpa: true,
      placementStatus: true, careerGoal: true,
      github: true, leetcode: true, codeforces: true, hackerrank: true,
      codingProblemsSolved: true, codingStreak: true,
      department: { select: { name: true } },
      program: { select: { name: true } },
    },
  });
  if (!student || student.role !== 'student') return null;

  const careerProfile = await prisma.careerProfile.findUnique({ where: { studentId } });
  if (!careerProfile || careerProfile.isPublic !== true) return { private: true };

  const [skills, projects, certificates, enrollments, internships, researchPapers] = await Promise.all([
    computeStudentSkills(prisma, studentId),
    prisma.project.findMany({ where: { studentId, visibility: 'public' }, orderBy: { updatedAt: 'desc' } }),
    prisma.certificate.findMany({ where: { studentId, status: 'verified', visibility: 'public' }, take: 6 }),
    prisma.enrollment.findMany({
      where: { studentId, isCompleted: true, score: { not: null } },
      include: { course: { select: { title: true } } },
    }),
    prisma.internship.findMany({ where: { studentId, OR: [{ isVerified: true }, { status: 'completed' }] }, orderBy: { createdAt: 'desc' }, take: 6 }),
    prisma.researchPaper.findMany({ where: { studentId, OR: [{ isVerified: true }, { status: 'published' }] }, orderBy: { createdAt: 'desc' }, take: 6 }),
  ]);

  const avgScore = enrollments.length ? enrollments.reduce((a, e) => a + e.score, 0) / enrollments.length : 0;

  return {
    private: false,
    portfolio: {
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        profilePhoto: student.profilePhoto,
        registerNumber: student.registerNumber,
        semester: student.semester,
        batch: student.batch,
        cgpa: student.cgpa,
        placementStatus: student.placementStatus,
        careerGoal: student.careerGoal,
        department: student.department?.name || null,
        program: student.program?.name || null,
      },
      headline: careerProfile.headline,
      summary: careerProfile.summary,
      links: {
        github: careerProfile.github || student.github,
        linkedin: careerProfile.linkedin,
        portfolioUrl: careerProfile.portfolioUrl,
        leetcode: student.leetcode,
        codeforces: student.codeforces,
        hackerrank: student.hackerrank,
      },
      coding: {
        problemsSolved: student.codingProblemsSolved,
        streak: student.codingStreak,
        profiles: [student.leetcode && `LeetCode: ${student.leetcode}`, student.codeforces && `Codeforces: ${student.codeforces}`, student.hackerrank && `HackerRank: ${student.hackerrank}`].filter(Boolean),
      },
      topSkills: skills.filter((s) => s.score > 0).sort((a, b) => b.score - a.score).slice(0, 10).map((s) => ({ name: s.name, score: s.score, category: s.category })),
      projects: projects.map((p) => ({ id: p.id, title: p.title, description: p.description, techStack: parseJson(p.techStack), githubUrl: p.githubUrl, demoUrl: p.demoUrl, status: p.status })),
      certificates: certificates.map((c) => ({ title: c.title, organization: c.organization, percentage: c.percentage, issueDate: c.issueDate })),
      internships: internships.map((i) => ({ id: i.id, company: i.company, role: i.role, startDate: i.startDate, endDate: i.endDate, status: i.status, summary: i.summary })),
      research: researchPapers.map((r) => ({ id: r.id, title: r.title, type: r.type, venue: r.venue, year: r.year, status: r.status, link: r.link })),
      academics: { courses: enrollments.length, averageScore: Math.round(avgScore * 100) / 100 },
    },
  };
}

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
        student: { select: { id: true, name: true, email: true, profilePhoto: true, registerNumber: true, department: { select: { name: true } } } },
      },
    });
    res.json({ candidates: profiles });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/by-register/:registerNumber', async (req, res) => {
  try {
    const student = await prisma.user.findFirst({
      where: { registerNumber: req.params.registerNumber, role: 'student' },
      select: { id: true },
    });
    if (!student) return res.status(404).json({ error: 'Student not found' });
    const result = await buildPortfolio(student.id);
    if (!result) return res.status(404).json({ error: 'Student not found' });
    if (result.private) return res.status(403).json({ error: 'This profile is private' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:studentId', async (req, res) => {
  try {
    const student = await prisma.user.findUnique({
      where: { id: req.params.studentId },
      select: { id: true, role: true },
    });
    if (!student || student.role !== 'student') return res.status(404).json({ error: 'Student not found' });

    const result = await buildPortfolio(student.id);
    if (!result) return res.status(404).json({ error: 'Student not found' });
    if (result.private) return res.status(403).json({ error: 'This profile is private' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
