import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import API from '../../api/client';
import { PageSkeleton } from '../../components/ui/Skeleton';
import { BookOpen, Users, Clock, Search, GraduationCap } from 'lucide-react';

export default function CourseCatalog() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    API.get('/courses', { params: { limit: 50 } })
      .then(({ data }) => setCourses(data.courses || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSkeleton />;

  const filtered = courses.filter(c => c.title?.toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-page-title theme-text">Course Catalog</h1>
          <p className="theme-text-muted mt-1">Browse and enroll in courses</p>
        </div>
        <div className="relative w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses..."
            className="w-full pl-9 pr-4 py-2 rounded-xl theme-input border theme-border theme-text text-sm focus:outline-none focus:border-indigo-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((course, i) => (
          <motion.div key={course.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="theme-card rounded-2xl overflow-hidden card-shadow-premium group"
          >
            <div className="h-40 gradient-hero flex items-center justify-center">
              <GraduationCap size={48} className="text-indigo-500/30" />
            </div>
            <div className="p-5">
              <h3 className="text-card-subtitle theme-text mb-2 group-hover:text-indigo-500 transition-colors">{course.title}</h3>
              <p className="text-sm theme-text-muted line-clamp-2 mb-4">{course.description}</p>
              <div className="flex items-center gap-4 text-xs theme-text-muted">
                <span className="flex items-center gap-1"><Users size={14} />{course._count?.enrollments || 0}</span>
                <span className="flex items-center gap-1"><BookOpen size={14} />{course._count?.modules || 0} modules</span>
                <span className="capitalize">{course.difficulty}</span>
              </div>
              <Link to={`/learning/${course.id}`}
                className="mt-4 w-full py-2 rounded-xl bg-indigo-500/10 text-indigo-500 text-sm font-medium text-center block hover:bg-indigo-500/20 transition-colors"
              >
                View Course
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}