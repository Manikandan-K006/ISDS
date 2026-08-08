import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../../api/client';
import { ChevronLeft, BookOpen, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CourseBuilder() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newModule, setNewModule] = useState('');

  useEffect(() => {
    API.get(`/courses/${courseId}`)
      .then(({ data }) => setCourse(data.course))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [courseId]);

  const addModule = async () => {
    if (!newModule) return;
    try {
      const { data } = await API.post(`/courses/${courseId}/modules`, { title: newModule });
      setCourse(prev => ({ ...prev, modules: [...(prev.modules || []), data.module] }));
      setNewModule('');
      toast.success('Module added');
    } catch (err) {
      toast.error('Failed to add module');
    }
  };

  if (loading) return <div className="p-6"><div className="skeleton h-8 w-48 mb-4" /></div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/teacher/courses" className="p-2 rounded-lg hover:theme-hover"><ChevronLeft size={20} /></Link>
        <h1 className="text-page-title theme-text">{course?.title || 'Course Builder'}</h1>
      </div>

      <div className="theme-card rounded-2xl p-5 card-shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-card-subtitle theme-text">Modules</h2>
          <div className="flex gap-2">
            <input value={newModule} onChange={e => setNewModule(e.target.value)} placeholder="Module title"
              className="px-3 py-2 rounded-xl theme-input border theme-border theme-text text-sm w-48" />
            <button onClick={addModule} className="px-3 py-2 rounded-xl gradient-accent text-white text-sm"><Plus size={16} /></button>
          </div>
        </div>
        <div className="space-y-3">
          {course?.modules?.map((mod, i) => (
            <div key={mod.id} className="flex items-center gap-3 p-3 rounded-xl hover:theme-hover">
              <span className="w-6 text-center text-sm theme-text-muted">{i + 1}</span>
              <BookOpen size={16} className="text-indigo-500" />
              <p className="text-sm theme-text flex-1">{mod.title}</p>
              <span className="text-xs theme-text-muted">{mod._count?.lessons || 0} lessons</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}