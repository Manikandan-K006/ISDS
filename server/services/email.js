const nodemailer = require('nodemailer');

const getTransport = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const FROM = process.env.SMTP_FROM || 'noreply@isds.edu';

const sendEmail = async ({ to, subject, html }) => {
  const transport = getTransport();
  if (!transport) {
    console.log('[Email] SMTP not configured. Skipping email to:', to);
    return false;
  }
  try {
    await transport.sendMail({ from: FROM, to, subject, html });
    console.log(`[Email] Sent "${subject}" to ${to}`);
    return true;
  } catch (err) {
    console.error(`[Email] Failed to send "${subject}" to ${to}:`, err.message);
    return false;
  }
};

const templates = {
  certificateIssued: ({ studentName, courseName, certificateId }) => ({
    subject: `Certificate of Completion — ${courseName}`,
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto;">
        <div style="background: #1e40af; padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: #fff; margin: 0; font-size: 20px;">ISDS</h1>
        </div>
        <div style="padding: 32px 24px; background: #fff; border: 1px solid #e2e8f0;">
          <h2 style="margin: 0 0 8px; color: #1e293b;">Congratulations, ${studentName}!</h2>
          <p style="color: #475569; line-height: 1.6;">You have successfully completed <strong>${courseName}</strong>.</p>
          <p style="color: #475569; line-height: 1.6;">Your certificate ID is <strong>${certificateId}</strong>. You can verify it anytime at your ISDS dashboard.</p>
          <div style="margin: 24px 0; text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'https://isds.vercel.app'}/certificates" style="display: inline-block; padding: 12px 28px; background: #1e40af; color: #fff; text-decoration: none; border-radius: 8px; font-size: 14px;">View Certificate</a>
          </div>
        </div>
        <div style="padding: 16px; text-align: center; font-size: 12px; color: #94a3b8;">
          ISDS — Intelligent Student Development System
        </div>
      </div>
    `,
  }),

  courseEnrolled: ({ studentName, courseName }) => ({
    subject: `Enrolled — ${courseName}`,
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto;">
        <div style="background: #1e40af; padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: #fff; margin: 0; font-size: 20px;">ISDS</h1>
        </div>
        <div style="padding: 32px 24px; background: #fff; border: 1px solid #e2e8f0;">
          <h2 style="margin: 0 0 8px; color: #1e293b;">Welcome to ${courseName}</h2>
          <p style="color: #475569; line-height: 1.6;">Hi ${studentName}, you have successfully enrolled in <strong>${courseName}</strong>. Start learning and track your progress on your dashboard.</p>
          <div style="margin: 24px 0; text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'https://isds.vercel.app'}/courses" style="display: inline-block; padding: 12px 28px; background: #1e40af; color: #fff; text-decoration: none; border-radius: 8px; font-size: 14px;">Go to Courses</a>
          </div>
        </div>
        <div style="padding: 16px; text-align: center; font-size: 12px; color: #94a3b8;">
          ISDS — Intelligent Student Development System
        </div>
      </div>
    `,
  }),

  courseCompleted: ({ studentName, courseName }) => ({
    subject: `Completed — ${courseName}`,
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto;">
        <div style="background: #1e40af; padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: #fff; margin: 0; font-size: 20px;">ISDS</h1>
        </div>
        <div style="padding: 32px 24px; background: #fff; border: 1px solid #e2e8f0;">
          <h2 style="margin: 0 0 8px; color: #1e293b;">Course Completed!</h2>
          <p style="color: #475569; line-height: 1.6;">Great work, ${studentName}! You have completed <strong>${courseName}</strong>. Your certificate is now available on your dashboard.</p>
          <div style="margin: 24px 0; text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'https://isds.vercel.app'}/certificates" style="display: inline-block; padding: 12px 28px; background: #1e40af; color: #fff; text-decoration: none; border-radius: 8px; font-size: 14px;">View Certificates</a>
          </div>
        </div>
        <div style="padding: 16px; text-align: center; font-size: 12px; color: #94a3b8;">
          ISDS — Intelligent Student Development System
        </div>
      </div>
    `,
  }),

  newAssignment: ({ studentName, courseName, title }) => ({
    subject: `New Assignment — ${title}`,
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto;">
        <div style="background: #1e40af; padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: #fff; margin: 0; font-size: 20px;">ISDS</h1>
        </div>
        <div style="padding: 32px 24px; background: #fff; border: 1px solid #e2e8f0;">
          <h2 style="margin: 0 0 8px; color: #1e293b;">New Assignment</h2>
          <p style="color: #475569; line-height: 1.6;">Hi ${studentName}, a new assignment <strong>${title}</strong> has been posted for <strong>${courseName}</strong>. Check your dashboard for details and due date.</p>
          <div style="margin: 24px 0; text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'https://isds.vercel.app'}/assignments" style="display: inline-block; padding: 12px 28px; background: #1e40af; color: #fff; text-decoration: none; border-radius: 8px; font-size: 14px;">View Assignments</a>
          </div>
        </div>
        <div style="padding: 16px; text-align: center; font-size: 12px; color: #94a3b8;">
          ISDS — Intelligent Student Development System
        </div>
      </div>
    `,
  }),

  assignmentSubmitted: ({ teacherName, studentName, title }) => ({
    subject: `Assignment Submitted — ${title}`,
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto;">
        <div style="background: #1e40af; padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: #fff; margin: 0; font-size: 20px;">ISDS</h1>
        </div>
        <div style="padding: 32px 24px; background: #fff; border: 1px solid #e2e8f0;">
          <h2 style="margin: 0 0 8px; color: #1e293b;">Assignment Submitted</h2>
          <p style="color: #475569; line-height: 1.6;">Hi ${teacherName}, <strong>${studentName}</strong> has submitted the assignment <strong>${title}</strong>. Review it on your dashboard.</p>
          <div style="margin: 24px 0; text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'https://isds.vercel.app'}/admin/assignments" style="display: inline-block; padding: 12px 28px; background: #1e40af; color: #fff; text-decoration: none; border-radius: 8px; font-size: 14px;">Review Submissions</a>
          </div>
        </div>
        <div style="padding: 16px; text-align: center; font-size: 12px; color: #94a3b8;">
          ISDS — Intelligent Student Development System
        </div>
      </div>
    `,
  }),

  assignmentGraded: ({ studentName, courseName, title, grade }) => ({
    subject: `Assignment Graded — ${title}`,
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto;">
        <div style="background: #1e40af; padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: #fff; margin: 0; font-size: 20px;">ISDS</h1>
        </div>
        <div style="padding: 32px 24px; background: #fff; border: 1px solid #e2e8f0;">
          <h2 style="margin: 0 0 8px; color: #1e293b;">Assignment Graded</h2>
          <p style="color: #475569; line-height: 1.6;">Hi ${studentName}, your submission for <strong>${title}</strong> in <strong>${courseName}</strong> has been graded.</p>
          <p style="font-size: 24px; text-align: center; color: #1e40af; font-weight: bold; margin: 16px 0;">Grade: ${grade}</p>
          <div style="margin: 24px 0; text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'https://isds.vercel.app'}/assignments" style="display: inline-block; padding: 12px 28px; background: #1e40af; color: #fff; text-decoration: none; border-radius: 8px; font-size: 14px;">View Details</a>
          </div>
        </div>
        <div style="padding: 16px; text-align: center; font-size: 12px; color: #94a3b8;">
          ISDS — Intelligent Student Development System
        </div>
      </div>
    `,
  }),

  attendanceAlert: ({ studentName, courseName }) => ({
    subject: `Attendance Alert — ${courseName}`,
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto;">
        <div style="background: #dc2626; padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: #fff; margin: 0; font-size: 20px;">ISDS</h1>
        </div>
        <div style="padding: 32px 24px; background: #fff; border: 1px solid #e2e8f0;">
          <h2 style="margin: 0 0 8px; color: #1e293b;">Attendance Alert</h2>
          <p style="color: #475569; line-height: 1.6;">Hi ${studentName}, you were marked absent for <strong>${courseName}</strong>. Please check your attendance record on your dashboard.</p>
          <div style="margin: 24px 0; text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'https://isds.vercel.app'}/attendance" style="display: inline-block; padding: 12px 28px; background: #dc2626; color: #fff; text-decoration: none; border-radius: 8px; font-size: 14px;">View Attendance</a>
          </div>
        </div>
        <div style="padding: 16px; text-align: center; font-size: 12px; color: #94a3b8;">
          ISDS — Intelligent Student Development System
        </div>
      </div>
    `,
  }),
};

module.exports = { sendEmail, templates };
