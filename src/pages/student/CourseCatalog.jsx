import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiBookOpen, FiUsers, FiClock, FiChevronRight, FiPlay, FiAward, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { MOCK_COURSES, MOCK_STUDENT, DOMAINS } from '../../utils/constants';
import { getDifficultyColor } from '../../utils/helpers';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const CourseCatalog = () => {
  const [search, setSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');

  const enrolledIds = MOCK_STUDENT.enrolledCourses.map(c => c._id);

  const filtered = MOCK_COURSES.filter(c => {
    if (selectedDomain !== 'All' && c.domain !== selectedDomain) return false;
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.instructor.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getDomainBadge = (domain) => {
    if (domain === 'Mandatory') return { label: 'Required', class: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
    if (domain === 'Co-curricular') return { label: 'Co-curricular', class: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
    return null;
  };

  const getEnrolledProgress = (courseId) => {
    const enrolled = MOCK_STUDENT.enrolledCourses.find(c => c._id === courseId);
    return enrolled ? enrolled.progress : 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Course Catalog</h1>
          <p className="text-slate-400 mt-1 text-sm">Explore and enroll in courses across all domains</p>
        </div>
        <div className="relative w-full lg:w-80">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="w-full bg-[#0F172A] border border-white/[0.06] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/40 transition-colors"
          />
        </div>
      </motion.div>

      {/* Domain Filters */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none"
      >
        {['All', ...DOMAINS].map(d => (
          <button
            key={d}
            onClick={() => setSelectedDomain(d)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              selectedDomain === d
                ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/25'
                : 'bg-[#0F172A] text-slate-400 border border-white/[0.06] hover:border-white/[0.12] hover:text-slate-300'
            }`}
          >
            {d}
          </button>
        ))}
      </motion.div>

      {/* Course Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
      >
        {filtered.map(course => {
          const enrolled = enrolledIds.includes(course._id);
          const progress = getEnrolledProgress(course._id);
          const badge = getDomainBadge(course.domain);
          const diffColor = getDifficultyColor(course.difficulty);

          return (
            <motion.div
              key={course._id}
              variants={item}
              className="bg-[#0F172A] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-indigo-500/20 transition-all group"
            >
              {/* Thumbnail */}
              <div className="relative h-36 bg-gradient-to-br from-indigo-600/20 via-violet-600/10 to-slate-800 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(99,102,241,0.12),transparent_70%)]" />
                <FiBookOpen className="text-white/[0.08]" size={48} />
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  {badge && (
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${badge.class}`}>
                      {badge.label}
                    </span>
                  )}
                  {course.creditPoints > 0 && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      <FiAward size={10} />
                      {course.creditPoints} CR
                    </span>
                  )}
                </div>
                <span className={`absolute top-3 right-3 text-[10px] font-medium px-2 py-0.5 rounded-full border bg-${diffColor}-500/10 text-${diffColor}-400 border-${diffColor}-500/20`}>
                  {course.difficulty}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-4">
                <h3 className="text-sm font-semibold text-white/90 group-hover:text-indigo-300 transition-colors line-clamp-2 leading-snug">
                  {course.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1">{course.instructor}</p>

                <div className="flex items-center gap-3 mt-2.5 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <FiClock size={12} className="text-slate-600" /> {course.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <FiUsers size={12} className="text-slate-600" /> {course.enrolledCount}
                  </span>
                </div>

                {enrolled && (
                  <div className="mt-3 pt-3 border-t border-white/[0.06]">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-400">Progress</span>
                      <span className={progress === 100 ? 'text-emerald-400' : 'text-slate-400'}>{progress}%</span>
                    </div>
                    <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                )}

                <Link
                  to={enrolled ? `/learning/${course._id}` : '#'}
                  onClick={e => { if (!enrolled) { e.preventDefault(); alert('Enrolling... ' + course.title); } }}
                  className={`mt-3 w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 transition-all ${
                    enrolled
                      ? 'bg-gradient-to-r from-indigo-500/20 to-violet-500/20 text-indigo-300 border border-indigo-500/25 hover:from-indigo-500/30 hover:to-violet-500/30'
                      : 'bg-white/[0.04] text-slate-400 border border-white/[0.06] hover:bg-white/[0.08] hover:text-slate-300'
                  }`}
                >
                  {enrolled ? (
                    <>Continue <FiArrowRight size={14} /></>
                  ) : (
                    <>Enroll Now <FiChevronRight size={14} /></>
                  )}
                </Link>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-4">
            <FiBookOpen className="text-slate-600" size={28} />
          </div>
          <p className="text-slate-400 text-sm">No courses found matching your filters.</p>
          <button
            onClick={() => { setSearch(''); setSelectedDomain('All'); }}
            className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Clear all filters
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default CourseCatalog;
