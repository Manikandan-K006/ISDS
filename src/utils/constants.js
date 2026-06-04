export const ROLES = { STUDENT: 'student', TEACHER: 'teacher', ADMIN: 'admin' };

export const DOMAINS = [
  'Engineering', 'Science', 'Arts', 'Humanities',
  'Physical Education', 'Music', 'Co-curricular', 'Mandatory'
];

export const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

export const ATTENDANCE_STATUS = { PRESENT: 'present', ABSENT: 'absent', LEAVE: 'leave', HOLIDAY: 'holiday' };

export const COLORS = {
  navy: '#0F172A',
  indigo: '#6366F1',
  emerald: '#10B981',
  amber: '#F59E0B',
  rose: '#F43F5E',
  slate: '#64748B',
};

export const API_BASE = import.meta.env.VITE_API_URL || '';

export const MOCK_USER = {
  _id: '1',
  name: 'Arjun Sharma',
  email: 'arjun@school.com',
  role: 'student',
  class: '10A',
  rollNumber: '1012',
  profilePhoto: '',
  parentContact: '+91 98765 43210',
  credits: 28,
  graduationCredits: 120,
};

export const MOCK_STUDENT = {
  _id: '1',
  name: 'Arjun Sharma',
  email: 'arjun@school.com',
  role: 'student',
  class: '10A',
  rollNumber: '1012',
  profilePhoto: '',
  parentContact: '+91 98765 43210',
  credits: 28,
  graduationCredits: 120,
  attendance: 87,
  gpa: 3.6,
  gpaHistory: [3.2, 3.3, 3.5, 3.4, 3.6],
  subjects: [
    { name: 'Mathematics', score: 92, term1: 88, term2: 92 },
    { name: 'Physics', score: 85, term1: 80, term2: 85 },
    { name: 'Chemistry', score: 78, term1: 75, term2: 78 },
    { name: 'English', score: 90, term1: 85, term2: 90 },
    { name: 'Computer Science', score: 95, term1: 90, term2: 95 },
    { name: 'History', score: 82, term1: 78, term2: 82 },
  ],
  enrolledCourses: [
    { _id: 'c1', title: 'Advanced Mathematics', progress: 65, domain: 'Mandatory', creditPoints: 4, instructor: 'Dr. Verma', difficulty: 'Advanced', enrolledCount: 120, thumbnail: '', status: 'in-progress' },
    { _id: 'c2', title: 'Quantum Physics', progress: 40, domain: 'Science', creditPoints: 0, instructor: 'Prof. Kumar', difficulty: 'Advanced', enrolledCount: 85, thumbnail: '', status: 'in-progress' },
    { _id: 'c3', title: 'English Literature', progress: 100, domain: 'Humanities', creditPoints: 0, instructor: 'Ms. Singh', difficulty: 'Intermediate', enrolledCount: 95, thumbnail: '', status: 'completed' },
  ],
};

export const MOCK_COURSES = [
  { _id: 'c1', title: 'Advanced Mathematics', domain: 'Mandatory', type: 'mandatory', creditPoints: 4, instructor: 'Dr. Verma', duration: '12 weeks', difficulty: 'Advanced', enrolledCount: 120, thumbnail: '', status: 'published', modules: [
    { title: 'Module 1: Algebra', lessons: [{ title: 'Introduction to Algebra', videoUrl: 'https://youtu.be/NybHckSEQBI' }, { title: 'Linear Equations', videoUrl: 'https://youtu.be/Ft2_QtXAnh8' }, { title: 'Quadratic Equations', videoUrl: 'https://youtu.be/1F1LQh1_sNc' }] },
    { title: 'Module 2: Calculus', lessons: [{ title: 'Limits & Continuity', videoUrl: 'https://youtu.be/9I7TVGvnIDg' }, { title: 'Derivatives', videoUrl: 'https://youtu.be/PIWAkMpGZTs' }, { title: 'Integration', videoUrl: 'https://youtu.be/JWlKfQ3MBXU' }] },
  ]},
  { _id: 'c2', title: 'Quantum Physics', domain: 'Science', type: 'elective', creditPoints: 0, instructor: 'Prof. Kumar', duration: '10 weeks', difficulty: 'Advanced', enrolledCount: 85, thumbnail: '', status: 'published', modules: [
    { title: 'Module 1: Basics', lessons: [{ title: 'Introduction to Quantum', videoUrl: 'https://youtu.be/JzIYSr3k5_s' }, { title: 'Wave-Particle Duality', videoUrl: 'https://youtu.be/Q_h4IoPJXZw' }, { title: 'Schrodinger Equation', videoUrl: '' }] },
    { title: 'Module 2: Quantum Mechanics', lessons: [{ title: 'Quantum States', videoUrl: '' }, { title: 'Operators & Observables', videoUrl: '' }] },
  ]},
  { _id: 'c3', title: 'English Literature', domain: 'Humanities', type: 'elective', creditPoints: 0, instructor: 'Ms. Singh', duration: '8 weeks', difficulty: 'Intermediate', enrolledCount: 95, thumbnail: '', status: 'published', modules: [
    { title: 'Module 1: Poetry', lessons: [{ title: 'Romantic Poetry', videoUrl: '' }, { title: 'Modern Poetry', videoUrl: '' }] },
    { title: 'Module 2: Prose', lessons: [{ title: 'Fiction', videoUrl: '' }, { title: 'Non-Fiction', videoUrl: '' }] },
  ]},
  { _id: 'c4', title: 'Basketball Fundamentals', domain: 'Physical Education', type: 'elective', creditPoints: 0, instructor: 'Coach Ravi', duration: '6 weeks', difficulty: 'Beginner', enrolledCount: 60, thumbnail: '', status: 'published', modules: [] },
  { _id: 'c5', title: 'Music Theory 101', domain: 'Music', type: 'elective', creditPoints: 0, instructor: 'Mr. Taylor', duration: '8 weeks', difficulty: 'Beginner', enrolledCount: 45, thumbnail: '', status: 'published', modules: [] },
  { _id: 'c6', title: 'Environmental Science', domain: 'Science', type: 'mandatory', creditPoints: 3, instructor: 'Dr. Gupta', duration: '10 weeks', difficulty: 'Intermediate', enrolledCount: 110, thumbnail: '', status: 'published', modules: [] },
  { _id: 'c7', title: 'Debate & Communication', domain: 'Co-curricular', type: 'elective', creditPoints: 0, instructor: 'Ms. Patel', duration: '6 weeks', difficulty: 'Intermediate', enrolledCount: 70, thumbnail: '', status: 'published', modules: [] },
  { _id: 'c8', title: 'Hindi Literature', domain: 'Humanities', type: 'elective', creditPoints: 0, instructor: 'Dr. Mishra', duration: '8 weeks', difficulty: 'Intermediate', enrolledCount: 80, thumbnail: '', status: 'published', modules: [] },
];

export const MOCK_ASSIGNMENTS = [
  { _id: 'a1', courseId: 'c1', courseName: 'Advanced Mathematics', title: 'Calculus Problem Set', description: 'Solve 10 calculus problems', deadline: '2026-06-15T23:59:59', maxMarks: 100, status: 'pending', type: 'file' },
  { _id: 'a2', courseId: 'c2', courseName: 'Quantum Physics', title: 'Physics Lab Report', description: 'Write a lab report on quantum entanglement', deadline: '2026-06-20T23:59:59', maxMarks: 50, status: 'submitted', type: 'text', submittedAt: '2026-05-28T10:30:00' },
  { _id: 'a3', courseId: 'c3', courseName: 'English Literature', title: 'Shakespeare Essay', description: 'Write a 2000 word essay', deadline: '2026-05-10T23:59:59', maxMarks: 100, status: 'graded', type: 'text', submittedAt: '2026-05-08T14:00:00', grade: 88, feedback: 'Excellent analysis!' },
];

export const MOCK_CERTIFICATES = [
  { _id: 'cert1', courseName: 'English Literature', issuedAt: '2026-05-01', grade: 'A', creditPoints: 0, instructor: 'Ms. Singh' },
  { _id: 'cert2', courseName: 'Environmental Science', issuedAt: '2026-04-15', grade: 'A-', creditPoints: 3, instructor: 'Dr. Gupta' },
];

export const MOCK_TROPHIES = [
  { _id: 't1', badgeType: 'academic', title: 'First Course Complete', description: 'Completed your first course!', earnedAt: '2026-04-15', icon: '🏆' },
  { _id: 't2', badgeType: 'attendance', title: 'Perfect Attendance - April', description: '100% attendance in April 2026', earnedAt: '2026-04-30', icon: '⭐' },
  { _id: 't3', badgeType: 'academic', title: 'Top 3 in Class', description: 'Ranked 2nd in Class 10A mid-term exams', earnedAt: '2026-03-15', icon: '🥈' },
  { _id: 't4', badgeType: 'achievement', title: '5 Certificates Earned', description: 'Completed 5 courses', earnedAt: '2026-05-01', icon: '🎓' },
];

export const MOCK_ATTENDANCE = Array.from({ length: 30 }, (_, i) => ({
  date: `2026-05-${String(i + 1).padStart(2, '0')}`,
  status: i < 22 ? (i % 5 === 0 ? 'absent' : i % 7 === 0 ? 'leave' : 'present') : 'holiday',
  reason: i % 5 === 0 ? 'Medical appointment' : undefined,
  teacherNote: i % 5 === 0 ? 'Bring medical certificate' : undefined,
}));

export const MOCK_ACTIVITY_FEED = [
  { id: 1, action: 'Completed module "Prose Analysis" in English Literature', time: '2 hours ago', type: 'course' },
  { id: 2, action: 'Submitted assignment "Shakespeare Essay"', time: '5 hours ago', type: 'assignment' },
  { id: 3, action: 'Earned badge "Perfect Attendance - April"', time: '1 day ago', type: 'trophy' },
  { id: 4, action: 'Scored 88/100 in Calculus Quiz', time: '2 days ago', type: 'quiz' },
  { id: 5, action: 'Enrolled in "Quantum Physics"', time: '3 days ago', type: 'course' },
];
