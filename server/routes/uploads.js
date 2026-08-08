const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticate } = require('../middleware/auth');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
const TYPES = {
  course: 'courses',
  profile: 'profiles',
  resource: 'resources',
  certificate: 'certificates',
  assignment: 'assignments',
};

Object.values(TYPES).forEach((dir) => {
  const target = path.join(UPLOAD_DIR, dir);
  if (!fs.existsSync(target)) fs.mkdirSync(target, { recursive: true });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const sub = TYPES[req.body.type] || '';
    cb(null, sub ? path.join(UPLOAD_DIR, sub) : UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const safeExt = path.extname(file.originalname).toLowerCase().replace(/[^a-z0-9.]/g, '');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + safeExt);
  },
});

const ALLOWED_MIME = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'application/zip',
  'application/x-rar-compressed',
  'image/png', 'image/jpeg', 'image/svg+xml', 'image/gif', 'image/webp',
  'audio/mpeg', 'audio/wav', 'audio/ogg',
  'video/mp4', 'video/x-msvideo', 'video/quicktime', 'video/webm',
]);

const ALLOWED_EXT = /\.(pdf|doc|docx|ppt|pptx|txt|zip|rar|png|jpe?g|svg|gif|webp|mp3|wav|ogg|mp4|avi|mov|webm)$/i;

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME.has(file.mimetype) || ALLOWED_EXT.test(file.originalname)) {
    return cb(null, true);
  }
  const err = new Error('File type not allowed');
  err.code = 'FILE_TYPE_NOT_ALLOWED';
  return cb(err, false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024, files: 10 },
});

router.use(authenticate);

const MAX_FILES_TOTAL = 50 * 1024 * 1024;

router.post('/', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const sub = TYPES[req.body.type] || '';
    res.json({
      url: sub ? `/uploads/${sub}/${req.file.filename}` : `/uploads/${req.file.filename}`,
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/multiple', upload.array('files', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No files uploaded' });
    const sub = TYPES[req.body.type] || '';
    const totalBytes = req.files.reduce((s, f) => s + f.size, 0);
    if (totalBytes > MAX_FILES_TOTAL) {
      return res.status(413).json({ error: 'Combined upload exceeds 50MB limit' });
    }
    const files = req.files.map((f) => ({
      url: sub ? `/uploads/${sub}/${f.filename}` : `/uploads/${f.filename}`,
      filename: f.originalname,
      size: f.size,
      mimetype: f.mimetype,
    }));
    res.json({ files });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'File exceeds the 15MB size limit' });
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }
  if (err && err.code === 'FILE_TYPE_NOT_ALLOWED') {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

module.exports = router;
