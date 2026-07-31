const { computeAttendanceStats } = require('./attendance');
const { computeStudentSkills } = require('./skills');

async function getStudentProfile(prisma, studentId) {
  const [enrollments, attendance, projects, skills] = await Promise.all([
    prisma.enrollment.findMany({
      where: { studentId, isCompleted: true, score: { not: null } },
      select: { score: true },
    }),
    prisma.attendance.findMany({ where: { studentId }, select: { status: true } }),
    prisma.project.findMany({ where: { studentId }, select: { status: true } }),
    computeStudentSkills(prisma, studentId),
  ]);

  const scores = enrollments.map((e) => e.score);
  const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const cgpa = avgScore / 10;

  const att = computeAttendanceStats(attendance);
  const activeProjects = projects.filter((p) => ['development', 'testing', 'completed'].includes(p.status)).length;

  return {
    cgpa: Math.round(cgpa * 100) / 100,
    attendance: att.rate,
    projects: activeProjects,
    skills,
    gpa: Math.round(avgScore * 100) / 100,
  };
}

module.exports = { getStudentProfile };
