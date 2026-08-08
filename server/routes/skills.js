const router = require('express').Router();
const prisma = require('../prisma');
const { authenticate, authorize } = require('../middleware/auth');
const { canAccessStudent } = require('../utils/access');
const { computeStudentSkills } = require('../utils/skills');
const { SKILL_CATEGORIES } = require('../config/career');

router.use(authenticate);

router.get('/catalog', async (req, res) => {
  try {
    const skills = await prisma.skill.findMany({ orderBy: { name: 'asc' } });
    res.json({ skills });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', authorize('student', 'teacher', 'admin', 'parent', 'recruiter'), async (req, res) => {
  try {
    const { studentId } = req.query;
    const targetId = studentId || req.userId;
    if (studentId) {
      const allowed = await canAccessStudent(prisma, req.userId, req.userRole, studentId);
      if (!allowed) return res.status(403).json({ error: 'You cannot view this student\'s skills' });
    }
    if (req.userRole === 'recruiter' && studentId) {
      const user = await prisma.user.findUnique({ where: { id: studentId }, select: { careerProfile: { select: { isPublic: true } } } });
      if (!user?.careerProfile?.isPublic) return res.status(403).json({ error: 'This student has not made their skills public' });
    }

    const skills = await computeStudentSkills(prisma, targetId);
    const grouped = {};
    skills.forEach((s) => {
      const category = SKILL_CATEGORIES[s.name] || s.category || 'Other';
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(s);
    });
    res.json({ skills, grouped });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
