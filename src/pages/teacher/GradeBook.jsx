import { motion } from 'framer-motion';
import { ClipboardCheck } from 'lucide-react';

export default function GradeBook() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-page-title theme-text">Grade Book</h1>
      <div className="theme-card rounded-2xl p-12 text-center card-shadow">
        <ClipboardCheck size={48} className="mx-auto theme-text-muted mb-4" />
        <p className="theme-text-muted">Grade book coming soon</p>
      </div>
    </motion.div>
  );
}