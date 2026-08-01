const router = require('express').Router();
const prisma = require('../prisma');
const { authenticate, authorize } = require('../middleware/auth');
const { buildStudentContext, generateWeeklySchedule } = require('../utils/advisor');
const { computeStudentSkills, computeSkillGap } = require('../utils/skills');
const { CAREER_ROLES } = require('../config/career');

router.use(authenticate);

router.post('/study-plan/generate', authorize('student'), async (req, res) => {
  try {
    const context = await buildStudentContext(prisma, req.userId);
    const { schedule, focusAreas } = generateWeeklySchedule(context);

    await prisma.aIStudyPlan.updateMany({
      where: { studentId: req.userId, isActive: true },
      data: { isActive: false },
    });

    const plan = await prisma.aIStudyPlan.create({
      data: {
        studentId: req.userId,
        title: `Weekly Plan · ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`,
        goals: {
          shortTerm: focusAreas[0] ? `Complete: ${focusAreas[0].title}` : 'Maintain current progress',
          longTerm: 'Close skill gaps and stay ahead of deadlines',
        },
        schedule,
        isActive: true,
      },
    });

    res.status(201).json({ plan, focusAreas });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Study Plan
router.get('/study-plan', authorize('student'), async (req, res) => {
  try {
    let plan = await prisma.aIStudyPlan.findFirst({
      where: { studentId: req.userId, isActive: true },
    });
    if (!plan) {
      // Generate a basic plan from real data
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId: req.userId },
        include: { course: { select: { title: true, difficulty: true } } },
      });

      const upcomingAssignments = await prisma.assignment.findMany({
        where: {
          status: 'published',
          dueDate: { gte: new Date() },
          course: { enrollments: { some: { studentId: req.userId } } },
        },
        orderBy: { dueDate: 'asc' },
        take: 5,
      });

      const schedule = {
        monday: [{ time: '09:00', task: 'Review course materials', course: enrollments[0]?.course.title }],
        tuesday: [{ time: '09:00', task: 'Complete assignments', assignment: upcomingAssignments[0]?.title }],
        wednesday: [{ time: '09:00', task: 'Study & practice', course: enrollments[1]?.course.title }],
        thursday: [{ time: '09:00', task: 'Review & revise' }],
        friday: [{ time: '09:00', task: 'Weekly assessment prep' }],
      };

      plan = await prisma.aIStudyPlan.create({
        data: {
          studentId: req.userId,
          title: 'Personalized Study Plan',
          goals: { shortTerm: 'Complete pending assignments', longTerm: 'Master all enrolled courses' },
          schedule,
          isActive: true,
        },
      });
    }
    res.json({ plan });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Insights
router.get('/insights', async (req, res) => {
  try {
    const insights = await prisma.aIInsight.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    res.json({ insights });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Weakness Detection
router.get('/weaknesses', authorize('student'), async (req, res) => {
  try {
    const [quizResults, submissions] = await Promise.all([
      prisma.quizResult.findMany({
        where: { studentId: req.userId },
        include: { quiz: { select: { title: true, passingScore: true } } },
      }),
      prisma.assignmentSubmission.findMany({
        where: { studentId: req.userId, status: 'graded' },
        include: { assignment: { select: { title: true, maxMarks: true } } },
      }),
    ]);

    const weaknesses = [];
    const failedQuizzes = quizResults.filter(q => !q.passed);
    if (failedQuizzes.length > 0) {
      weaknesses.push({ area: 'Quiz Performance', message: `Failed ${failedQuizzes.length} quizzes`, score: Math.round(failedQuizzes.reduce((s, q) => s + q.percentage, 0) / failedQuizzes.length) });
    }

    const lowGrades = submissions.filter(s => s.marks < s.assignment.maxMarks * 0.6);
    if (lowGrades.length > 0) {
      weaknesses.push({ area: 'Assignments', message: `${lowGrades.length} assignments below 60%`, score: Math.round(lowGrades.reduce((s, a) => s + ((a.marks / a.assignment.maxMarks) * 100), 0) / lowGrades.length) });
    }

    res.json({ weaknesses });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Performance Prediction
router.get('/prediction', authorize('student'), async (req, res) => {
  try {
    const quizResults = await prisma.quizResult.findMany({
      where: { studentId: req.userId },
      orderBy: { attemptedAt: 'asc' },
    });

    const avgScore = quizResults.length > 0
      ? quizResults.reduce((s, q) => s + q.percentage, 0) / quizResults.length
      : 0;

    const trend = quizResults.length >= 2
      ? (quizResults[quizResults.length - 1].percentage - quizResults[0].percentage) / quizResults.length
      : 0;

    res.json({
      predictedScore: Math.min(100, Math.max(0, avgScore + trend * 5)),
      trend: trend > 0 ? 'improving' : trend < 0 ? 'declining' : 'stable',
      confidence: quizResults.length >= 5 ? 'high' : quizResults.length >= 2 ? 'medium' : 'low',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------------
// Deterministic learning-roadmap content.
//
// For each tracked skill we recommend concrete, achievable actions:
//   courses  -> course titles that match the skill's keywords
//   projects -> project ideas tied to the skill
//   practice -> coding-lab style practice suggestions
//   certifications -> industry certifications that validate the skill
// This is a static, explainable knowledge base used by the skill-gap
// analyzer and the career advisor.
// -------------------------------------------------------------------
const ROADMAP = {
  Python: { certifications: ['PCAP — Certified Associate Python Programmer', 'Google IT Automation with Python'], practice: 'Automate a repetitive task, then solve recursion/DS problems in Python' },
  JavaScript: { certifications: ['JavaScript Algorithms & Data Structures (freeCodeCamp)'], practice: 'Build interactive widgets and small single-page apps' },
  Java: { certifications: ['Oracle Certified Associate Java SE'], practice: 'Implement OOP problems and collections-based utilities' },
  SQL: { certifications: ['HackerRank SQL (Intermediate)', 'Google Data Analytics'], practice: 'Write joins, aggregations, and window functions on sample datasets' },
  React: { certifications: ['Meta Front-End Developer (Coursera)'], practice: 'Build a data dashboard with hooks and state management' },
  'Node.js': { certifications: ['Meta Back-End Developer (Coursera)'], practice: 'Build a REST API with auth and a database' },
  'Web Development': { certifications: ['freeCodeCamp Responsive Web Design'], practice: 'Clone a landing page with semantic HTML + CSS' },
  'Machine Learning': { certifications: ['DeepLearning.AI Machine Learning Specialization'], practice: 'Train a model on a public dataset and document the pipeline' },
  Statistics: { certifications: ['Google Data Analytics'], practice: 'Run hypothesis tests and A/B analysis on sample data' },
  'Data Visualization': { certifications: ['Tableau Desktop Specialist'], practice: 'Turn a raw dataset into an interactive dashboard' },
  'Data Structures & Algorithms': { certifications: ['HackerRank Problem Solving (Intermediate)'], practice: 'Solve 2–3 problems daily in the Coding Lab' },
  'Operating Systems': { certifications: ['Coursera Operating Systems Fundamentals'], practice: 'Trace process scheduling and memory allocation scenarios' },
  Networking: { certifications: ['Cisco CCNA (intro)'], practice: 'Simulate LAN topologies and packet flow' },
  Cybersecurity: { certifications: ['CompTIA Security+', 'Google Cybersecurity'], practice: 'Run a password audit and threat-hunting exercise' },
  'System Design': { certifications: ['Grokking System Design (Educative)'], practice: 'Design a social feed, an e-commerce cart, and a chat service' },
  Mathematics: { certifications: ['Mathematics for Machine Learning (Coursera)'], practice: 'Revise calculus/linear algebra with weekly problem sets' },
  Communication: { certifications: ['Coursera Successful Negotiation'], practice: 'Present one project demo to a peer group every month' },
  'Critical Thinking': { certifications: ['Coursera Think Again'], practice: 'Write structured analyses of case studies' },
  'Public Speaking': { certifications: ['Coursera Dynamic Public Speaking'], practice: 'Deliver a 3-minute talk on a project' },
};

const DEFAULT_CERT = 'LinkedIn Learning skill assessment';
const DEFAULT_PRACTICE = 'Practice on a small real-world task using the skill';

function buildRoadmap(skill) {
  const entry = ROADMAP[skill] || {};
  return {
    courses: `${skill} — enroll in a matching course from the course catalog`,
    projects: `Build: ${skill}`,
    practice: entry.practice || DEFAULT_PRACTICE,
    certifications: entry.certifications || [DEFAULT_CERT],
  };
}

// GET /api/ai/skill-gap?role=full_stack_developer
router.get('/skill-gap', authorize('student'), async (req, res) => {
  try {
    const role = CAREER_ROLES.find((r) => r.key === req.query.role);
    if (!role) {
      return res.status(400).json({ error: 'Unknown role. Options: ' + CAREER_ROLES.map((r) => r.key).join(', ') });
    }
    const skills = await computeStudentSkills(prisma, req.userId);
    const { rows, readiness } = computeSkillGap(skills, role.targets);

    const withRoadmap = rows.map((r) => ({ ...r, status: r.gap === 0 ? 'ready' : r.gap < 20 ? 'close' : 'needs-work', roadmap: buildRoadmap(r.skill) }));
    const recommended = withRoadmap.filter((r) => r.gap > 0).sort((a, b) => b.gap - a.gap);

    res.json({
      role: { key: role.key, label: role.label, description: role.description },
      readiness,
      rows: withRoadmap,
      recommended: recommended.slice(0, 5),
      overallProgress: Math.round(readiness),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/ai/career-advisor
router.get('/career-advisor', authorize('student'), async (req, res) => {
  try {
    const [skills, context] = await Promise.all([
      computeStudentSkills(prisma, req.userId),
      buildStudentContext(prisma, req.userId),
    ]);

    const roleScores = CAREER_ROLES.map((role) => ({
      key: role.key,
      label: role.label,
      description: role.description,
      ...computeSkillGap(skills, role.targets),
    })).sort((a, b) => b.readiness - a.readiness);

    const recommendedRole = roleScores[0];
    const roleGap = recommendedRole ? computeSkillGap(skills, CAREER_ROLES.find((r) => r.key === recommendedRole.key).targets) : { rows: [], readiness: 0 };

    const gapSkills = roleGap.rows.filter((r) => r.gap > 0).sort((a, b) => b.gap - a.gap).slice(0, 4);
    const projects = gapSkills.slice(0, 3).map((g) => ({ skill: g.skill, idea: `Build: ${g.skill}`, roadmap: buildRoadmap(g.skill) }));
    const certifications = gapSkills.slice(0, 3).map((g) => ({ skill: g.skill, certs: buildRoadmap(g.skill).certifications }));
    const internshipSuggestions = gapSkills.slice(0, 3).map((g) => ({ skill: g.skill, suggestion: `Target internships with ${g.skill} in the description` }));

    res.json({
      recommendedRole: recommendedRole ? { key: recommendedRole.key, label: recommendedRole.label, description: recommendedRole.description, readiness: recommendedRole.readiness } : null,
      allRoles: roleScores.map((r) => ({ key: r.key, label: r.label, readiness: r.readiness, strong: r.strong, weak: r.weak })),
      nextSkills: gapSkills.map((g) => ({ skill: g.skill, current: g.current, target: g.target, gap: g.gap })),
      learningPath: gapSkills.map((g) => ({ skill: g.skill, steps: [buildRoadmap(g.skill).courses, buildRoadmap(g.skill).practice, ...buildRoadmap(g.skill).certifications] })),
      certifications,
      projects,
      internshipSuggestions,
      summary: {
        name: context.user.name,
        topSkill: skills.filter((s) => s.score > 0)[0]?.name || null,
        pendingAssignments: context.pendingAssignments.length,
        openDrives: context.openDrives.length,
        careerGoal: context.user.careerGoal,
        placementStatus: context.user.placementStatus,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Dashboard Insights
router.get('/dashboard-insights', async (req, res) => {
  try {
    const [userActivity, notifications, messages] = await Promise.all([
      prisma.activityLog.findMany({ where: { userId: req.userId }, orderBy: { createdAt: 'desc' }, take: 5 }),
      prisma.notification.count({ where: { userId: req.userId, isRead: false } }),
      prisma.message.count({ where: { receiverId: req.userId, isRead: false } }),
    ]);

    const insights = [
      { type: 'info', title: 'Activity', description: `${userActivity.length} recent activities logged` },
      { type: 'info', title: 'Notifications', description: `${notifications} unread notifications` },
      { type: 'info', title: 'Messages', description: `${messages} unread messages` },
    ];

    res.json({ insights });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;