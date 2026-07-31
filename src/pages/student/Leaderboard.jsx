import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import API from '../../api/client';
import { PageSkeleton } from '../../components/ui/Skeleton';
import { Trophy } from 'lucide-react';

export default function Leaderboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/students/leaderboard')
      .then(({ data }) => setData(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSkeleton />;
  const entries = data?.entries || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-page-title theme-text">Leaderboard</h1>
      <div className="theme-card rounded-2xl p-5 card-shadow">
        <div className="space-y-3">
          {entries.map((e, i) => (
            <div key={e.id} className="flex items-center gap-3 p-3 rounded-xl hover:theme-hover transition-colors">
              <span className="w-8 text-center font-bold text-sm theme-text-muted">#{i + 1}</span>
              <div className="w-9 h-9 rounded-full gradient-accent flex items-center justify-center text-xs font-bold text-white">
                {e.user?.name?.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium theme-text">{e.user?.name}</p>
                <p className="text-xs theme-text-muted">{e.user?.class}</p>
              </div>
              <div className="flex items-center gap-1">
                <Trophy size={14} className="text-amber-500" />
                <span className="text-sm font-bold theme-text">{e.points}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}