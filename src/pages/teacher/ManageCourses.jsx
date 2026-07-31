import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import API from '../../api/client';
import { PageSkeleton } from '../../components/ui/Skeleton';
import { BookOpen, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', difficulty: 'beginner' });

  useEffect(() => {
    API.get('/teachers/courses')
      .then(({ data }) => setCourses(data.courses || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const createCourse = async () => {
    if (!form.title) return toast.error('Title is required');
    try {
      const { data } = await API.post('/courses', form);
      setCourses(prev => [data.course, ...prev]);
      setShowCreate(false);
      setForm({ title: '', description: '', difficulty: 'beginner' });
      toast.success('Course created');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create course');
    }
  };

  if (loading) return <PageSkeleton />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-page-title theme-text">My Courses</h1>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-accent text-white text-sm font-medium">
          <Plus size={16} /> New Course
        </button>
      </div>

      {showCreate && (
        <div className="theme-card rounded-2xl p-5 card-shadow">
          <h2 className="text-card-subtitle theme-text mb-4">Create Course</h2>
          <div className="space-y-3">
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Course title"
              className="w-full px-4 py-2.5 rounded-xl theme-input border theme-border theme-text text-sm" />
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description" rows={3}
              className="w-full px-4 py-2.5 rounded-xl theme-input border theme-border theme-text text-sm" />
            <select value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value})}
              className="w-full px-4 py-2.5 rounded-xl theme-input border theme-border theme-text text-sm">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <div className="flex gap-2">
              <button onClick={createCourse} className="px-4 py-2 rounded-xl gradient-accent text-white text-sm">Create</button>
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-xl theme-hover theme-text text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => (
          <Link key={course.id} to={`/teacher/courses/${course.id}`}
            className="theme-card rounded-2xl p-5 card-shadow-premium group"
          >
            <div className="flex items-center gap-3 mb-3">
              <BookOpen size={20} className="text-indigo-500" />
              <h3 className="text-sm font-semibold theme-text group-hover:text-indigo-500 transition-colors">{course.title}</h3>
            </div>
            <div className="flex items-center gap-3 text-xs theme-text-muted">
              <span>{course._count?.enrollments || 0} students</span>
              <span>{course._count?.modules || 0} modules</span>
              <span className="capitalize">{course.status}</span>
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}