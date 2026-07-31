import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import API from '../../api/client';
import { Zap } from 'lucide-react';

export default function Skills() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/students/skills')
      .then(({ data }) => setData(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const skills = data?.skills || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-page-title theme-text">Skills</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map((s) => (
          <div key={s.id} className="theme-card rounded-2xl p-5 card-shadow-premium">
            <div className="flex items-center gap-3 mb-3">
              <Zap size={20} className="text-amber-500" />
              <p className="text-sm font-semibold theme-text">{s.skill?.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 rounded-full bg-white/10">
                <div className="h-full rounded-full bg-indigo-500" style={{ width: `${s.level}%` }} />
              </div>
              <span className="text-xs theme-text-muted">{s.level}%</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}