const { addDoc } = require('../config/firestore');
const { sendEmail, templates } = require('./email');

const getUserEmail = async (userId) => {
  const { getDoc } = require('../config/firestore');
  const user = await getDoc('users', userId);
  return user?.email || null;
};

const getTeacherEmail = async () => {
  const { queryDocs } = require('../config/firestore');
  const teachers = await queryDocs('users', [['role', '==', 'teacher']]);
  return teachers.length > 0 ? teachers[0].email : null;
};

const notify = async ({ userId, title, message, type, relatedId, link, templateData = {} }) => {
  await addDoc('notifications', { userId, title, message, type, relatedId, link });
  const email = await getUserEmail(userId);
  if (email) {
    const emailFn = {
      certificate_issued: templates.certificateIssued,
      course_enrolled: templates.courseEnrolled,
      course_completed: templates.courseCompleted,
      attendance_alert: templates.attendanceAlert,
      assignment_created: templates.newAssignment,
      assignment_submitted: templates.assignmentSubmitted,
      assignment_graded: templates.assignmentGraded,
    }[type];

    if (emailFn) {
      await sendEmail({ to: email, ...emailFn(templateData) });
    }
  }
};

const notifyTeacher = async ({ title, message, type, relatedId, link, templateData = {} }) => {
  const email = await getTeacherEmail();
  if (email) {
    const emailFn = {
      assignment_submitted: templates.assignmentSubmitted,
    }[type];

    if (emailFn) {
      await sendEmail({ to: email, ...emailFn(templateData) });
    }
  }
};

module.exports = { notify, notifyTeacher };
