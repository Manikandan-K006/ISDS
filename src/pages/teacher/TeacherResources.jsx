import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';

export default function TeacherResources() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-page-title theme-text">Resources</h1>
      <div className="theme-card rounded-2xl p-12 text-center card-shadow">
        <FileText size={48} className="mx-auto theme-text-muted mb-4" />
        <p className="theme-text-muted">Resource management coming soon</p>
      </div>
    </motion.div>
  );
}