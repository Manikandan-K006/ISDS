import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';

export default function QuizList() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-page-title theme-text">Quizzes</h1>
      <div className="theme-card rounded-2xl p-12 text-center card-shadow">
        <BookOpen size={48} className="mx-auto theme-text-muted mb-4" />
        <p className="theme-text-muted">Quiz list coming soon</p>
      </div>
    </motion.div>
  );
}