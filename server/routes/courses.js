const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { collection, addDoc, getDoc, queryDocs, updateDoc, deleteDoc, deleteDocs, formatDoc, formatDocs } = require('../config/firestore');
const { notify } = require('../services/notify');

const uploadDir = path.join(__dirname, '..', 'uploads', 'courses');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
  },
});

const ALLOWED_TYPES = {
  'application/pdf': 'PDF',
  'application/msword': 'DOC',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/vnd.ms-powerpoint': 'PPT',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
  'application/vnd.ms-excel': 'XLS',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
  'application/zip': 'ZIP',
  'application/x-zip-compressed': 'ZIP',
  'image/jpeg': 'Image',
  'image/png': 'Image',
  'image/webp': 'Image',
  'video/mp4': 'Video',
  'video/webm': 'Video',
  'audio/mpeg': 'Audio',
  'audio/wav': 'Audio',
};

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES[file.mimetype]) return cb(null, true);
    cb(new Error(`Unsupported file type: ${file.mimetype}`));
  },
});

const getFileType = (mimetype) => ALLOWED_TYPES[mimetype] || 'File';

router.get('/', async (req, res) => {
  try {
    const { domain, difficulty, type } = req.query;
    const conditions = [];
    if (domain) conditions.push(['domain', '==', domain]);
    if (difficulty) conditions.push(['difficulty', '==', difficulty]);
    if (type) conditions.push(['type', '==', type]);
    const courses = await queryDocs('courses', conditions, 'createdAt', 'desc');
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const course = await getDoc('courses', req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const course = await addDoc('courses', req.body);
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const course = await updateDoc('courses', req.params.id, req.body);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const course = await getDoc('courses', req.params.id);
    if (course) {
      for (const r of course.resources || []) {
        if (r.fileUrl && r.fileUrl.startsWith('/uploads/')) {
          const p = path.join(__dirname, '..', r.fileUrl);
          if (fs.existsSync(p)) fs.unlinkSync(p);
        }
      }
    }
    await deleteDoc('courses', req.params.id);
    await deleteDocs('enrollments', [['courseId', '==', req.params.id]]);
    res.json({ message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/enroll', async (req, res) => {
  try {
    const { userId } = req.body;
    const existing = await queryDocs('enrollments', [['userId', '==', userId], ['courseId', '==', req.params.id]]);
    if (existing.length > 0) return res.status(400).json({ error: 'Already enrolled' });
    const enrollment = await addDoc('enrollments', { userId, courseId: req.params.id, progress: 0, status: 'in-progress', completedModules: [] });
    const course = await getDoc('courses', req.params.id);
    const student = await getDoc('users', userId);
    await notify({
      userId: enrollment.userId,
      title: 'Course Enrolled',
      message: `You have successfully enrolled in "${course?.title || 'course'}"`,
      type: 'course_enrolled',
      relatedId: req.params.id,
      link: `/courses/${req.params.id}`,
      templateData: { studentName: student?.name || 'Student', courseName: course?.title || 'Course' },
    });
    res.status(201).json(enrollment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/progress', async (req, res) => {
  try {
    const { userId, progress, completedModules } = req.body;
    const existing = await queryDocs('enrollments', [['userId', '==', userId], ['courseId', '==', req.params.id]]);
    if (existing.length === 0) return res.status(404).json({ error: 'Enrollment not found' });
    const enrollmentId = existing[0]._id;
    const status = progress >= 100 ? 'completed' : 'in-progress';
    const enrollment = await updateDoc('enrollments', enrollmentId, { progress, completedModules, status });
    if (progress >= 100) {
      const course = await getDoc('courses', req.params.id);
      let user = null;
      if (course && course.creditPoints > 0) {
        user = await getDoc('users', userId);
        if (user) {
          await updateDoc('users', userId, { credits: (user.credits || 0) + course.creditPoints });
        }
      } else {
        user = await getDoc('users', userId);
      }
      await notify({
        userId,
        title: 'Course Completed',
        message: `Congratulations! You have completed the course "${course?.title || 'course'}"`,
        type: 'course_completed',
        relatedId: req.params.id,
        link: `/courses/${req.params.id}`,
        templateData: { studentName: user?.name || 'Student', courseName: course?.title || 'Course' },
      });
      // Auto-generate certificate
      try {
        const http = require('http');
        const certPayload = JSON.stringify({
          userId,
          courseId: req.params.id,
          progress: 100,
          completedModules: req.body.completedModules || [],
        });
        const certReq = http.request({
          hostname: 'localhost',
          port: process.env.PORT || 5000,
          path: '/api/certificates/auto-generate',
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(certPayload) },
        }, (certRes) => {
          let data = '';
          certRes.on('data', chunk => data += chunk);
          certRes.on('end', () => {
            try {
              const certResult = JSON.parse(data);
              if (certResult.error) {
                console.log(`[Auto-Cert] ${certResult.error} for user ${userId} course ${req.params.id}`);
              } else {
                console.log(`[Auto-Cert] Generated ${certResult.certificateId} for user ${userId}`);
              }
            } catch (e) { /* ignore parse errors */ }
          });
        });
        certReq.on('error', () => { /* silent fail */ });
        certReq.write(certPayload);
        certReq.end();
      } catch (certErr) {
        console.log(`[Auto-Cert] Failed to trigger certificate generation: ${certErr.message}`);
      }
    }
    res.json(enrollment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const fileUrl = `/uploads/courses/${req.file.filename}`;
    const fileType = getFileType(req.file.mimetype);
    res.json({ fileUrl, fileType, originalName: req.file.originalname, size: req.file.size });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id/resources', async (req, res) => {
  try {
    const course = await getDoc('courses', req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    const updated = await updateDoc('courses', req.params.id, { resources: req.body.resources || [] });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/resources', async (req, res) => {
  try {
    const course = await getDoc('courses', req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    const resource = { ...req.body, uploadedAt: new Date().toISOString() };
    const resources = [...(course.resources || []), resource];
    const updated = await updateDoc('courses', req.params.id, { resources });
    res.status(201).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/resources/:resourceId', async (req, res) => {
  try {
    const course = await getDoc('courses', req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    const resources = (course.resources || []).map(r =>
      r._id === req.params.resourceId || r.id === req.params.resourceId ? { ...r, ...req.body } : r
    );
    const updated = await updateDoc('courses', req.params.id, { resources });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id/resources/:resourceId', async (req, res) => {
  try {
    const course = await getDoc('courses', req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    const resource = (course.resources || []).find(r =>
      r._id === req.params.resourceId || r.id === req.params.resourceId
    );
    if (resource && resource.fileUrl && resource.fileUrl.startsWith('/uploads/')) {
      const p = path.join(__dirname, '..', resource.fileUrl);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    }
    const resources = (course.resources || []).filter(r =>
      r._id !== req.params.resourceId && r.id !== req.params.resourceId
    );
    const updated = await updateDoc('courses', req.params.id, { resources });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/resources/reorder', async (req, res) => {
  try {
    const course = await getDoc('courses', req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    const { resourceIds } = req.body;
    if (!Array.isArray(resourceIds)) return res.status(400).json({ error: 'resourceIds must be an array' });
    const resourceMap = {};
    (course.resources || []).forEach(r => { resourceMap[r._id || r.id] = r; });
    const reordered = resourceIds.map((id, idx) => {
      const r = resourceMap[id];
      if (r) { r.order = idx; return r; }
      return null;
    }).filter(Boolean);
    const updated = await updateDoc('courses', req.params.id, { resources: reordered });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
