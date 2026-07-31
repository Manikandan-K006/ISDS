import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';

export default function TrophySession() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-page-title theme-text">Trophy Session</h1>
      <div className="theme-card rounded-2xl p-12 text-center card-shadow">
        <Trophy size={48} className="mx-auto theme-text-muted mb-4" />
        <p className="theme-text-muted">Trophy session coming soon</p>
      </div>
    </motion.div>
  );
}