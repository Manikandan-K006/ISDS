import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../../api/client';
import { DashboardSkeleton } from '../../components/ui/Skeleton';
import { BookOpen, ChevronLeft, CheckCircle, Play, FileText } from 'lucide-react';

export default function LearningPage() {
  const { courseId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState(null);

  useEffect(() => {
    API.get(`/students/progress/${courseId}`)
      .then(({ data }) => {
        setData(data);
        const firstLesson = data.enrollment?.course?.modules?.[0]?.lessons?.[0];
        if (firstLesson) setSelectedLesson(firstLesson);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [courseId]);

  if (loading) return <DashboardSkeleton />;
  if (!data?.enrollment) return <div className="p-6 text-center theme-text-muted">Course not found</div>;

  const { course } = data.enrollment;
  const modules = course?.modules || [];

  const markComplete = async (lessonId) => {
    try {
      await API.post(`/students/lessons/${lessonId}/progress`, { completed: true, timeSpent: 0 });
      setSelectedLesson(prev => ({ ...prev, progress: [{ completed: true }] }));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/courses" className="p-2 rounded-lg hover:theme-hover transition-colors">
          <ChevronLeft size={20} className="theme-text" />
        </Link>
        <div>
          <h1 className="text-page-title theme-text">{course.title}</h1>
          <p className="text-sm theme-text-muted">{modules.length} modules • {modules.reduce((s, m) => s + (m.lessons?.length || 0), 0)} lessons</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-3">
          {modules.map((mod) => (
            <div key={mod.id} className="theme-card rounded-2xl p-4 card-shadow">
              <h3 className="text-sm font-semibold theme-text mb-2">{mod.title}</h3>
              <div className="space-y-1">
                {mod.lessons?.map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() => setSelectedLesson(lesson)}
                    className={`w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors ${
                      selectedLesson?.id === lesson.id ? 'bg-indigo-500/10 text-indigo-500' : 'hover:theme-hover theme-text-muted'
                    }`}
                  >
                    {lesson.progress?.[0]?.completed ? (
                      <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                    ) : (
                      <Play size={14} className="shrink-0" />
                    )}
                    <span className="truncate">{lesson.title}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          {selectedLesson ? (
            <div className="theme-card rounded-2xl p-6 card-shadow">
              <h2 className="text-card-title theme-text mb-4">{selectedLesson.title}</h2>
              {selectedLesson.videoUrl && (
                <div className="aspect-video rounded-xl bg-black mb-4 flex items-center justify-center">
                  <p className="text-white/50 text-sm">Video Player</p>
                </div>
              )}
              <div className="prose prose-sm theme-text max-w-none" dangerouslySetInnerHTML={{ __html: selectedLesson.content || '' }} />
              {!selectedLesson.progress?.[0]?.completed && (
                <button onClick={() => markComplete(selectedLesson.id)}
                  className="mt-4 px-4 py-2 rounded-xl gradient-accent text-white text-sm font-medium hover:opacity-90"
                >
                  Mark as Complete
                </button>
              )}
              {selectedLesson.progress?.[0]?.completed && (
                <div className="mt-4 flex items-center gap-2 text-emerald-500 text-sm">
                  <CheckCircle size={16} />
                  Completed
                </div>
              )}
            </div>
          ) : (
            <div className="theme-card rounded-2xl p-12 text-center card-shadow">
              <BookOpen size={48} className="mx-auto theme-text-muted mb-4" />
              <p className="theme-text-muted">Select a lesson to start learning</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}