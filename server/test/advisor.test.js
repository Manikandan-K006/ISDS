const { test } = require('node:test');
const assert = require('node:assert');
const { resolveIntent, buildAdvisorReply, generateWeeklySchedule, recommendFocusAreas } = require('../utils/advisor');

const sampleContext = {
  user: { name: 'Arjun', cgpa: 8.2, currentSemesterGpa: 7.9, backlogs: 0, creditsEarned: 120, creditsRequired: 160, placementStatus: 'eligible', careerGoal: 'Software Engineer' },
  attendance: { rate: 82, total: 50, present: 41 },
  attendanceRisk: { status: 'WARNING', target: 75, classesRemaining: 20, canMiss: 14 },
  pendingAssignments: [
    { id: 'a1', title: 'DSA Assignment 3', dueDate: new Date(Date.now() + 86400000), course: { title: 'Data Structures' } },
    { id: 'a2', title: 'DBMS Lab Report', dueDate: new Date(Date.now() + 3 * 86400000), course: { title: 'Databases' } },
  ],
  unattemptedQuizzes: [{ id: 'q1', title: 'Midterm Quiz', course: { title: 'Data Structures' } }],
  quizAvg: 78,
  failedQuizzes: 1,
  lowGrades: 1,
  gradedSubmissionCount: 4,
  plannerTasks: [{ title: 'Revise recursion' }],
  careerProfile: { isPublic: true },
  openDrives: [{ title: 'Campus Drive', company: 'TechCorp', minCGPA: 7.5 }],
  applications: { submitted: 2, shortlisted: 1 },
  topRole: { label: 'Full Stack Developer', readiness: 74 },
  roles: [{ label: 'Full Stack Developer', readiness: 74 }],
  weakSkills: ['Statistics', 'Data Visualization'],
};

test('resolveIntent maps data-grounded questions', () => {
  assert.strictEqual(resolveIntent('what is my cgpa?'), 'cgpa');
  assert.strictEqual(resolveIntent('any pending assignments?'), 'assignments');
  assert.strictEqual(resolveIntent('which quizzes are pending'), 'quiz');
  assert.strictEqual(resolveIntent('what should I study today'), 'study');
  assert.strictEqual(resolveIntent('how do I improve my skills'), 'skills');
  assert.strictEqual(resolveIntent('any placement drives?'), 'career');
  assert.strictEqual(resolveIntent('hello there'), 'greeting');
  assert.strictEqual(resolveIntent('what can you do'), 'help');
  assert.strictEqual(resolveIntent('tell me something random'), 'default');
});

test('resolveIntent prefers specific intent on multi-keyword messages', () => {
  assert.strictEqual(resolveIntent('how to improve my skills and get a job'), 'career');
  assert.strictEqual(resolveIntent('what project should I build to improve'), 'projects');
});

test('buildAdvisorReply reports CGPA and guidance', () => {
  const { reply } = buildAdvisorReply(sampleContext, 'cgpa');
  assert.match(reply, /CGPA is 8.20/);
  assert.match(reply, /semester GPA: 7.90/);
});

test('buildAdvisorReply lists pending assignments with due dates', () => {
  const { reply } = buildAdvisorReply(sampleContext, 'assignments');
  assert.match(reply, /DSA Assignment 3/);
  assert.match(reply, /DBMS Lab Report/);
});

test('buildAdvisorReply surfaces attendance risk', () => {
  const { reply } = buildAdvisorReply(sampleContext, 'attendance');
  assert.match(reply, /82%/);
});

test('buildAdvisorReply returns suggestions with every intent', () => {
  for (const intent of ['cgpa', 'study', 'career', 'default', 'help', 'greeting']) {
    const { suggestions } = buildAdvisorReply(sampleContext, intent);
    assert.ok(Array.isArray(suggestions) && suggestions.length >= 1, `missing suggestions for ${intent}`);
  }
});

test('generateWeeklySchedule is deterministic and deadline-first', () => {
  const first = generateWeeklySchedule(sampleContext);
  const second = generateWeeklySchedule(sampleContext);
  assert.deepStrictEqual(first, second);
  const days = Object.values(first.schedule).filter((tasks) => tasks.length);
  assert.ok(days.length >= 1);
  const allTasks = Object.values(first.schedule).flat();
  assert.ok(allTasks[0].type === 'assignment', 'first block should be the most urgent assignment');
  assert.ok(allTasks.every((t) => t.time && t.task && t.date));
  assert.ok(first.focusAreas.length >= 1);
});

test('generateWeeklySchedule handles an empty workload', () => {
  const empty = {
    pendingAssignments: [],
    unattemptedQuizzes: [],
    weakSkills: [],
    plannerTasks: [],
  };
  const { schedule, focusAreas } = generateWeeklySchedule(empty);
  assert.strictEqual(focusAreas.length, 0);
  assert.deepStrictEqual(schedule, {});
});

test('recommendFocusAreas respects caps and ordering', () => {
  const areas = recommendFocusAreas(sampleContext);
  assert.ok(areas.length >= 1);
  assert.strictEqual(areas[0].kind, 'assignment');
  assert.ok(areas.length <= 5);
});
