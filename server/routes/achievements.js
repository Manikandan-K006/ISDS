const router = require('express').Router();
const prisma = require('../prisma');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const achievements = await prisma.achievement.findMany({ orderBy: { name: 'asc' } });
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId: req.userId },
      include: { achievement: true },
    });
    res.json({ achievements, userAchievements });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/award', authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { userId, achievementId } = req.body;
    const existing = await prisma.userAchievement.findUnique({ where: { userId_achievementId: { userId, achievementId } } });
    if (existing) return res.status(400).json({ error: 'Already awarded' });

    const award = await prisma.userAchievement.create({ data: { userId, achievementId } });
    await prisma.notification.create({
      data: { userId, title: 'Achievement Unlocked!', message: 'You earned a new achievement', category: 'achievement', link: '/achievements' },
    });
    res.status(201).json({ award });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;