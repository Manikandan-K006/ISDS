const router = require('express').Router();
const prisma = require('../prisma');
const { authenticate, authorize } = require('../middleware/auth');
const { computeEligibility, computeCareerReadiness } = require('../utils/career');
const { computeStudentSkills } = require('../utils/skills');
const { CAREER_ROLES } = require('../config/career');
const { getStudentProfile } = require('../utils/profile');

router.use(authenticate);

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

// ------------------------------------------------------------
// Career profile
// ------------------------------------------------------------
router.get('/profile', authorize('student'), async (req, res) => {
  try {
    const profile = await prisma.careerProfile.findUnique({ where: { studentId: req.userId } });
    res.json({
      profile: profile ? { ...profile, experience: parseJson(profile.experience, []), education: parseJson(profile.education, []) } : null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/profile', authorize('student'), async (req, res) => {
  try {
    const { headline, summary, github, linkedin, portfolioUrl, resumeUrl, experience, education, isPublic } = req.body;
    const profile = await prisma.careerProfile.upsert({
      where: { studentId: req.userId },
      update: {
        headline: headline ?? undefined,
        summary: summary ?? undefined,
        github: github ?? undefined,
        linkedin: linkedin ?? undefined,
        portfolioUrl: portfolioUrl ?? undefined,
        resumeUrl: resumeUrl ?? undefined,
        experience: experience !== undefined ? JSON.stringify(experience) : undefined,
        education: education !== undefined ? JSON.stringify(education) : undefined,
        isPublic: isPublic ?? undefined,
      },
      create: {
        studentId: req.userId,
        headline: headline || null,
        summary: summary || null,
        github: github || null,
        linkedin: linkedin || null,
        portfolioUrl: portfolioUrl || null,
        resumeUrl: resumeUrl || null,
        experience: JSON.stringify(experience || []),
        education: JSON.stringify(education || []),
        isPublic: isPublic ?? true,
      },
    });
    res.json({ profile: { ...profile, experience: parseJson(profile.experience, []), education: parseJson(profile.education, []) } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/readiness', authorize('student'), async (req, res) => {
  try {
    const skills = await computeStudentSkills(prisma, req.userId);
    const roles = CAREER_ROLES.map((role) => ({
      key: role.key,
      label: role.label,
      description: role.description,
      ...computeCareerReadiness(skills, role.targets),
    })).sort((a, b) => b.readiness - a.readiness);
    res.json({ roles });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------------------------------------------------
// Jobs
// ------------------------------------------------------------
router.get('/jobs', authorize('student', 'teacher', 'admin', 'recruiter'), async (req, res) => {
  try {
    const { type, search } = req.query;
    const where = { status: 'open' };
    if (type) where.type = type;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }
    const jobs = await prisma.job.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.json({ jobs: jobs.map((j) => ({ ...j, requiredSkills: parseJson(j.requiredSkills) })) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/jobs/:id', authorize('student', 'teacher', 'admin', 'recruiter'), async (req, res) => {
  try {
    const job = await prisma.job.findUnique({ where: { id: req.params.id }, include: { postedBy: { select: { id: true, name: true } } } });
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json({ job: { ...job, requiredSkills: parseJson(job.requiredSkills) } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/jobs/:id/eligibility', authorize('student'), async (req, res) => {
  try {
    const job = await prisma.job.findUnique({ where: { id: req.params.id } });
    if (!job) return res.status(404).json({ error: 'Job not found' });
    const profile = await getStudentProfile(prisma, req.userId);
    const eligibility = computeEligibility(job, profile);
    res.json({ eligibility });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/jobs/:id/apply', authorize('student'), async (req, res) => {
  try {
    const job = await prisma.job.findUnique({ where: { id: req.params.id } });
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (job.status !== 'open') return res.status(400).json({ error: 'This position is no longer open' });

    const profile = await getStudentProfile(prisma, req.userId);
    const eligibility = computeEligibility(job, profile);

    const existing = await prisma.jobApplication.findUnique({ where: { jobId_studentId: { jobId: job.id, studentId: req.userId } } });
    if (existing) return res.status(409).json({ error: 'You have already applied for this position' });

    const careerProfile = await prisma.careerProfile.findUnique({ where: { studentId: req.userId } });
    const application = await prisma.jobApplication.create({
      data: {
        jobId: job.id,
        studentId: req.userId,
        eligibility: JSON.stringify(eligibility),
        resumeSnapshot: JSON.stringify({
          headline: careerProfile?.headline || null,
          summary: careerProfile?.summary || null,
          github: careerProfile?.github || null,
          linkedin: careerProfile?.linkedin || null,
          portfolioUrl: careerProfile?.portfolioUrl || null,
          resumeUrl: careerProfile?.resumeUrl || null,
        }),
      },
    });

    await prisma.notification.create({
      data: {
        userId: job.postedById,
        title: 'New application',
        message: `${req.user.name} applied for "${job.title}" at ${job.company}`,
        category: 'message',
        link: `/recruiter/applications`,
      },
    });

    res.status(201).json({ application, eligibility });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/applications', authorize('student'), async (req, res) => {
  try {
    const applications = await prisma.jobApplication.findMany({
      where: { studentId: req.userId },
      include: { job: { select: { id: true, title: true, company: true, type: true, location: true, stipend: true, status: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ applications: applications.map((a) => ({ ...a, eligibility: a.eligibility ? parseJson(a.eligibility) : null })) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/resume/preview', authorize('student'), async (req, res) => {
  try {
    const [profile, studentSkills, projects, enrollments, certificates] = await Promise.all([
      prisma.careerProfile.findUnique({ where: { studentId: req.userId } }),
      computeStudentSkills(prisma, req.userId),
      prisma.project.findMany({ where: { studentId: req.userId, visibility: 'public' }, orderBy: { updatedAt: 'desc' } }),
      prisma.enrollment.findMany({
        where: { studentId: req.userId, isCompleted: true, score: { not: null } },
        include: { course: { select: { title: true } } },
      }),
      prisma.certificate.findMany({ where: { studentId: req.userId, status: 'verified' } }),
    ]);

    const topSkills = studentSkills
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((s) => s.name);

    res.json({
      resume: {
        name: req.user.name,
        email: req.user.email,
        headline: profile?.headline || null,
        summary: profile?.summary || null,
        links: {
          github: profile?.github || null,
          linkedin: profile?.linkedin || null,
          portfolioUrl: profile?.portfolioUrl || null,
        },
        education: profile?.education ? parseJson(profile.education) : [],
        experience: profile?.experience ? parseJson(profile.experience) : [],
        skills: topSkills,
        projects: projects.map((p) => ({ title: p.title, description: p.description, techStack: parseJson(p.techStack), githubUrl: p.githubUrl, demoUrl: p.demoUrl })),
        educationDetails: enrollments.map((e) => ({ title: e.course.title, score: e.score })),
        certificates: certificates.map((c) => ({ title: c.title || c.name, organization: c.organization || null })),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
