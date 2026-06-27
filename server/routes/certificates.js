const router = require('express').Router();
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const { queryDocs, addDoc, getDoc, updateDoc, deleteDoc, countDocs, auth } = require('../config/firestore');
const { notify } = require('../services/notify');
const { sendEmail, templates } = require('../services/email');
const {
  generateCertificateId, generateVerificationHash, getGradeFromPercentage,
  generatePDF, generateDOCX, saveCertificateFiles, getCertificateDir, FRONTEND_URL,
} = require('../services/certificateGenerator');

const getTemplateData = (cert) => ({
  studentName: cert.studentName || 'Student',
  courseName: cert.courseName || 'Course',
  certificateId: cert.certificateId || '',
  grade: cert.grade || 'A',
  verificationUrl: `${FRONTEND_URL}/verify/${cert.certificateId}`,
});

router.get('/', auth, async (req, res) => {
  try {
    const { studentId, courseId, instructor, status, search, page = 1, limit = 50 } = req.query;
    let conditions = [];
    if (studentId) conditions.push(['studentId', '==', studentId]);
    if (courseId) conditions.push(['courseId', '==', courseId]);
    if (status) conditions.push(['status', '==', status]);

    // Teachers can only see their own course certificates
    if (req.userRole === 'teacher' && req.userId) {
      const teacherCourses = await queryDocs('courses', [['teacherId', '==', req.userId]]);
      const courseIds = teacherCourses.map(c => c._id);
      if (courseIds.length === 0) return res.json([]);
      if (courseId) {
        if (!courseIds.includes(courseId)) return res.json([]);
      } else {
        conditions.push(['courseId', 'in', courseIds]);
      }
    }

    let certificates = await queryDocs('certificates', conditions, 'createdAt', 'desc');

    if (instructor) {
      certificates = certificates.filter(c =>
        c.instructor?.toLowerCase().includes(instructor.toLowerCase())
      );
    }

    if (search) {
      const q = search.toLowerCase();
      certificates = certificates.filter(c =>
        c.certificateId?.toLowerCase().includes(q) ||
        c.studentName?.toLowerCase().includes(q) ||
        c.courseName?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.studentId?.toLowerCase().includes(q) ||
        c.instructor?.toLowerCase().includes(q)
      );
    }

    const total = certificates.length;
    const startIdx = (parseInt(page) - 1) * parseInt(limit);
    const paged = certificates.slice(startIdx, startIdx + parseInt(limit));

    res.json({
      certificates: paged.map(c => ({
        ...c,
        verificationUrl: `${FRONTEND_URL}/verify/${c.certificateId}`,
        qrData: `${FRONTEND_URL}/verify/${c.certificateId}`,
      })),
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/verify/:certificateId', async (req, res) => {
  try {
    const { certificateId } = req.params;
    const results = await queryDocs('certificates', [['certificateId', '==', certificateId]]);
    if (results.length === 0) {
      return res.status(404).json({ valid: false, message: 'Invalid Certificate', certificateId });
    }
    const cert = results[0];
    if (cert.status === 'revoked') {
      return res.json({
        valid: false, message: 'Certificate has been revoked', status: 'revoked',
        certificateId: cert.certificateId, studentName: cert.studentName,
        courseName: cert.courseName, revocationDate: cert.updatedAt,
      });
    }
    if (cert.status === 'expired') {
      return res.json({
        valid: false, message: 'Certificate has expired', status: 'expired',
        certificateId: cert.certificateId, studentName: cert.studentName,
        courseName: cert.courseName,
      });
    }

    // Track verification
    await addDoc('verificationLogs', {
      certificateId: cert.certificateId,
      timestamp: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({
      valid: true,
      certificateId: cert.certificateId,
      studentName: cert.studentName,
      studentId: cert.studentId,
      email: cert.email,
      courseName: cert.courseName,
      courseCategory: cert.courseCategory,
      duration: cert.duration,
      instructor: cert.instructor,
      director: cert.director || 'Mani K',
      issueDate: cert.issueDate || cert.createdAt,
      completionDate: cert.completionDate,
      grade: cert.grade,
      percentage: cert.percentage,
      score: cert.score,
      status: cert.status || 'active',
      verificationUrl: `${FRONTEND_URL}/verify/${cert.certificateId}`,
      issuedBy: 'ISDS — Intelligent Student Development System',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Auto-generate certificate on course completion
router.post('/auto-generate', async (req, res) => {
  try {
    const { userId, courseId, progress, completedModules } = req.body;

    // Validate completion
    if (!progress || progress < 100) {
      return res.status(400).json({ error: 'Course not yet completed' });
    }

    // Check existing
    const existing = await queryDocs('certificates', [
      ['studentId', '==', userId],
      ['courseId', '==', courseId],
    ]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Certificate already exists', certificate: existing[0] });
    }

    // Get student data
    const student = await getDoc('users', userId);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    // Get course data
    const course = await getDoc('courses', courseId);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    // Get enrollment
    const enrollments = await queryDocs('enrollments', [['userId', '==', userId], ['courseId', '==', courseId]]);
    const enrollment = enrollments[0];

    // Check all required lessons completed
    const requiredLessons = (course.resources || []).filter(r => r.type === 'lesson' && r.required);
    if (requiredLessons.length > 0 && completedModules) {
      const completedIds = completedModules || [];
      const allLessonsDone = requiredLessons.every(l => completedIds.includes(l._id || l.id));
      if (!allLessonsDone) {
        return res.status(400).json({ error: 'Not all required lessons completed' });
      }
    }

    // Get assignment submissions and scores
    const submissions = await queryDocs('submissions', [['studentId', '==', userId]]);
    const courseAssignments = await queryDocs('assignments', [['courseId', '==', courseId]]);
    const courseSubmissions = submissions.filter(s =>
      courseAssignments.some(a => a._id === s.assignmentId)
    );

    // Check all assignments submitted
    const allSubmitted = courseAssignments.length === 0 ||
      courseAssignments.every(a => courseSubmissions.some(s => s.assignmentId === a._id));
    if (!allSubmitted) {
      return res.status(400).json({ error: 'Not all assignments submitted' });
    }

    // Calculate scores
    const gradedSubs = courseSubmissions.filter(s => s.grade != null);
    const assignmentScore = gradedSubs.length > 0
      ? Math.round(gradedSubs.reduce((sum, s) => sum + (s.grade || 0), 0) / gradedSubs.length)
      : 0;

    // Quiz score (from trophies or custom quiz data)
    const trophies = await queryDocs('trophies', [['studentId', '==', userId], ['courseId', '==', courseId]]);
    const quizScore = trophies.length > 0
      ? Math.round(trophies.reduce((sum, t) => sum + (t.score || 0), 0) / trophies.length)
      : 0;

    // Final grade calculation
    const percentage = courseAssignments.length > 0
      ? Math.round((assignmentScore * 0.6 + quizScore * 0.4))
      : 100;
    const grade = getGradeFromPercentage(percentage);

    // Generate certificate ID
    const certificateId = generateCertificateId(course.domain || course.category || 'GEN');
    const verificationHash = generateVerificationHash();
    const completionDate = enrollment?.updatedAt || new Date().toISOString();
    const issueDate = new Date().toISOString();

    // Determine duration string
    let duration = course.duration || '';
    if (!duration && course.creditPoints) {
      duration = `${course.creditPoints} credits`;
    }

    const certData = {
      certificateId,
      verificationHash,
      studentId: userId,
      studentName: student.name || student.displayName || 'Student',
      email: student.email || '',
      courseId: course._id,
      courseName: course.title || course.name || 'Course',
      courseCategory: course.category || course.domain || 'General',
      duration: duration,
      instructor: course.instructor || course.instructorName || 'Manikandan',
      director: 'Mani K',
      organization: 'ISDS',
      issueDate,
      completionDate,
      grade,
      percentage,
      score: assignmentScore,
      quizScore,
      assignmentScore,
      pdfUrl: '',
      docxUrl: '',
      qrImage: '',
      verificationUrl: `${FRONTEND_URL}/verify/${certificateId}`,
      status: 'generated',
      downloadCount: 0,
      shareCount: 0,
      verifiedCount: 0,
    };

    // Save certificate to DB first
    const savedCert = await addDoc('certificates', certData);

    // Generate PDF, DOCX, QR files
    try {
      const files = await saveCertificateFiles({
        ...certData,
        _id: savedCert._id,
      });
      const updated = await updateDoc('certificates', savedCert._id, {
        pdfUrl: files.pdfUrl,
        docxUrl: files.docxUrl,
        qrImage: files.qrUrl,
        status: 'generated',
      });
      certData.pdfUrl = files.pdfUrl;
      certData.docxUrl = files.docxUrl;
      certData.qrImage = files.qrUrl;

      // Notify student
      await notify({
        userId,
        title: 'Certificate Generated!',
        message: `Your certificate for "${certData.courseName}" is ready. Certificate ID: ${certificateId}`,
        type: 'certificate_issued',
        relatedId: savedCert._id,
        link: `/certificates`,
        templateData: getTemplateData(certData),
      });

      // Notify admin
      const admins = await queryDocs('users', [['role', '==', 'admin']]);
      await Promise.all(admins.map(admin =>
        addDoc('notifications', {
          userId: admin._id,
          title: 'Certificate Issued',
          message: `Certificate ${certificateId} issued to ${certData.studentName} for ${certData.courseName}`,
          type: 'certificate_issued',
          relatedId: savedCert._id,
          link: '/admin/certificates',
        })
      ));

      // Notify teacher
      if (course.teacherId) {
        await addDoc('notifications', {
          userId: course.teacherId,
          title: 'Student Completed Course',
          message: `${certData.studentName} has completed "${certData.courseName}" and received a certificate`,
          type: 'course_completed',
          relatedId: savedCert._id,
          link: '/certificates',
        });
      }

      // Send email with certificate link
      const studentEmail = student.email;
      if (studentEmail) {
        await sendEmail({
          to: studentEmail,
          subject: `Congratulations ${certData.studentName}! Your Certificate is Ready`,
          html: `
            <div style="font-family: 'Segoe UI',sans-serif;max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
              <div style="background:linear-gradient(135deg,#1e40af,#1e3a5f);padding:28px;text-align:center;">
                <div style="width:56px;height:56px;border-radius:50%;border:3px solid #d4af37;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;">
                  <span style="color:#d4af37;font-size:20px;font-weight:bold;">IS</span>
                </div>
                <h1 style="color:#fff;margin:0;font-size:22px;">Congratulations!</h1>
                <p style="color:#cbd5e1;margin:8px 0 0;font-size:14px;">Your Certificate is Ready</p>
              </div>
              <div style="padding:32px 28px;">
                <h2 style="margin:0 0 16px;color:#1e293b;font-size:20px;">Dear ${certData.studentName},</h2>
                <p style="color:#475569;line-height:1.7;margin:0 0 12px;">We are pleased to inform you that you have successfully completed <strong>${certData.courseName}</strong>.</p>
                <p style="color:#475569;line-height:1.7;margin:0 0 8px;">Your certificate details:</p>
                <div style="background:#f8fafc;border-radius:10px;padding:16px;margin:16px 0;border:1px solid #e2e8f0;">
                  <table style="width:100%;border-collapse:collapse;">
                    <tr><td style="padding:6px 10px;color:#64748b;font-size:13px;">Certificate ID</td><td style="padding:6px 10px;color:#0f172a;font-weight:600;font-size:13px;font-family:monospace;">${certificateId}</td></tr>
                    <tr><td style="padding:6px 10px;color:#64748b;font-size:13px;">Course</td><td style="padding:6px 10px;color:#0f172a;font-weight:600;font-size:13px;">${certData.courseName}</td></tr>
                    <tr><td style="padding:6px 10px;color:#64748b;font-size:13px;">Grade</td><td style="padding:6px 10px;color:#0f172a;font-weight:600;font-size:13px;">${grade}</td></tr>
                    <tr><td style="padding:6px 10px;color:#64748b;font-size:13px;">Issue Date</td><td style="padding:6px 10px;color:#0f172a;font-weight:600;font-size:13px;">${new Date(issueDate).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}</td></tr>
                  </table>
                </div>
                <div style="text-align:center;margin:24px 0;">
                  <a href="${FRONTEND_URL}/verify/${certificateId}" style="display:inline-block;padding:12px 32px;background:#1e40af;color:#fff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:500;">Verify Certificate Online</a>
                </div>
                <p style="color:#475569;line-height:1.7;font-size:13px;">View and download your certificate from your <a href="${FRONTEND_URL}/certificates" style="color:#1e40af;text-decoration:underline;">ISDS Dashboard</a>.</p>
              </div>
              <div style="padding:20px;text-align:center;border-top:1px solid #e2e8f0;">
                <p style="margin:0;font-size:12px;color:#94a3b8;">ISDS — Intelligent Student Development System</p>
              </div>
            </div>
          `,
        });
      }

      res.status(201).json({ ...certData, _id: savedCert._id, pdfUrl: files.pdfUrl, docxUrl: files.docxUrl, qrImage: files.qrUrl });
    } catch (fileErr) {
      // Certificate saved in DB even if file generation fails
      res.status(201).json({ ...certData, _id: savedCert._id, fileError: fileErr.message });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: issue certificate manually
router.post('/', auth, async (req, res) => {
  try {
    if (req.userRole !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const { studentId, courseId, grade: manualGrade } = req.body;
    if (!studentId || !courseId) return res.status(400).json({ error: 'studentId and courseId required' });

    const existing = await queryDocs('certificates', [['studentId', '==', studentId], ['courseId', '==', courseId]]);
    if (existing.length > 0) return res.status(400).json({ error: 'Certificate already exists' });

    const student = await getDoc('users', studentId);
    const course = await getDoc('courses', courseId);
    if (!student || !course) return res.status(404).json({ error: 'Student or course not found' });

    const certificateId = generateCertificateId(course.domain || course.category || 'GEN');
    const verificationHash = generateVerificationHash();
    const issueDate = new Date().toISOString();
    const grade = manualGrade || 'A';

    const certData = {
      certificateId, verificationHash,
      studentId, studentName: student.name || 'Student', email: student.email || '',
      courseId: course._id, courseName: course.title || 'Course',
      courseCategory: course.category || course.domain || 'General',
      duration: course.duration || '', instructor: course.instructor || 'Manikandan',
      director: 'Mani K', organization: 'ISDS',
      issueDate, completionDate: issueDate, grade, percentage: 100, score: 0,
      pdfUrl: '', docxUrl: '', qrImage: '',
      verificationUrl: `${FRONTEND_URL}/verify/${certificateId}`,
      status: 'generated', downloadCount: 0, shareCount: 0, verifiedCount: 0,
    };

    const saved = await addDoc('certificates', certData);

    try {
      const files = await saveCertificateFiles({ ...certData, _id: saved._id });
      await updateDoc('certificates', saved._id, { pdfUrl: files.pdfUrl, docxUrl: files.docxUrl, qrImage: files.qrUrl });
      certData.pdfUrl = files.pdfUrl;
      certData.docxUrl = files.docxUrl;
      certData.qrImage = files.qrUrl;
    } catch (fe) { /* continue */ }

    await notify({
      userId: studentId, title: 'Certificate Issued',
      message: `Your certificate for "${certData.courseName}" has been issued. Certificate ID: ${certificateId}`,
      type: 'certificate_issued', relatedId: saved._id, link: '/certificates',
      templateData: getTemplateData(certData),
    });

    res.status(201).json({ ...certData, _id: saved._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const cert = await getDoc('certificates', req.params.id);
    if (!cert) return res.status(404).json({ error: 'Certificate not found' });
    res.json({ ...cert, verificationUrl: `${FRONTEND_URL}/verify/${cert.certificateId}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/regenerate', auth, async (req, res) => {
  try {
    if (req.userRole !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const cert = await getDoc('certificates', req.params.id);
    if (!cert) return res.status(404).json({ error: 'Certificate not found' });

    // Delete old files
    const dir = getCertificateDir();
    const baseName = cert.certificateId.replace(/[^a-zA-Z0-9-]/g, '_');
    ['pdf', 'docx', 'png'].forEach(ext => {
      const p = path.join(dir, `${baseName}.${ext}`);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    });

    const files = await saveCertificateFiles(cert);
    const updated = await updateDoc('certificates', req.params.id, {
      pdfUrl: files.pdfUrl, docxUrl: files.docxUrl, qrImage: files.qrUrl,
      status: 'generated', updatedAt: new Date().toISOString(),
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/revoke', auth, async (req, res) => {
  try {
    const cert = await getDoc('certificates', req.params.id);
    if (!cert) return res.status(404).json({ error: 'Certificate not found' });

    // Teachers can only revoke their own course certs
    if (req.userRole === 'teacher') {
      const course = await getDoc('courses', cert.courseId);
      if (!course || course.teacherId !== req.userId) {
        return res.status(403).json({ error: 'Cannot modify other instructors certificates' });
      }
    }

    await updateDoc('certificates', req.params.id, { status: 'revoked' });
    res.json({ message: 'Certificate revoked', certificateId: cert.certificateId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/restore', auth, async (req, res) => {
  try {
    if (req.userRole !== 'admin') return res.status(403).json({ error: 'Admin only' });
    await updateDoc('certificates', req.params.id, { status: 'active' });
    res.json({ message: 'Certificate restored' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.userRole !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const cert = await getDoc('certificates', req.params.id);
    if (!cert) return res.status(404).json({ error: 'Certificate not found' });

    const dir = getCertificateDir();
    const baseName = cert.certificateId.replace(/[^a-zA-Z0-9-]/g, '_');
    ['pdf', 'docx', 'png'].forEach(ext => {
      const p = path.join(dir, `${baseName}.${ext}`);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    });

    await deleteDoc('certificates', req.params.id);
    res.json({ message: 'Certificate deleted permanently' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Download tracking
router.put('/:id/download', async (req, res) => {
  try {
    const cert = await getDoc('certificates', req.params.id);
    if (!cert) return res.status(404).json({ error: 'Certificate not found' });
    await updateDoc('certificates', req.params.id, {
      downloadCount: (cert.downloadCount || 0) + 1,
      lastDownloaded: new Date().toISOString(),
    });
    res.json({ message: 'Download tracked' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Share tracking
router.put('/:id/share', async (req, res) => {
  try {
    const cert = await getDoc('certificates', req.params.id);
    if (!cert) return res.status(404).json({ error: 'Certificate not found' });
    await updateDoc('certificates', req.params.id, {
      shareCount: (cert.shareCount || 0) + 1,
    });
    res.json({ message: 'Share tracked' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve generated files
router.get('/file/:type/:filename', async (req, res) => {
  try {
    const { type, filename } = req.params;
    const validTypes = ['pdf', 'docx', 'png'];
    if (!validTypes.includes(type)) return res.status(400).json({ error: 'Invalid file type' });

    const filePath = path.join(getCertificateDir(), `${filename}.${type}`);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });

    const mimeTypes = { pdf: 'application/pdf', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', png: 'image/png' };
    res.setHeader('Content-Type', mimeTypes[type]);
    if (type === 'pdf') {
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
    }
    res.sendFile(filePath);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verification logs (admin only)
router.get('/admin/logs', auth, async (req, res) => {
  try {
    if (req.userRole !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const logs = await queryDocs('verificationLogs', [], 'timestamp', 'desc', 200);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Analytics data
router.get('/admin/stats', auth, async (req, res) => {
  try {
    const total = await countDocs('certificates');
    const thisMonth = await countDocs('certificates', [
      ['createdAt', '>=', new Date(new Date().setDate(1)).toISOString()]
    ]);
    const active = await countDocs('certificates', [['status', '==', 'active']]);
    const revoked = await countDocs('certificates', [['status', '==', 'revoked']]);
    const generated = await countDocs('certificates', [['status', '==', 'generated']]);
    const totalLogs = await countDocs('verificationLogs');

    // By course
    const all = await queryDocs('certificates');
    const byCourse = {};
    all.forEach(c => {
      const name = c.courseName || 'Unknown';
      byCourse[name] = (byCourse[name] || 0) + 1;
    });

    // By instructor
    const byInstructor = {};
    all.forEach(c => {
      const name = c.instructor || 'Unknown';
      byInstructor[name] = (byInstructor[name] || 0) + 1;
    });

    // Top performing students
    const topStudents = all
      .filter(c => c.percentage != null)
      .sort((a, b) => (b.percentage || 0) - (a.percentage || 0))
      .slice(0, 10)
      .map(c => ({ name: c.studentName, course: c.courseName, grade: c.grade, percentage: c.percentage }));

    res.json({
      total, thisMonth, active, revoked, generated, totalVerifications: totalLogs,
      byCourse: Object.entries(byCourse).map(([name, count]) => ({ name, count })),
      byInstructor: Object.entries(byInstructor).map(([name, count]) => ({ name, count })),
      topStudents,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
