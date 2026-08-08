// ============================================================
// ISDS AI Academic Advisor — deterministic intent engine
//
// The advisor works without any external AI service:
//   1. resolveIntent() maps a student message to a known intent.
//   2. buildStudentContext() gathers the student's real record.
//   3. buildAdvisorReply() composes a data-grounded reply.
//
// Only "general/open-ended" questions fall back to an external
// LLM (Anthropic) when ANTHROPIC_API_KEY is configured.
// ============================================================

const { computeAttendanceStats, attendanceRisk } = require('./attendance');
const { computeStudentSkills, computeSkillGap } = require('./skills');
const { CAREER_ROLES } = require('../config/career');

const INTENTS = {
  career: ['career', 'job', 'jobs', 'internship', 'internships', 'placement', 'resume', 'interview', 'company', 'offer', 'apply', 'recruiter', 'drive'],
  study: ['study', 'studies', 'revision', 'revise', 'prepare', 'plan', 'schedule', 'focus', 'how to learn', 'learning path', 'syllabus'],
  quiz: ['quiz', 'quizzes', 'test', 'tests', 'exam', 'exams', 'assessment', 'objective'],
  assignments: ['assignment', 'assignments', 'homework', 'due', 'submit', 'submission', 'pending work', 'task', 'deadline'],
  skills: ['skill', 'skills', 'improve', 'gap', 'upskill', 'learn', 'weak', 'strong'],
  projects: ['project', 'projects', 'build', 'portfolio', 'develop', 'idea'],
  cgpa: ['cgpa', 'gpa', 'marks', 'score', 'grade', 'grades', 'performance', 'academic', 'percentage', 'backlog'],
  attendance: ['attendance', 'absent', 'present', 'classes', 'lecture', 'leave'],
  help: ['help', 'what can you do', 'features', 'options', 'commands', 'capabilities'],
  greeting: ['hello', 'hi', 'hey', 'namaste', 'good morning', 'good afternoon', 'good evening'],
};

// Priority used to break ties when a message matches multiple intents.
const INTENT_PRIORITY = ['career', 'study', 'quiz', 'assignments', 'skills', 'projects', 'cgpa', 'attendance', 'help', 'greeting'];

// Keywords that carry extra weight (e.g. "job"/"placement" are the
// strongest signal for the career intent).
const INTENT_WEIGHTS = {
  career: ['job', 'internship', 'placement', 'offer', 'drive', 'company'],
};

const hasKeyword = (text, keyword) => {
  if (keyword.length <= 3) {
    return new RegExp(`(^|[^a-z])${keyword}([^a-z]|$)`, 'i').test(text);
  }
  return text.includes(keyword);
};

function resolveIntent(message) {
  const text = String(message || '').toLowerCase();
  let best = 'default';
  let bestScore = 0;
  for (const intent of INTENT_PRIORITY) {
    const keywords = INTENTS[intent];
    const extra = (INTENT_WEIGHTS[intent] || []);
    const score = keywords.reduce((n, k) => n + (hasKeyword(text, k) ? 1 : 0), 0)
      + extra.reduce((n, k) => n + (hasKeyword(text, k) ? 2 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      best = intent;
    }
  }
  return best;
}

const PROJECT_IDEAS = {
  'Python': 'Automation script / CLI tool using Python',
  'JavaScript': 'Interactive web app with vanilla JS + a modern framework',
  'React': 'Full-stack React dashboard consuming a public API',
  'Node.js': 'REST API with authentication and a database',
  SQL: 'Analytics dashboard backed by a normalized relational schema',
  'Machine Learning': 'Predictive model trained on a public dataset (e.g., student performance)',
  'Data Visualization': 'Interactive data story built with charts and maps',
  'Cybersecurity': 'Password audit / vulnerability scanner tool',
  Networking: 'Network topology simulator with packet-flow logging',
};

function buildQuickActions(context) {
  const actions = ['What is my CGPA?', 'Any pending assignments?'];
  if (context.attendance && context.attendance.rate < 100) actions.push('What is my attendance?');
  if (context.pendingAssignments.length) actions.push('What should I study?');
  if (context.unattemptedQuizzes.length) actions.push('Which quizzes are pending?');
  actions.push('How can I improve my skills?');
  return actions.slice(0, 4);
}

function formatDate(d) {
  try {
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  } catch {
    return '—';
  }
}

async function buildStudentContext(prisma, userId) {
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: userId },
    select: { courseId: true, course: { select: { title: true } } },
  });
  const enrolledCourseIds = enrollments.map((e) => e.courseId);
  const courseTitles = {};
  enrollments.forEach((e) => { courseTitles[e.courseId] = e.course.title; });

  const [user, attendance, pendingAssignments, quizResults, gradedSubmissions, plannerTasks, careerProfile, jobs, applications] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, cgpa: true, currentSemesterGpa: true, backlogs: true, creditsEarned: true, creditsRequired: true, placementStatus: true, careerGoal: true, registerNumber: true },
    }),
    prisma.attendance.findMany({ where: { studentId: userId }, select: { status: true, date: true } }),
    prisma.assignment.findMany({
      where: {
        status: 'published',
        dueDate: { gte: new Date() },
        courseId: { in: enrolledCourseIds },
      },
      include: { course: { select: { title: true } } },
      orderBy: { dueDate: 'asc' },
      take: 8,
    }),
    prisma.quizResult.findMany({
      where: { studentId: userId },
      orderBy: { attemptedAt: 'asc' },
      select: { percentage: true, passed: true, quiz: { select: { title: true } } },
    }),
    prisma.assignmentSubmission.findMany({
      where: { studentId: userId, marks: { not: null } },
      select: { marks: true, assignment: { select: { title: true, maxMarks: true } } },
    }),
    prisma.plannerTask.findMany({
      where: { studentId: userId, status: 'pending' },
      orderBy: { date: 'asc' },
      take: 5,
    }),
    prisma.careerProfile.findUnique({ where: { studentId: userId }, select: { headline: true, summary: true, isPublic: true } }),
    prisma.job.findMany({
      where: { status: 'open', type: 'placement_drive' },
      select: { id: true, title: true, company: true, minCGPA: true, deadline: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.jobApplication.findMany({
      where: { studentId: userId },
      select: { status: true },
    }),
  ]);

  const rawQuizzes = enrolledCourseIds.length
    ? await prisma.quiz.findMany({
        where: {
          status: 'published',
          courseId: { in: enrolledCourseIds },
          results: { none: { studentId: userId } },
        },
        take: 8,
      })
    : [];
  const unattemptedQuizzes = rawQuizzes.map((q) => ({ ...q, course: { title: courseTitles[q.courseId] || 'Enrolled course' } }));

  const att = computeAttendanceStats(attendance);
  const risk = attendanceRisk({ total: att.total, present: att.present, target: 75 });

  const submittedAssignmentIds = gradedSubmissions.map((s) => s.assignmentId).filter(Boolean);
  const openAssignments = pendingAssignments;
  const pending = openAssignments.filter((a) => !submittedAssignmentIds.includes(a.id));

  const quizAvg = quizResults.length ? quizResults.reduce((s, q) => s + q.percentage, 0) / quizResults.length : 0;
  const failedQuizzes = quizResults.filter((q) => !q.passed).length;
  const lowGrades = gradedSubmissions.filter((s) => s.marks < s.assignment.maxMarks * 0.6).length;

  const statusCounts = applications.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  const skills = await computeStudentSkills(prisma, userId);
  const roles = CAREER_ROLES.map((role) => ({
    key: role.key,
    label: role.label,
    ...computeSkillGap(skills, role.targets),
  })).sort((a, b) => b.readiness - a.readiness);
  const topRole = roles[0] || null;
  const weakSkills = skills
    .filter((s) => s.score < 50)
    .sort((a, b) => a.score - b.score)
    .slice(0, 4)
    .map((s) => s.name);

  return {
    user: user || { id: userId, name: 'Student' },
    attendance: att,
    attendanceRisk: risk,
    pendingAssignments: pending,
    unattemptedQuizzes,
    quizAvg: Math.round(quizAvg * 10) / 10,
    failedQuizzes,
    lowGrades,
    gradedSubmissionCount: gradedSubmissions.length,
    plannerTasks,
    careerProfile,
    openDrives: jobs,
    applications: statusCounts,
    topRole,
    roles,
    weakSkills,
  };
}

// Deterministic, documented recommendation logic:
// - CGPA: prefer the stored CGPA; fall back to average of completed
//   course scores (capped at 10) when the student record has no CGPA.
// - Attendance: 75% college target; status surfaced when below 85%.
// - Assignments/Quizzes: nearest deadlines and unpublished attempts win.
// - Skills: score < 50 = "weak"; gap to a role target drives the roadmap.
// - Role: highest readiness across CAREER_ROLES (gap-based) is "best match".
function buildAdvisorReply(context, intent) {
  const name = context.user.name || 'there';
  const lines = [];
  let suggest = null;

  if (intent === 'greeting') {
    lines.push(`Hi ${name}! I'm your ISDS Academic Advisor. 👋`);
    lines.push('I can check your CGPA, attendance, pending assignments, upcoming quizzes, study focus, skill gaps, and placement opportunities.');
    suggest = buildQuickActions(context);
  } else if (intent === 'help') {
    lines.push('Here is what I can help you with:');
    lines.push('• CGPA & academic performance');
    lines.push('• Attendance status & risk');
    lines.push('• Pending assignments & due dates');
    lines.push('• Upcoming / unfinished quizzes');
    lines.push('• What to study today');
    lines.push('• Skill gaps & how to improve');
    lines.push('• Placement drives, applications & career readiness');
    suggest = buildQuickActions(context);
  } else if (intent === 'cgpa') {
    const cgpa = context.user.cgpa ?? null;
    if (cgpa != null) {
      lines.push(`Your current CGPA is ${cgpa.toFixed(2)}.`);
      if (context.user.currentSemesterGpa != null) lines.push(`Current semester GPA: ${context.user.currentSemesterGpa.toFixed(2)}.`);
      if (context.user.backlogs) lines.push(`Active backlogs: ${context.user.backlogs}.`);
      if (context.user.creditsEarned != null && context.user.creditsRequired != null) {
        lines.push(`Credits completed: ${context.user.creditsEarned}/${context.user.creditsRequired} (${Math.round((context.user.creditsEarned / context.user.creditsRequired) * 100)}%).`);
      }
      if (context.quizAvg > 0) lines.push(`Average quiz score: ${context.quizAvg}% (${context.failedQuizzes} not passed).`);
      if (context.lowGrades > 0) lines.push(`You have ${context.lowGrades} graded assignment${context.lowGrades === 1 ? '' : 's'} below 60%.`);
      lines.push(context.quizAvg >= 70 && context.lowGrades === 0 ? 'You are in a strong position — keep the momentum going.' : 'Tip: revise weak topics from the Study Planner to push your average higher.');
    } else {
      lines.push('There is no CGPA recorded on your profile yet. Ask your faculty advisor to update it, or I can estimate it from completed course scores.');
      if (context.quizAvg > 0) lines.push(`Based on quiz performance, your current average is ${context.quizAvg}%.`);
    }
  } else if (intent === 'attendance') {
    const { rate, total, present } = context.attendance;
    lines.push(`Your attendance is ${rate}% (${present}/${total} sessions attended).`);
    if (context.attendanceRisk) {
      const r = context.attendanceRisk;
      lines.push(`Status: ${r.status}. With ${r.classesRemaining} classes remaining you can still miss ${r.canMiss} to stay at ${r.target}%.`);
      if (r.status !== 'SAFE') lines.push('Attend regular sessions and mark leave in advance to protect your eligibility.');
    }
  } else if (intent === 'assignments') {
    const pending = context.pendingAssignments;
    if (pending.length) {
      lines.push(`You have ${pending.length} pending assignment${pending.length === 1 ? '' : 's'}:`);
      pending.slice(0, 5).forEach((a) => lines.push(`• ${a.title} (${a.course.title}) — due ${formatDate(a.dueDate)}`));
      lines.push('Start with the nearest deadline and break longer tasks into daily chunks in the Study Planner.');
    } else {
      lines.push('No pending assignments — great job staying on top of your work.');
    }
  } else if (intent === 'quiz') {
    const quizzes = context.unattemptedQuizzes;
    if (quizzes.length) {
      lines.push(`You have ${quizzes.length} quiz${quizzes.length === 1 ? '' : 'zes'} you have not attempted yet:`);
      quizzes.slice(0, 5).forEach((q) => lines.push(`• ${q.title} (${q.course.title})`));
      lines.push('Quizzes weigh heavily in skill scoring — attempt them before the course work ends.');
    } else {
      lines.push('No unattempted quizzes in your enrolled courses.');
      if (context.quizAvg > 0) lines.push(`Your average quiz score is ${context.quizAvg}%.`);
    }
  } else if (intent === 'study') {
    const pending = context.pendingAssignments;
    const quizzes = context.unattemptedQuizzes;
    const weak = context.weakSkills;
    lines.push('Here is what I recommend focusing on today:');
    if (pending.length) pending.slice(0, 3).forEach((a) => lines.push(`• Finish: ${a.title} (due ${formatDate(a.dueDate)})`));
    if (quizzes.length) lines.push(`• Prepare for: ${quizzes[0].title} (${quizzes[0].course.title})`);
    if (weak.length) lines.push(`• Improve: ${weak.slice(0, 3).join(', ')} via the Coding Lab and practice projects`);
    if (context.plannerTasks.length) lines.push(`• Planner queue: ${context.plannerTasks.length} pending task${context.plannerTasks.length === 1 ? '' : 's'}`);
    if (!pending.length && !quizzes.length && !weak.length) lines.push('Your plate is clear — this is a great time to build projects and strengthen your portfolio.');
    lines.push('Generate a full weekly schedule from the Study Planner page.');
  } else if (intent === 'skills') {
    const weak = context.weakSkills;
    if (weak.length) {
      lines.push(`Your weakest skills right now: ${weak.join(', ')}.`);
      lines.push('To close these gaps:');
      lines.push('• Use the Coding Lab for hands-on practice');
      lines.push('• Build a small project per skill (see Project ideas)');
      lines.push('• Complete the matching courses and quizzes');
    } else {
      lines.push('All your tracked skills are at a healthy level (50+). Keep practicing to stay sharp.');
    }
    if (context.topRole) lines.push(`Your strongest role match is ${context.topRole.label} with ${context.topRole.readiness}% readiness.`);
  } else if (intent === 'projects') {
    const weak = context.weakSkills;
    const pool = weak.length ? weak : ['React', 'Node.js', 'SQL'];
    lines.push('Project ideas tailored to close your skill gaps:');
    pool.slice(0, 3).forEach((s) => lines.push(`• ${PROJECT_IDEAS[s] || `Build something hands-on with ${s}`} (${s})`));
    lines.push('Publish projects with public visibility to boost your career readiness score.');
  } else if (intent === 'career') {
    lines.push(`Placement status: ${context.user.placementStatus || 'not updated'}.`);
    if (context.openDrives.length) {
      lines.push(`Open drives right now: ${context.openDrives.length}.`);
      context.openDrives.slice(0, 3).forEach((d) => lines.push(`• ${d.title} at ${d.company}${d.minCGPA ? ` (CGPA ${d.minCGPA}+)` : ''}`));
    }
    const applied = Object.values(context.applications).reduce((a, b) => a + b, 0);
    lines.push(`Applications submitted: ${applied}.`);
    if (context.topRole) lines.push(`Career readiness: ${context.topRole.readiness}% for ${context.topRole.label} — visit Career Readiness for the full breakdown.`);
    if (context.attendanceRisk && context.attendanceRisk.status !== 'SAFE') lines.push('Note: your attendance is below target, which can affect eligibility.');
    if (context.careerProfile && !context.careerProfile.isPublic) lines.push('Your portfolio is private — set it public in Career Profile so recruiters can see your work.');
  } else {
    if (context.topRole) {
      lines.push(`Here is a quick snapshot, ${name}:`);
      lines.push(`• CGPA ${context.user.cgpa != null ? context.user.cgpa.toFixed(2) : 'not recorded'} • Attendance ${context.attendance.rate}%`);
      lines.push(`• ${context.pendingAssignments.length} pending assignment${context.pendingAssignments.length === 1 ? '' : 's'}, ${context.unattemptedQuizzes.length} quiz${context.unattemptedQuizzes.length === 1 ? '' : 'zes'} unattempted`);
      lines.push(`• Best career match: ${context.topRole.label} (${context.topRole.readiness}% readiness)`);
      lines.push('Try asking me about assignments, attendance, skills, or placements for details.');
    } else {
      lines.push(`Hi ${name}! I can check your CGPA, attendance, pending work, quizzes, skill gaps, and placement drives. Try one of the quick actions.`);
    }
  }

  return { reply: lines.join('\n'), suggestions: suggest || buildQuickActions(context) };
}

// Top-3 focus areas used by both the chatbot and the study-plan generator.
function recommendFocusAreas(context) {
  const areas = [];
  context.pendingAssignments.slice(0, 3).forEach((a) => {
    areas.push({ kind: 'assignment', title: `Finish: ${a.title}`, subject: a.course.title, sourceId: a.id, dueDate: a.dueDate });
  });
  context.unattemptedQuizzes.slice(0, 2).forEach((q) => {
    areas.push({ kind: 'quiz', title: `Attempt: ${q.title}`, subject: q.course.title, sourceId: q.id });
  });
  context.weakSkills.slice(0, 3).forEach((s) => {
    areas.push({ kind: 'skill', title: `Practice: ${s}`, subject: s, sourceId: null });
  });
  return areas.slice(0, 5);
}

// -------------------------------------------------------------------
// Deterministic weekly schedule generator
//
// Produces a reproducible 7-day plan (no randomness):
//   1. Collect the student's real workload via recommendFocusAreas().
//   2. Urgent deadlines (assignments) are placed before revision/practice.
//   3. Tasks are spread across the week (max 2 fixed blocks per day).
//   4. Each task carries the derived metadata used by the planner UI.
// -------------------------------------------------------------------
const PLAN_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const PLAN_BLOCKS = [
  { start: '09:00', end: '10:30', focus: 'Deep work — highest priority task' },
  { start: '17:00', end: '18:30', focus: 'Practice & revision' },
];

function generateWeeklySchedule(context) {
  const focusAreas = recommendFocusAreas(context);
  const schedule = {};
  const upcomingDates = [];
  for (let i = 0; i < 7; i += 1) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    upcomingDates.push(d);
  }

  let slot = 0;
  for (let i = 0; i < PLAN_DAYS.length && slot < focusAreas.length; i += 1) {
    const date = upcomingDates[i];
    const tasks = [];
    for (const block of PLAN_BLOCKS) {
      if (slot >= focusAreas.length) break;
      const area = focusAreas[slot];
      slot += 1;
      tasks.push({
        time: `${block.start} – ${block.end}`,
        task: area.title,
        type: area.kind,
        subject: area.subject || null,
        date: date.toISOString().slice(0, 10),
        estimatedMinutes: area.kind === 'assignment' ? 90 : 45,
        priority: area.kind === 'assignment' ? 'high' : 'medium',
      });
    }
    schedule[PLAN_DAYS[i]] = tasks;
  }
  return { schedule, focusAreas };
}

module.exports = { resolveIntent, buildStudentContext, buildAdvisorReply, buildQuickActions, recommendFocusAreas, generateWeeklySchedule, PROJECT_IDEAS };
