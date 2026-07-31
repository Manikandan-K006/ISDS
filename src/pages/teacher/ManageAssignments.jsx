import { motion } from 'framer-motion';
import { ClipboardList } from 'lucide-react';

export default function ManageAssignments() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-page-title theme-text">Manage Assignments</h1>
      <div className="theme-card rounded-2xl p-12 text-center card-shadow">
        <ClipboardList size={48} className="mx-auto theme-text-muted mb-4" />
        <p className="theme-text-muted">Assignment management coming soon</p>
      </div>
    </motion.div>
  );
}