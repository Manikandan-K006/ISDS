const CAREER_ROLES = [
  {
    key: 'ai_engineer',
    label: 'AI Engineer',
    description: 'Designs and deploys machine learning systems',
    targets: {
      Python: 80,
      'Machine Learning': 80,
      'Data Structures & Algorithms': 70,
      Mathematics: 70,
      SQL: 55,
      'Data Visualization': 50,
    },
  },
  {
    key: 'full_stack_developer',
    label: 'Full Stack Developer',
    description: 'Builds end-to-end web applications',
    targets: {
      JavaScript: 80,
      React: 75,
      'Web Development': 75,
      Python: 60,
      SQL: 65,
      'Data Structures & Algorithms': 55,
    },
  },
  {
    key: 'data_analyst',
    label: 'Data Analyst',
    description: 'Turns raw data into business insight',
    targets: {
      SQL: 80,
      Python: 65,
      Mathematics: 60,
      'Data Visualization': 60,
      Statistics: 65,
      Communication: 55,
    },
  },
  {
    key: 'cybersecurity_analyst',
    label: 'Cybersecurity Analyst',
    description: 'Protects systems and responds to threats',
    targets: {
      Cybersecurity: 75,
      Networking: 70,
      'Operating Systems': 65,
      Python: 55,
      SQL: 50,
    },
  },
  {
    key: 'software_engineer',
    label: 'Software Engineer',
    description: 'Designs and maintains software systems',
    targets: {
      'Data Structures & Algorithms': 75,
      Java: 70,
      Python: 65,
      JavaScript: 65,
      'Operating Systems': 55,
      'System Design': 60,
    },
  },
];

const SKILL_CATEGORIES = {
  Python: 'Programming Languages',
  JavaScript: 'Programming Languages',
  Java: 'Programming Languages',
  'C': 'Programming Languages',
  'C++': 'Programming Languages',
  SQL: 'Data & AI',
  React: 'Web Development',
  'Node.js': 'Web Development',
  'Web Development': 'Web Development',
  'Machine Learning': 'Data & AI',
  Statistics: 'Data & AI',
  'Data Visualization': 'Data & AI',
  'Data Structures & Algorithms': 'Computer Science Fundamentals',
  'Operating Systems': 'Computer Science Fundamentals',
  Networking: 'Computer Science Fundamentals',
  Cybersecurity: 'Computer Science Fundamentals',
  'System Design': 'Computer Science Fundamentals',
  Mathematics: 'Math & Science',
  Physics: 'Math & Science',
  Communication: 'Soft Skills',
  'Critical Thinking': 'Soft Skills',
  'Public Speaking': 'Soft Skills',
};

const DEFAULT_SKILLS = [
  'Python', 'JavaScript', 'Java', 'C', 'C++', 'SQL',
  'React', 'Node.js', 'Web Development', 'Machine Learning',
  'Statistics', 'Data Visualization', 'Data Structures & Algorithms',
  'Operating Systems', 'Networking', 'Cybersecurity', 'System Design',
  'Mathematics', 'Physics', 'Communication', 'Critical Thinking', 'Public Speaking',
];

const SKILL_COURSE_KEYWORDS = {
  Python: ['python', 'programming', 'computer science', 'machine learning'],
  JavaScript: ['javascript', 'web', 'programming', 'computer science'],
  Java: ['java', 'programming', 'computer science'],
  'C': ['c programming', 'computer science', 'programming'],
  'C++': ['c++', 'computer science', 'programming'],
  SQL: ['sql', 'database', 'data', 'computer science'],
  React: ['react', 'web', 'frontend', 'javascript'],
  'Node.js': ['node', 'web', 'backend', 'javascript'],
  'Web Development': ['web', 'html', 'css', 'javascript', 'react'],
  'Machine Learning': ['machine learning', 'ai', 'data science', 'python'],
  Statistics: ['statistics', 'data', 'mathematics', 'probability'],
  'Data Visualization': ['data visualization', 'data', 'analytics'],
  'Data Structures & Algorithms': ['data structures', 'algorithms', 'computer science', 'programming'],
  'Operating Systems': ['operating systems', 'computer science', 'systems'],
  Networking: ['networking', 'computer science', 'security'],
  Cybersecurity: ['cybersecurity', 'security', 'networking'],
  'System Design': ['system design', 'architecture', 'computer science'],
  Mathematics: ['mathematics', 'math', 'calculus', 'algebra', 'statistics'],
  Physics: ['physics', 'quantum', 'science'],
  Communication: ['communication', 'debate', 'english', 'literature'],
  'Critical Thinking': ['philosophy', 'debate', 'mathematics', 'communication'],
  'Public Speaking': ['debate', 'communication'],
};

const PROJECT_STATUS_SCORE = { idea: 20, planning: 40, development: 60, testing: 80, completed: 100 };

const SKILL_WEIGHTS = {
  quiz: 0.3,
  assignment: 0.25,
  project: 0.25,
  course: 0.2,
};

module.exports = {
  CAREER_ROLES,
  SKILL_CATEGORIES,
  DEFAULT_SKILLS,
  SKILL_COURSE_KEYWORDS,
  PROJECT_STATUS_SCORE,
  SKILL_WEIGHTS,
};
