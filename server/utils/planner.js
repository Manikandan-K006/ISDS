function daysUntil(date) {
  const ms = new Date(date).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

function priorityFor(days) {
  if (days <= 2) return 'high';
  if (days <= 4) return 'medium';
  return 'low';
}

function suggestTasks({ assignments, quizzes, enrollments }) {
  const tasks = [];

  (assignments || []).forEach((a) => {
    if (!a || !a.dueDate) return;
    const days = daysUntil(a.dueDate);
    if (days > 7) return;
    tasks.push({
      title: `Finish: ${a.title}`,
      subject: a.course?.title || 'Assignment',
      date: new Date(),
      duration: 45,
      priority: priorityFor(days),
      deadline: a.dueDate,
      source: 'assignment',
      sourceId: a.id,
      daysUntil: days,
    });
  });

  (quizzes || []).forEach((q) => {
    if (!q) return;
    tasks.push({
      title: `Practice quiz: ${q.title}`,
      subject: q.course?.title || 'Quiz',
      date: new Date(),
      duration: q.timeLimit || 20,
      priority: 'medium',
      deadline: null,
      source: 'quiz',
      sourceId: q.id,
      daysUntil: 0,
    });
  });

  (enrollments || []).forEach((e) => {
    if (!e) return;
    if (e.isCompleted || e.progress >= 100) return;
    const remaining = Math.round(100 - (e.progress || 0));
    if (remaining < 10) return;
    tasks.push({
      title: `Study: ${e.course?.title} (${remaining}% left)`,
      subject: e.course?.title || 'Course',
      date: new Date(),
      duration: 60,
      priority: remaining >= 50 ? 'high' : 'medium',
      deadline: null,
      source: 'course',
      sourceId: e.courseId,
      daysUntil: 0,
    });
  });

  tasks.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    if (order[a.priority] !== order[b.priority]) return order[a.priority] - order[b.priority];
    return a.daysUntil - b.daysUntil;
  });

  return tasks.slice(0, 10);
}

module.exports = { suggestTasks, priorityFor, daysUntil };
