import { format, formatDistanceToNow, parseISO } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return '';
  try {
    return format(parseISO(date), 'MMM dd, yyyy');
  } catch {
    return date;
  }
};

export const formatDateTime = (date) => {
  if (!date) return '';
  try {
    return format(parseISO(date), 'MMM dd, yyyy h:mm a');
  } catch {
    return date;
  }
};

export const timeAgo = (date) => {
  if (!date) return '';
  try {
    return formatDistanceToNow(parseISO(date), { addSuffix: true });
  } catch {
    return date;
  }
};

export const getDeadlineStatus = (deadline) => {
  const now = new Date();
  const due = parseISO(deadline);
  const diff = due - now;
  if (diff < 0) return { label: 'Overdue', color: 'text-rose' };
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return { label: 'Due today', color: 'text-amber' };
  if (days === 1) return { label: 'Due tomorrow', color: 'text-amber' };
  return { label: `${days} days left`, color: 'text-emerald' };
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const truncate = (str, len = 50) => {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '...' : str;
};

export const classColors = {
  '10A': { bg: 'bg-indigo-500/20', text: 'text-indigo-400', border: 'border-indigo-500/30' },
  '10B': { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  '9A': { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
  '9B': { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/30' },
};

export const getDifficultyColor = (difficulty) => {
  const map = { Beginner: 'emerald', Intermediate: 'amber', Advanced: 'rose' };
  return map[difficulty] || 'slate';
};

export const getDomainColor = (domain) => {
  const map = {
    Engineering: 'indigo', Science: 'emerald', Arts: 'rose',
    Humanities: 'amber', 'Physical Education': 'orange',
    Music: 'purple', 'Co-curricular': 'emerald', Mandatory: 'red',
  };
  return map[domain] || 'slate';
};
