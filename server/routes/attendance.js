const router = require('express').Router();
const { queryDocs, addDoc, getDoc, updateDoc } = require('../config/firestore');
const { notify } = require('../services/notify');

router.get('/', async (req, res) => {
  try {
    const { studentId, month, year } = req.query;
    let conditions = [];
    if (studentId) conditions.push(['studentId', '==', studentId]);
    let records = await queryDocs('attendance', conditions, 'date', 'asc');

    if (month && year) {
      const m = parseInt(month);
      const y = parseInt(year);
      records = records.filter(r => {
        const d = new Date(r.date);
        return d.getMonth() === m - 1 && d.getFullYear() === y;
      });
    }

    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { studentId, date, status, reason } = req.body;
    const existing = await queryDocs('attendance', [
      ['studentId', '==', studentId],
      ['date', '==', date],
    ]);
    let record;
    if (existing.length > 0) {
      record = await updateDoc('attendance', existing[0]._id, { status, reason });
    } else {
      record = await addDoc('attendance', { studentId, date, status, reason });
    }
    if (status === 'absent') {
      const student = await getDoc('users', studentId);
      await notify({
        userId: studentId,
        title: 'Attendance Alert',
        message: `You were marked absent on ${date}`,
        type: 'attendance_alert',
        relatedId: record._id,
        link: '/attendance',
        templateData: { studentName: student?.name || 'Student', courseName: '' },
      });
    }
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/leave', async (req, res) => {
  try {
    const { studentId, date, reason } = req.body;
    const existing = await queryDocs('attendance', [
      ['studentId', '==', studentId],
      ['date', '==', date],
    ]);
    let record;
    if (existing.length > 0) {
      record = await updateDoc('attendance', existing[0]._id, { status: 'leave', reason });
    } else {
      record = await addDoc('attendance', { studentId, date, status: 'leave', reason });
    }
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
