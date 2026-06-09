import { useState } from 'react';
import { FiSearch, FiBookOpen, FiClock, FiUsers, FiArrowRight, FiChevronRight, FiAward } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { Card, Badge } from '../../components/ui';
import { PageSkeleton } from '../../components/shared/LoadingSkeleton';
import { useStudentData } from '../../hooks/useStudentData';
import { DOMAINS } from '../../utils/constants';
import { getDifficultyColor, getDomainColor } from '../../utils/helpers';

const domainStripColors = {
  Engineering: 'bg-indigo-500',
  Science: 'bg-emerald-500',
  Arts: 'bg-rose-500',
  Humanities: 'bg-amber-500',
  'Physical Education': 'bg-orange-500',
  Music: 'bg-purple-500',
  'Co-curricular': 'bg-emerald-500',
  Mandatory: 'bg-red-500',
};

const CourseCatalog = () => {
  const { courses, student, loading, error } = useStudentData();
  const [search, setSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');

  if (loading) return <PageSkeleton />;

  if (error) {
    return (
      <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-rose-400 text-sm">
        Failed to load data: {error}
      </div>
    );
  }

  const enrolledIds = (student?.enrolledCourses || []).map(c => c._id);

  const filtered = (courses || []).filter(c => {
    if (selectedDomain !== 'All' && c.domain !== selectedDomain) return false;
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.instructor.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getEnrolledProgress = (courseId) => {
    const enrolled = (student?.enrolledCourses || []).find(c => c._id === courseId);
    return enrolled ? enrolled.progress : 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-white">Courses</h1>
          <p className="text-sm text-slate-400">Explore and enroll in courses</p>
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
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(course => {
          const enrolled = enrolledIds.includes(course._id);
          const progress = getEnrolledProgress(course._id);
          const diffColor = getDifficultyColor(course.difficulty);
          const stripColor = domainStripColors[course.domain] || 'bg-slate-500';

          return (
            <Card key={course._id} hover className="overflow-hidden p-0">
              <div className={`h-1.5 w-full ${stripColor} rounded-t-2xl`} />
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <Badge color={diffColor}>{course.difficulty}</Badge>
                  {course.creditPoints > 0 && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 flex items-center gap-1">
                      <FiAward size={10} /> {course.creditPoints} CR
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-semibold text-white leading-snug mb-1">{course.title}</h3>
                <p className="text-xs text-slate-500 mb-3">{course.instructor}</p>

                <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                  <span className="flex items-center gap-1">
                    <FiClock size={12} className="text-slate-600" /> {course.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <FiUsers size={12} className="text-slate-600" /> {course.enrolledCount}
                  </span>
                </div>

                {enrolled && (
                  <div className="mb-3 pt-3 border-t border-white/[0.06]">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-400">Progress</span>
                      <span className={progress === 100 ? 'text-emerald-400' : 'text-slate-400'}>{progress}%</span>
                    </div>
                    <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-400 rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}

                <Link
                  to={enrolled ? `/learning/${course._id}` : '#'}
                  onClick={e => { if (!enrolled) { e.preventDefault(); alert('Enrolling... ' + course.title); } }}
                  className={`w-full py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 transition-all ${
                    enrolled
                      ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/25 hover:bg-indigo-500/20'
                      : 'bg-white/[0.04] text-slate-400 border border-white/[0.06] hover:bg-white/[0.08] hover:text-slate-300'
                  }`}
                >
                  {enrolled ? (
                    <>Continue <FiArrowRight size={14} /></>
                  ) : (
                    <>Enroll <FiChevronRight size={14} /></>
                  )}
                </Link>
              </div>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
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
        </div>
      )}
    </div>
  );
};

export default CourseCatalog;
