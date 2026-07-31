import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import API from '../../api/client';
import { Award } from 'lucide-react';

export default function Achievements() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/achievements')
      .then(({ data }) => setData(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const userAchievements = data?.userAchievements || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-page-title theme-text">Achievements</h1>
      {userAchievements.length === 0 ? (
        <div className="theme-card rounded-2xl p-12 text-center card-shadow">
          <Award size={48} className="mx-auto theme-text-muted mb-4" />
          <p className="theme-text-muted">No achievements earned yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userAchievements.map((ua) => (
            <div key={ua.id} className="theme-card rounded-2xl p-5 card-shadow-premium">
              <div className="flex items-center gap-3 mb-2">
                <Award size={24} className="text-amber-500" />
                <p className="text-sm font-semibold theme-text">{ua.achievement?.name}</p>
              </div>
              <p className="text-xs theme-text-muted">{ua.achievement?.description}</p>
              <p className="text-xs theme-text-muted mt-2">Earned {new Date(ua.earnedAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}