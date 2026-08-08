import { motion } from 'framer-motion';
import { User } from 'lucide-react';

export default function TeacherProfile() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-page-title theme-text">Profile</h1>
      <div className="theme-card rounded-2xl p-12 text-center card-shadow">
        <User size={48} className="mx-auto theme-text-muted mb-4" />
        <p className="theme-text-muted">Profile settings coming soon</p>
      </div>
    </motion.div>
  );
}