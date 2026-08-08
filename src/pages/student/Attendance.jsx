import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import API from '../../api/client';
import { PageSkeleton } from '../../components/ui/Skeleton';

export default function Attendance() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/students/attendance')
      .then(({ data }) => setData(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSkeleton />;

  const stats = data?.stats || {};
  const records = data?.records || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-page-title theme-text">Attendance</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Present', value: stats.present, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Absent', value: stats.absent, color: 'text-red-400', bg: 'bg-red-500/10' },
          { label: 'Late', value: stats.late, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Leave', value: stats.leave, color: 'text-violet-500', bg: 'bg-violet-500/10' },
        ].map((s) => (
          <div key={s.label} className="theme-card rounded-2xl p-4 card-shadow text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs theme-text-muted mt-1">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="theme-card rounded-2xl p-5 card-shadow">
        <h2 className="text-card-subtitle theme-text mb-4">Records</h2>
        <div className="space-y-2">
          {records.map((r) => (
            <div key={r.id} className="flex items-center justify-between p-3 rounded-xl hover:theme-hover">
              <span className="text-sm theme-text">{new Date(r.date).toLocaleDateString()}</span>
              <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                r.status === 'present' ? 'bg-emerald-500/10 text-emerald-500' :
                r.status === 'absent' ? 'bg-red-500/10 text-red-400' :
                r.status === 'late' ? 'bg-amber-500/10 text-amber-500' : 'bg-violet-500/10 text-violet-500'
              }`}>{r.status}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}