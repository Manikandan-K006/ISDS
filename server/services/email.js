const nodemailer = require('nodemailer');
const config = require('../config/env');

const { smtp } = config;

const transporter = nodemailer.createTransport({
  host: smtp.host || 'smtp.gmail.com',
  port: smtp.port,
  secure: smtp.secure,
  auth: {
    user: smtp.user,
    pass: smtp.pass,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  if (!smtp.user || !smtp.pass) {
    console.log('Email not configured. Skipping email send.');
    return { message: 'Email service not configured' };
  }
  try {
    const info = await transporter.sendMail({
      from: `"ISDS" <${smtp.from || smtp.user}>`,
      to,
      subject,
      html,
    });
    console.log('Email sent:', info.messageId);
    return info;
  } catch (err) {
    console.error('Email send error:', err);
    throw err;
  }
};

module.exports = { sendEmail };