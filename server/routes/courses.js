const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');

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
    const filter = {};
    if (domain) filter.domain = domain;
    if (difficulty) filter.difficulty = difficulty;
    if (type) filter.type = type;
    const courses = await Course.find(filter).sort({ createdAt: -1 });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (course) {
      for (const r of course.resources || []) {
        if (r.fileUrl && r.fileUrl.startsWith('/uploads/')) {
          const p = path.join(__dirname, '..', r.fileUrl);
          if (fs.existsSync(p)) fs.unlinkSync(p);
        }
      }
    }
    await Course.findByIdAndDelete(req.params.id);
    await Enrollment.deleteMany({ courseId: req.params.id });
    res.json({ message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/enroll', async (req, res) => {
  try {
    const { userId } = req.body;
    const existing = await Enrollment.findOne({ userId, courseId: req.params.id });
    if (existing) return res.status(400).json({ error: 'Already enrolled' });
    const enrollment = await Enrollment.create({ userId, courseId: req.params.id });
    res.status(201).json(enrollment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/progress', async (req, res) => {
  try {
    const { userId, progress, completedModules } = req.body;
    const enrollment = await Enrollment.findOneAndUpdate(
      { userId, courseId: req.params.id },
      { progress, completedModules, status: progress >= 100 ? 'completed' : 'in-progress' },
      { new: true }
    );
    if (progress >= 100) {
      const course = await Course.findById(req.params.id);
      if (course.creditPoints > 0) {
        await User.findByIdAndUpdate(userId, { $inc: { credits: course.creditPoints } });
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
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    course.resources = req.body.resources || [];
    await course.save();
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/resources', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    const resource = { ...req.body, uploadedAt: new Date() };
    course.resources.push(resource);
    await course.save();
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/resources/:resourceId', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    const resource = course.resources.id(req.params.resourceId);
    if (!resource) return res.status(404).json({ error: 'Resource not found' });
    Object.assign(resource, req.body);
    await course.save();
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id/resources/:resourceId', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    const resource = course.resources.id(req.params.resourceId);
    if (resource && resource.fileUrl && resource.fileUrl.startsWith('/uploads/')) {
      const p = path.join(__dirname, '..', resource.fileUrl);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    }
    course.resources.pull(req.params.resourceId);
    await course.save();
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/resources/reorder', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    const { resourceIds } = req.body;
    if (!Array.isArray(resourceIds)) return res.status(400).json({ error: 'resourceIds must be an array' });
    const reordered = resourceIds
      .map((id, idx) => {
        const r = course.resources.id(id);
        if (r) { r.order = idx; return r; }
        return null;
      })
      .filter(Boolean);
    course.resources = reordered;
    await course.save();
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
