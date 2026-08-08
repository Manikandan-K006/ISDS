const prisma = require('../prisma');
const { sendEmail } = require('./email');

const getUserEmail = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  return user?.email || null;
};

const notify = async ({ userId, title, message, type = 'info', relatedId, link, _templateData = {}, sendMail = true }) => {
  await prisma.notification.create({
    data: { userId, title, message, type, relatedId, link },
  });

  if (!sendMail) return;
  const email = await getUserEmail(userId);
  if (!email) return;

  await sendEmail({ to: email, subject: title, html: `<p>${message}</p>` });
};

module.exports = { notify };
