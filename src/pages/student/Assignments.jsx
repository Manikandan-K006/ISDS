import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import API from '../../api/client';
import { PageSkeleton } from '../../components/ui/Skeleton';
import { ClipboardList, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function Assignments() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/students/assignments')
      .then(({ data }) => setData(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSkeleton />;

  const submissions = data?.submissions || [];
  const pending = data?.pendingAssignments || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-page-title theme-text">Assignments</h1>

      {pending.length > 0 && (
        <div className="theme-card rounded-2xl p-5 card-shadow">
          <h2 className="text-card-subtitle theme-text mb-4">Pending Assignments</h2>
          <div className="space-y-3">
            {pending.map((a) => (
              <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl hover:theme-hover transition-colors">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Clock size={18} className="text-amber-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium theme-text">{a.title}</p>
                  <p className="text-xs theme-text-muted">{a.course?.title} • Due: {new Date(a.dueDate).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="theme-card rounded-2xl p-5 card-shadow">
        <h2 className="text-card-subtitle theme-text mb-4">Submissions</h2>
        <div className="space-y-3">
          {submissions.map((s) => (
            <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl hover:theme-hover transition-colors">
              <div className={`w-10 h-10 rounded-lg ${s.status === 'graded' ? 'bg-emerald-500/10' : 'bg-indigo-500/10'} flex items-center justify-center`}>
                {s.status === 'graded' ? <CheckCircle size={18} className="text-emerald-500" /> : <ClipboardList size={18} className="text-indigo-500" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium theme-text">{s.assignment?.title}</p>
                <p className="text-xs theme-text-muted">{s.assignment?.course?.title} • {new Date(s.submittedAt).toLocaleDateString()}</p>
              </div>
              {s.marks != null && (
                <span className="text-sm font-bold text-emerald-500">{s.marks}/{s.assignment?.maxMarks}</span>
              )}
              <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                s.status === 'graded' ? 'bg-emerald-500/10 text-emerald-500' :
                s.status === 'late' ? 'bg-red-500/10 text-red-400' : 'bg-indigo-500/10 text-indigo-500'
              }`}>{s.status}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}