const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticate } = require('../middleware/auth');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
const COURSE_DIR = path.join(UPLOAD_DIR, 'courses');
const PROFILE_DIR = path.join(UPLOAD_DIR, 'profiles');
const RESOURCE_DIR = path.join(UPLOAD_DIR, 'resources');

[UPLOAD_DIR, COURSE_DIR, PROFILE_DIR, RESOURCE_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = UPLOAD_DIR;
    if (req.body.type === 'course') uploadPath = COURSE_DIR;
    else if (req.body.type === 'profile') uploadPath = PROFILE_DIR;
    else if (req.body.type === 'resource') uploadPath = RESOURCE_DIR;
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain', 'application/zip', 'application/x-rar-compressed',
    'image/png', 'image/jpeg', 'image/svg+xml', 'image/gif',
    'audio/mpeg', 'audio/wav',
    'video/mp4', 'video/x-msvideo', 'video/quicktime',
  ];
  if (allowedTypes.includes(file.mimetype) || file.originalname.match(/\.(pdf|doc|docx|ppt|pptx|txt|zip|rar|png|jpeg|jpg|svg|gif|mp3|wav|mp4|avi|mov)$/i)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

router.use(authenticate);

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const url = `/uploads/${req.body.type || ''}/${req.file.filename}`;
    res.json({
      url,
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/multiple', upload.array('files', 10), async (req, res) => {
  try {
    const files = req.files.map(f => ({
      url: `/uploads/${req.body.type || ''}/${f.filename}`,
      filename: f.originalname,
      size: f.size,
      mimetype: f.mimetype,
    }));
    res.json({ files });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;