import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiBookOpen, FiUsers, FiClock, FiChevronRight, FiFilter } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { MOCK_COURSES, MOCK_STUDENT, DOMAINS, DIFFICULTIES } from '../../utils/constants';
import { getDifficultyColor, getDomainColor } from '../../utils/helpers';

const CourseCatalog = () => {
  const [search, setSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [difficulty, setDifficulty] = useState('All');

  const enrolledIds = MOCK_STUDENT.enrolledCourses.map(c => c._id);

  const filtered = MOCK_COURSES.filter(c => {
    if (selectedDomain !== 'All' && c.domain !== selectedDomain) return false;
    if (difficulty !== 'All' && c.difficulty !== difficulty) return false;
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.instructor.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getDomainBadge = (domain) => {
    if (domain === 'Mandatory') return { label: 'Required', class: 'bg-rose-500/20 text-rose-400 border-rose-500/30' };
    if (domain === 'Co-curricular') return { label: 'Co-curricular', class: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
    return null;
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="gradient-hero rounded-2xl p-6 lg:p-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-white font-heading">Course Catalog</h1>
        <p className="text-slate-300 mt-1">Explore and enroll in courses across all domains</p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-56 flex-shrink-0">
          <div className="glass rounded-xl p-4 sticky top-20">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><FiFilter size={14} /> Filters</h3>
            <div className="mb-4">
              <label className="text-xs text-slate-400 mb-2 block">Domain</label>
              <div className="space-y-1">
                {['All', ...DOMAINS].map(d => (
                  <button key={d} onClick={() => setSelectedDomain(d)}
                    className={`block w-full text-left px-3 py-1.5 rounded-lg text-xs transition-all ${
                      selectedDomain === d ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-2 block">Difficulty</label>
              <div className="space-y-1">
                {['All', ...DIFFICULTIES].map(d => (
                  <button key={d} onClick={() => setDifficulty(d)}
                    className={`block w-full text-left px-3 py-1.5 rounded-lg text-xs transition-all ${
                      difficulty === d ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search courses by title or instructor..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(course => {
              const enrolled = enrolledIds.includes(course._id);
              const progress = MOCK_STUDENT.enrolledCourses.find(c => c._id === course._id)?.progress || 0;
              const badge = getDomainBadge(course.domain);
              const diffColor = getDifficultyColor(course.difficulty);

              return (
                <motion.div
                  key={course._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-xl border border-white/10 overflow-hidden hover:border-indigo-500/20 transition-all group"
                >
                  <div className="h-32 gradient-hero relative flex items-center justify-center">
                    <FiBookOpen className="text-white/20" size={40} />
                    {badge && (
                      <span className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full border ${badge.class}`}>
                        {badge.label}
                      </span>
                    )}
                    {course.creditPoints > 0 && (
                      <span className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {course.creditPoints} Credits
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">{course.instructor}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><FiClock size={12} /> {course.duration}</span>
                      <span className="flex items-center gap-1"><FiUsers size={12} /> {course.enrolledCount}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full bg-${diffColor}-500/10 text-${diffColor}-400 border border-${diffColor}-500/20`}>
                        {course.difficulty}
                      </span>
                      <span className="text-xs text-slate-500">{course.domain}</span>
                    </div>
                    {enrolled && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full gradient-accent rounded-full" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    )}
                    <Link
                      to={enrolled ? `/learning/${course._id}` : '#'}
                      className={`mt-3 w-full py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-all ${
                        enrolled
                          ? 'gradient-accent text-white'
                          : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
                      }`}
                      onClick={e => { if (!enrolled) { e.preventDefault(); alert('Enrolling... ' + course.title); } }}
                    >
                      {enrolled ? 'Continue' : 'Enroll'} <FiChevronRight size={14} />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-500">No courses found matching your filters.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCatalog;
