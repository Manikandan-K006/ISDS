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

export const RESOURCE_TYPES = [
  'PDF', 'DOC', 'DOCX', 'PPT', 'PPTX', 'XLS', 'XLSX', 'ZIP',
  'Image', 'Video', 'Audio',
  'YouTube', 'GoogleDrive', 'OneDrive', 'GitHub', 'Website', 'ResearchPaper', 'Docs',
];

export const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Public' },
  { value: 'students', label: 'Students Only' },
  { value: 'draft', label: 'Draft' },
];

export const API_BASE = import.meta.env.VITE_API_URL || '';
