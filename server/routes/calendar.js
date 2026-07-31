const router = require('express').Router();
const prisma = require('../prisma');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = { userId: req.userId };
    if (startDate) where.startDate = { gte: new Date(startDate) };
    if (endDate) where.endDate = { ...where.endDate, lte: new Date(endDate) };
    const events = await prisma.calendarEvent.findMany({ where, orderBy: { startDate: 'asc' } });
    res.json({ events });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, description, startDate, endDate, allDay, type, color } = req.body;
    const event = await prisma.calendarEvent.create({
      data: { userId: req.userId, title, description, startDate: new Date(startDate), endDate: endDate ? new Date(endDate) : null, allDay, type, color },
    });
    res.status(201).json({ event });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const event = await prisma.calendarEvent.update({ where: { id: req.params.id }, data: req.body });
    res.json({ event });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.calendarEvent.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;