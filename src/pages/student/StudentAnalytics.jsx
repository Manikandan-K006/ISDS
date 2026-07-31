import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import API from '../../api/client';
import { BarChart3 } from 'lucide-react';

export default function StudentAnalytics() {
  const [, setData] = useState(null);
  const [, setLoading] = useState(true);

  useEffect(() => {
    API.get('/students/analytics')
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-page-title theme-text">My Analytics</h1>
      <div className="theme-card rounded-2xl p-12 text-center card-shadow">
        <BarChart3 size={48} className="mx-auto theme-text-muted mb-4" />
        <p className="theme-text-muted">Analytics dashboard coming soon</p>
      </div>
    </motion.div>
  );
}