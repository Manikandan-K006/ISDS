const { computeSkillGap } = require('./skills');

function computeEligibility(job, profile) {
  const rules = [];
  if (job.minCGPA != null) {
    const cgpa = profile.cgpa || 0;
    rules.push({ label: 'CGPA', requirement: job.minCGPA, actual: cgpa, ok: cgpa >= job.minCGPA });
  }
  if (job.minAttendance != null) {
    const attendance = profile.attendance || 0;
    rules.push({ label: 'Attendance', requirement: job.minAttendance, actual: attendance, ok: attendance >= job.minAttendance });
  }
  if (job.minProjects != null) {
    const projects = profile.projects || 0;
    rules.push({ label: 'Projects', requirement: job.minProjects, actual: projects, ok: projects >= job.minProjects });
  }
  if (job.minSkillScore != null) {
    const best = profile.skills && profile.skills.length ? Math.max(...profile.skills.map((s) => s.score || 0)) : 0;
    rules.push({ label: 'Skill Score', requirement: job.minSkillScore, actual: best, ok: best >= job.minSkillScore });
  }

  const requiredSkillNames = Array.isArray(job.requiredSkills) ? job.requiredSkills : [];
  requiredSkillNames.forEach((name) => {
    const found = (profile.skills || []).find((s) => String(s.name).toLowerCase() === String(name).toLowerCase());
    const actual = found ? found.score : 0;
    rules.push({ label: `Skill: ${name}`, requirement: 50, actual, ok: actual >= 50 });
  });

  const met = rules.filter((r) => r.ok);
  const missing = rules.filter((r) => !r.ok).map((r) => r.label);
  return {
    eligible: rules.length > 0 && missing.length === 0,
    total: rules.length,
    metCount: met.length,
    missing,
    rules,
  };
}

function computeCareerReadiness(studentSkills, roleTargets) {
  const { rows, readiness } = computeSkillGap(studentSkills, roleTargets);
  const strong = rows.filter((r) => r.current >= r.target).map((r) => r.skill);
  const weak = rows.filter((r) => r.gap > 0).sort((a, b) => b.gap - a.gap).slice(0, 3).map((r) => r.skill);
  return { readiness, rows, strong, weak };
}

module.exports = { computeEligibility, computeCareerReadiness };
