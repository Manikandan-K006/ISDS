const {
  SKILL_COURSE_KEYWORDS,
  SKILL_WEIGHTS,
  PROJECT_STATUS_SCORE,
} = require('../config/career');

const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const avg = (nums) => {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
};

const normalizeSkillName = (name) => (name || '').toLowerCase().replace(/[^a-z0-9+#]/g, '');

const matchesSkill = (skillName, text) => {
  const haystack = String(text || '').toLowerCase();
  const keywords = SKILL_COURSE_KEYWORDS[skillName] || [skillName];
  return keywords.some((k) => haystack.includes(k.toLowerCase()));
};

const matchesTechStack = (techStack, skillName) => {
  return asArray(techStack).some((t) => normalizeSkillName(t) === normalizeSkillName(skillName));
};

async function computeSkillScore(prisma, studentId, skillName) {
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId },
    include: { course: { select: { id: true, title: true, tags: true } } },
  });

  const matchingCourses = enrollments.filter((e) => matchesSkill(skillName, `${e.course.title} ${asArray(e.course.tags).join(' ')}`));
  const matchingCourseIds = matchingCourses.map((e) => e.courseId);

  const courseEvidence = matchingCourses.map((e) => ({
    courseId: e.courseId,
    title: e.course.title,
    progress: e.progress,
    completed: e.isCompleted,
  }));

  const quizResults = matchingCourseIds.length
    ? await prisma.quizResult.findMany({
        where: { studentId, quiz: { courseId: { in: matchingCourseIds } } },
        include: { quiz: { select: { title: true, courseId: true } } },
      })
    : [];
  const quizEvidence = quizResults.map((r) => ({
    quizId: r.quizId,
    title: r.quiz.title,
    percentage: r.percentage,
  }));

  const submissions = matchingCourseIds.length
    ? await prisma.assignmentSubmission.findMany({
        where: { studentId, marks: { not: null }, assignment: { courseId: { in: matchingCourseIds } } },
        include: { assignment: { select: { title: true, maxMarks: true, courseId: true } } },
      })
    : [];
  const assignmentEvidence = submissions.map((s) => ({
    assignmentId: s.assignmentId,
    title: s.assignment.title,
    percentage: s.assignment.maxMarks > 0 ? (s.marks / s.assignment.maxMarks) * 100 : 0,
    marks: s.marks,
    maxMarks: s.assignment.maxMarks,
  }));

  const projects = await prisma.project.findMany({
    where: { studentId },
    select: { id: true, title: true, techStack: true, status: true, description: true },
  });
  const projectEvidence = projects
    .filter((p) => matchesTechStack(p.techStack, skillName) || matchesSkill(skillName, p.title + ' ' + (p.description || '')))
    .map((p) => ({
      projectId: p.id,
      title: p.title,
      status: p.status,
      score: PROJECT_STATUS_SCORE[p.status] || 0,
    }));

  const courseScore = avg(courseEvidence.map((c) => (c.completed ? 100 : c.progress)));
  const quizScore = avg(quizEvidence.map((q) => q.percentage));
  const assignmentScore = avg(assignmentEvidence.map((a) => a.percentage));
  const projectScore = avg(projectEvidence.map((p) => p.score));

  const present = [];
  if (courseEvidence.length) present.push(['course', courseScore]);
  if (quizEvidence.length) present.push(['quiz', quizScore]);
  if (assignmentEvidence.length) present.push(['assignment', assignmentScore]);
  if (projectEvidence.length) present.push(['project', projectScore]);

  if (!present.length) {
    return {
      skill: skillName,
      score: 0,
      breakdown: [],
      evidence: { courses: [], quizzes: [], assignments: [], projects: [] },
    };
  }

  const totalWeight = present.reduce((sum, [type]) => sum + SKILL_WEIGHTS[type], 0);
  const score = Math.round(present.reduce((sum, [type, value]) => sum + SKILL_WEIGHTS[type] * value, 0) / totalWeight);

  const breakdown = present.map(([type, value]) => ({
    type,
    label: type.charAt(0).toUpperCase() + type.slice(1),
    score: Math.round(value),
    weight: Math.round((SKILL_WEIGHTS[type] / totalWeight) * 100),
    detail: type === 'course' ? `${courseEvidence.length} course${courseEvidence.length === 1 ? '' : 's'}` :
      type === 'quiz' ? `${quizEvidence.length} quiz${quizEvidence.length === 1 ? '' : 'zes'}` :
      type === 'assignment' ? `${assignmentEvidence.length} assignment${assignmentEvidence.length === 1 ? '' : 's'}` :
      `${projectEvidence.length} project${projectEvidence.length === 1 ? '' : 's'}`,
  }));

  return {
    skill: skillName,
    score,
    breakdown,
    evidence: { courses: courseEvidence, quizzes: quizEvidence, assignments: assignmentEvidence, projects: projectEvidence },
  };
}

async function computeStudentSkills(prisma, studentId) {
  const skills = await prisma.skill.findMany({ select: { id: true, name: true, category: true } });
  const results = [];
  for (const skill of skills) {
    const computed = await computeSkillScore(prisma, studentId, skill.name);
    results.push({
      id: skill.id,
      name: skill.name,
      category: skill.category || null,
      score: computed.score,
      breakdown: computed.breakdown,
      evidence: computed.evidence,
    });
  }
  return results.sort((a, b) => b.score - a.score);
}

function computeSkillGap(studentSkills, roleTargets) {
  const map = {};
  studentSkills.forEach((s) => { map[s.name.toLowerCase()] = s; });
  const rows = [];
  let totalGap = 0;
  let count = 0;
  for (const [skill, target] of Object.entries(roleTargets)) {
    const current = map[skill.toLowerCase()];
    const currentScore = current ? current.score : 0;
    const gap = Math.max(0, target - currentScore);
    totalGap += gap;
    count += 1;
    rows.push({ skill, current: currentScore, target, gap });
  }
  const readiness = count > 0 ? Math.max(0, Math.round(100 - totalGap / (count * 100) * 100)) : 0;
  return { rows, readiness };
}

module.exports = { computeSkillScore, computeStudentSkills, computeSkillGap };
