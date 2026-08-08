const router = require('express').Router();
const prisma = require('../prisma');
const { authenticate, authorize } = require('../middleware/auth');
const { computeStudentSkills } = require('../utils/skills');

router.use(authenticate);
router.use(authorize('recruiter', 'admin'));

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

const jobInclude = {
  id: true, title: true, company: true, type: true, location: true, stipend: true, status: true, deadline: true, postedById: true,
};

router.get('/stats', async (req, res) => {
  try {
    const where = req.userRole === 'recruiter' ? { postedById: req.userId } : {};
    const [jobs, applications, shortlisted, selected] = await Promise.all([
      prisma.job.count({ where }),
      prisma.jobApplication.count({ where: { job: where } }),
      prisma.jobApplication.count({ where: { job: where, status: 'shortlisted' } }),
      prisma.jobApplication.count({ where: { job: where, status: 'selected' } }),
    ]);
    res.json({ stats: { jobs, applications, shortlisted, selected } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/departments', async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
    res.json({ departments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------------------------------------------------
// Candidate discovery
//
// Server-side filtering so recruiters can slice the talent pool
// without pulling full portfolios. Only students with a PUBLIC
// career profile appear; sensitive data is never exposed.
//   GET /api/recruiter/candidates
//     ?search=&departmentId=&minCgpa=&hasInternship=true&hasResearch=true
//     &minSkillScore=&limit=
// ------------------------------------------------------------
router.get('/candidates', async (req, res) => {
  try {
    const { search, departmentId, minCgpa, hasInternship, hasResearch, minSkillScore } = req.query;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);

    const where = {
      role: 'student',
      isActive: true,
      careerProfile: { isPublic: true },
    };
    if (departmentId) where.departmentId = departmentId;
    if (minCgpa) where.cgpa = { gte: parseFloat(minCgpa) };
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { registerNumber: { contains: search } },
        { careerProfile: { headline: { contains: search } } },
      ];
    }
    if (hasInternship === 'true') {
      where.internships = { some: { OR: [{ isVerified: true }, { status: 'completed' }] } };
    }
    if (hasResearch === 'true') {
      where.researchPapers = { some: { OR: [{ isVerified: true }, { status: 'published' }] } };
    }

    const students = await prisma.user.findMany({
      where,
      take: limit,
      orderBy: [{ cgpa: 'desc' }, { name: 'asc' }],
      select: {
        id: true, name: true, email: true, profilePhoto: true, registerNumber: true,
        batch: true, semester: true, cgpa: true, placementStatus: true, careerGoal: true,
        department: { select: { id: true, name: true } },
        careerProfile: { select: { headline: true, summary: true, resumeUrl: true, linkedin: true, github: true } },
        internships: { where: { OR: [{ isVerified: true }, { status: 'completed' }] }, select: { id: true, company: true, role: true } },
        researchPapers: { where: { OR: [{ isVerified: true }, { status: 'published' }] }, select: { id: true, title: true } },
      },
    });

    let candidates = [];
    for (const s of students) {
      const skills = await computeStudentSkills(prisma, s.id);
      const top = skills.filter((x) => x.score > 0).sort((a, b) => b.score - a.score).slice(0, 5).map((x) => ({ name: x.name, score: x.score }));
      const bestScore = top.length ? Math.max(...top.map((t) => t.score)) : 0;
      candidates.push({
        id: s.id,
        name: s.name,
        email: s.email,
        profilePhoto: s.profilePhoto,
        registerNumber: s.registerNumber,
        batch: s.batch,
        semester: s.semester,
        cgpa: s.cgpa,
        placementStatus: s.placementStatus,
        careerGoal: s.careerGoal,
        department: s.department?.name || null,
        headline: s.careerProfile?.headline || null,
        summary: s.careerProfile?.summary || null,
        resumeUrl: s.careerProfile?.resumeUrl || null,
        linkedin: s.careerProfile?.linkedin || null,
        github: s.careerProfile?.github || null,
        internships: s.internships.map((i) => `${i.role} @ ${i.company}`),
        internshipCount: s.internships.length,
        researchCount: s.researchPapers.length,
        topSkills: top,
        bestSkillScore: bestScore,
      });
    }

    if (minSkillScore) {
      const threshold = parseInt(minSkillScore, 10);
      candidates = candidates.filter((c) => c.bestSkillScore >= threshold);
    }

    res.json({ candidates, total: candidates.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/jobs', async (req, res) => {
  try {
    const where = req.userRole === 'recruiter' ? { postedById: req.userId } : {};
    const jobs = await prisma.job.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { applications: true } } },
    });
    res.json({ jobs: jobs.map((j) => ({ ...j, requiredSkills: parseJson(j.requiredSkills) })) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/jobs', async (req, res) => {
  try {
    const { title, company, type, description, location, stipend, minCGPA, minAttendance, minProjects, requiredSkills, minSkillScore, experienceLevel, deadline } = req.body;
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
        status: 'open',
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
    if (existing.postedById !== req.userId && req.userRole !== 'admin') return res.status(403).json({ error: 'You cannot edit this job' });

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

router.get('/applications', async (req, res) => {
  try {
    const where = req.userRole === 'recruiter' ? { job: { postedById: req.userId } } : {};
    const applications = await prisma.jobApplication.findMany({
      where,
      include: {
        job: { select: { ...jobInclude } },
        student: { select: { id: true, name: true, email: true, profilePhoto: true, careerProfile: { select: { headline: true, resumeUrl: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ applications: applications.map((a) => ({ ...a, eligibility: a.eligibility ? parseJson(a.eligibility) : null })) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/applications/:id', async (req, res) => {
  try {
    const application = await prisma.jobApplication.findUnique({
      where: { id: req.params.id },
      include: { job: { select: { ...jobInclude } }, student: { select: { id: true, name: true, email: true, profilePhoto: true } } },
    });
    if (!application) return res.status(404).json({ error: 'Application not found' });
    if (req.userRole === 'recruiter' && application.job.postedById !== req.userId) return res.status(403).json({ error: 'You cannot view this application' });

    const studentId = application.studentId;
    const [careerProfile, skills, projects, certificates] = await Promise.all([
      prisma.careerProfile.findUnique({ where: { studentId } }),
      computeStudentSkills(prisma, studentId),
      prisma.project.findMany({ where: { studentId }, orderBy: { updatedAt: 'desc' }, take: 5 }),
      prisma.certificate.findMany({ where: { studentId, status: 'verified' }, take: 5 }),
    ]);

    res.json({
      application: { ...application, eligibility: application.eligibility ? parseJson(application.eligibility) : null, resumeSnapshot: application.resumeSnapshot ? parseJson(application.resumeSnapshot) : null },
      candidate: {
        profile: careerProfile
          ? { ...careerProfile, experience: parseJson(careerProfile.experience, []), education: parseJson(careerProfile.education, []) }
          : null,
        topSkills: skills.filter((s) => s.score > 0).sort((a, b) => b.score - a.score).slice(0, 8).map((s) => ({ name: s.name, score: s.score })),
        projects: projects.map((p) => ({ id: p.id, title: p.title, status: p.status, techStack: parseJson(p.techStack), githubUrl: p.githubUrl })),
        certificates: certificates.map((c) => ({ title: c.title, organization: c.organization, percentage: c.percentage })),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/applications/:id/status', async (req, res) => {
  try {
    const application = await prisma.jobApplication.findUnique({ where: { id: req.params.id }, include: { job: { select: { id: true, title: true, company: true, postedById: true } } } });
    if (!application) return res.status(404).json({ error: 'Application not found' });
    if (req.userRole === 'recruiter' && application.job.postedById !== req.userId) return res.status(403).json({ error: 'You cannot update this application' });

    const { status } = req.body;
    const valid = ['submitted', 'shortlisted', 'rejected', 'selected'];
    if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const updated = await prisma.jobApplication.update({ where: { id: application.id }, data: { status } });

    await prisma.notification.create({
      data: {
        userId: application.studentId,
        title: 'Application update',
        message: `Your application for "${application.job.title}" at ${application.job.company} is now ${status}`,
        category: 'announcement',
        link: '/career/applications',
      },
    });

    res.json({ application: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
