const { execSync } = require('child_process');
const prisma = require('./prisma');

(async () => {
  try {
    const count = await prisma.user.count();
    if (count === 0) {
      console.log('ISDS: empty database — seeding demo data...');
      execSync('node seed.js', { stdio: 'inherit', cwd: __dirname });
      console.log('ISDS: demo data seeded.');
    } else {
      console.log(`ISDS: database already has ${count} users — skipping seed.`);
    }
  } catch (err) {
    console.error('ISDS: bootstrap check failed:', err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
})();