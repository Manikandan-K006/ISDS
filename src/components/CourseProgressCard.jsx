import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiBookOpen, FiChevronRight } from 'react-icons/fi';
import { truncate } from '../utils/helpers';

const CourseProgressCard = ({ course, onContinue }) => {
  const progress = course.progress || 0;

  return (
    <motion.div
      whileHover={{ y: -2 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-4 border border-white/10 hover:border-indigo-500/20 transition-all"
    >
      <div className="flex gap-4">
        <div className="w-16 h-16 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
          <FiBookOpen className="text-indigo-400" size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <Link to={`/learning/${course._id}`} className="text-sm font-semibold text-white hover:text-indigo-400 transition-colors line-clamp-2">
            {course.title}
          </Link>
          <p className="text-xs text-slate-500 mt-1">{course.instructor}</p>
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400">{progress}% complete</span>
              <span className="text-slate-500">{course.lastAccessed ? 'Last accessed: recently' : ''}</span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full gradient-accent rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <button
            onClick={() => onContinue?.(course._id)}
            className="mt-2 flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Continue Learning <FiChevronRight size={12} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseProgressCard;
