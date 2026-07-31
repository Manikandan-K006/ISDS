const router = require('express').Router();
const prisma = require('../prisma');
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');

router.use(authenticate);

const editableFields = ['title', 'description', 'startDate', 'endDate', 'allDay', 'type', 'color'];

const findOwnedEvent = async (id, userId) => {
  const event = await prisma.calendarEvent.findFirst({ where: { id, userId } });
  return event;
};

router.get('/', asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const where = { userId: req.userId };
  if (startDate) where.startDate = { gte: new Date(startDate) };
  if (endDate) where.endDate = { ...(where.endDate || {}), lte: new Date(endDate) };
  const events = await prisma.calendarEvent.findMany({ where, orderBy: { startDate: 'asc' } });
  res.json({ events });
}));

router.post('/', asyncHandler(async (req, res) => {
  const { title, description, startDate, endDate, allDay, type, color } = req.body;
  if (!title || !startDate) {
    return res.status(400).json({ error: 'Title and start date are required.' });
  }
  const event = await prisma.calendarEvent.create({
    data: {
      userId: req.userId,
      title,
      description: description || null,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      allDay: !!allDay,
      type: type || 'general',
      color: color || null,
    },
  });
  res.status(201).json({ event });
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const event = await findOwnedEvent(req.params.id, req.userId);
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }
  const data = {};
  for (const field of editableFields) {
    if (req.body[field] !== undefined) {
      data[field] = field.endsWith('Date') && req.body[field] ? new Date(req.body[field]) : req.body[field];
    }
  }
  const updated = await prisma.calendarEvent.update({ where: { id: event.id }, data });
  res.json({ event: updated });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const event = await findOwnedEvent(req.params.id, req.userId);
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }
  await prisma.calendarEvent.delete({ where: { id: event.id } });
  res.json({ success: true });
}));

module.exports = router;
