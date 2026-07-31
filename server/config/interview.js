const INTERVIEW_ROLES = [
  { key: 'ai_engineer', label: 'AI Engineer', description: 'Machine learning and AI systems' },
  { key: 'full_stack_developer', label: 'Full Stack Developer', description: 'Web applications end to end' },
  { key: 'data_analyst', label: 'Data Analyst', description: 'Data to insight' },
  { key: 'cybersecurity_analyst', label: 'Cybersecurity Analyst', description: 'Security operations' },
  { key: 'software_engineer', label: 'Software Engineer', description: 'Software design and maintenance' },
  { key: 'communication', label: 'Communication & Soft Skills', description: 'General interview communication' },
];

const QUESTION_PLAN = [
  { level: 'basic', count: 2 },
  { level: 'intermediate', count: 2 },
  { level: 'advanced', count: 1 },
];

const ANSWER_MIN_LENGTH = 20;
const ANSWER_MAX_LENGTH = 3000;

module.exports = { INTERVIEW_ROLES, QUESTION_PLAN, ANSWER_MIN_LENGTH, ANSWER_MAX_LENGTH };
