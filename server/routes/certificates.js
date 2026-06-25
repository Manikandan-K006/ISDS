const router = require('express').Router();
const { queryDocs, addDoc } = require('../config/firestore');

router.get('/', async (req, res) => {
  try {
    const { studentId } = req.query;
    let conditions = [];
    if (studentId) conditions.push(['studentId', '==', studentId]);
    const certificates = await queryDocs('certificates', conditions, 'createdAt', 'desc');
    res.json(certificates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const cert = await addDoc('certificates', req.body);
    await addDoc('notifications', {
      userId: cert.studentId,
      title: 'Certificate Generated',
      message: `Your certificate has been generated`,
      type: 'certificate_generated',
      relatedId: cert._id,
      link: `/certificates/${cert._id}`,
    });
    res.status(201).json(cert);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
