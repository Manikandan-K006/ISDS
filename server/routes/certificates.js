const router = require('express').Router();
const crypto = require('crypto');
const { queryDocs, addDoc, getDoc, updateDoc } = require('../config/firestore');
const { notify } = require('../services/notify');

const generateCertificateId = () => {
  const year = new Date().getFullYear();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `ISDS-${year}-${random}`;
};

const frontendOrigin = () => process.env.FRONTEND_URL || 'https://isds.vercel.app';

router.get('/', async (req, res) => {
  try {
    const { studentId } = req.query;
    let conditions = [];
    if (studentId) conditions.push(['studentId', '==', studentId]);
    const certificates = await queryDocs('certificates', conditions, 'createdAt', 'desc');
    const origin = req.headers.origin || frontendOrigin();
    res.json(certificates.map(c => ({ ...c, qrData: `${origin}/verify/${c.certificateId}` })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/verify/:certificateId', async (req, res) => {
  try {
    const { certificateId } = req.params;
    const results = await queryDocs('certificates', [['certificateId', '==', certificateId]]);
    if (results.length === 0) return res.status(404).json({ valid: false, message: 'Certificate not found' });
    const cert = results[0];
    if (cert.status === 'revoked') return res.status(200).json({ valid: false, message: 'Certificate has been revoked', certificateId });
    res.json({
      valid: true,
      certificateId: cert.certificateId,
      studentName: cert.studentName,
      courseName: cert.courseName,
      issueDate: cert.issueDate || cert.createdAt,
      grade: cert.grade,
      status: cert.status || 'active',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const certificateId = generateCertificateId();
    const origin = req.headers.origin || frontendOrigin();
    const certData = {
      ...req.body,
      certificateId,
      qrData: `${origin}/verify/${certificateId}`,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    const cert = await addDoc('certificates', certData);
    await notify({
      userId: cert.studentId,
      title: 'New Certificate Issued',
      message: `Your certificate for ${cert.courseName} is ready. Certificate ID: ${certificateId}`,
      type: 'certificate_issued',
      relatedId: cert._id,
      link: '/certificates',
      templateData: { studentName: cert.studentName, courseName: cert.courseName, certificateId },
    });
    res.status(201).json({ ...cert, certificateId, qrData: certData.qrData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/revoke', async (req, res) => {
  try {
    await updateDoc('certificates', req.params.id, { status: 'revoked' });
    res.json({ message: 'Certificate revoked' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
