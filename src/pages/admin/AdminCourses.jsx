import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiX, FiBookOpen, FiUsers, FiCheck, FiClock } from 'react-icons/fi';
import API from '../../api/client';
import { PageSkeleton } from '../../components/shared/LoadingSkeleton';

const difficultyStyles = {
  beginner: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  intermediate: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  advanced: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

const statusStyles = {
  published: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  draft: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  archived: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    API.get('/courses', { params: { limit: 50 } })
      .then(res => setCourses(res.data?.courses || []))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = courses.filter(c => c.title?.toLowerCase().includes(search.toLowerCase()));

  const totalEnrollments = courses.reduce((sum, c) => sum + (c._count?.enrollments || 0), 0);
  const totalPublished = courses.filter(c => c.status === 'published').length;

  const statCards = [
    { label: 'Total Courses', value: courses.length, icon: FiBookOpen, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Total Enrollments', value: totalEnrollments, icon: FiUsers, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Published', value: totalPublished, icon: FiCheck, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  if (loading) return <PageSkeleton />;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="gradient-hero rounded-2xl p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 theme-input rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 theme-input rounded-full translate-y-24 -translate-x-24" />
        <div className="relative">
          <h1 className="text-2xl lg:text-3xl font-bold theme-text font-heading">Course Catalog</h1>
          <p className="theme-text mt-1">Browse all courses offered across the institution</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map(stat => (
          <div key={stat.label} className="theme-card border theme-border rounded-2xl p-5 card-shadow-premium">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon size={20} className={stat.color} />
            </div>
            <p className="text-2xl font-bold theme-text">{stat.value}</p>
            <p className="text-xs theme-text-muted mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="relative">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 theme-text-muted" size={16} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search courses by title..."
          className="w-full theme-card border theme-border rounded-xl pl-10 pr-10 py-2.5 text-sm theme-text placeholder-theme-muted focus:outline-none focus:border-indigo-500/50 transition-colors"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 theme-text-muted hover:theme-text">
            <FiX size={16} />
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="theme-card border theme-border rounded-2xl p-12 text-center">
          <FiBookOpen className="mx-auto theme-text-muted mb-3" size={40} />
          <p className="theme-text-muted text-lg">No courses found</p>
          <p className="theme-text-muted text-sm mt-1">Courses will appear here once they are created.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="theme-card border theme-border rounded-2xl overflow-hidden hover:border-indigo-500/30 transition-all"
            >
              {c.thumbnail ? (
                <img src={c.thumbnail} alt={c.title} className="w-full h-36 object-cover" />
              ) : (
                <div className="w-full h-36 gradient-hero flex items-center justify-center">
                  <FiBookOpen className="theme-text-muted" size={36} />
                </div>
              )}
              <div className="p-5">
                <h3 className="text-base font-semibold theme-text mb-2">{c.title}</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium capitalize ${difficultyStyles[c.difficulty?.toLowerCase()] || difficultyStyles.beginner}`}>
                    {c.difficulty || 'Beginner'}
                  </span>
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium capitalize ${statusStyles[c.status] || statusStyles.draft}`}>
                    {c.status || 'draft'}
                  </span>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="theme-text-muted truncate">{c.instructor?.name || 'No instructor'}</p>
                  <p className="theme-text-muted truncate">{c.department?.name || 'General'}</p>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t theme-border text-xs theme-text-muted">
                  <span>{c.credits != null ? `${c.credits} credits` : 'No credits'}</span>
                  <span className="flex items-center gap-1"><FiClock size={12} /> {c.duration || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between mt-2 text-xs theme-text-muted">
                  <span className="flex items-center gap-1"><FiUsers size={12} /> {c._count?.enrollments || 0} students</span>
                  <span>{c._count?.modules || 0} modules</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCourses;
