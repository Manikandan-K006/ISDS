const prisma = require('../prisma');

const auditLog = async (req, res, next) => {
  res.on('finish', async () => {
    const skip = res.statusCode < 400 && req.method === 'GET' && req.path !== '/logout';
    const userId = req.userId || (req.user && req.user.id) || null;
    if (skip || !userId) return;
    try {
      await prisma.activityLog.create({
        data: {
          userId,
          action: `${req.method} ${req.baseUrl}${req.path}`,
          details: { statusCode: res.statusCode, body: req.method === 'GET' ? undefined : req.body },
          ipAddress: req.ip,
          userAgent: req.get('user-agent') || null,
        },
      });
    } catch (err) {
      console.error('Audit log error:', err.message);
    }
  });
  next();
};

module.exports = { auditLog };
