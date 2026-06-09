import { motion } from 'framer-motion';
import {
  FiBookOpen, FiClipboard, FiAward, FiCalendar, FiTrendingUp,
  FiChevronRight, FiBarChart2, FiActivity, FiClock, FiZap,
  FiSun, FiMoon, FiCloud, FiArrowUp
} from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import { getHours } from 'date-fns';
import StatCard from '../../components/shared/StatCard';
import CourseProgressCard from '../../components/CourseProgressCard';
import { PageSkeleton } from '../../components/shared/LoadingSkeleton';
import { useStudentData } from '../../hooks/useStudentData';
import { useAuth } from '../../hooks/useAuth';
import { getInitials, timeAgo } from '../../utils/helpers';

const CustomTooltip = ({ active, payload, label, prefix = '', suffix = '' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1E293B]/80 backdrop-blur-xl border border-white/[0.12] rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-xs text-slate-400 mb-0.5">{label}</p>
      <p className="text-sm text-white font-semibold">{prefix}{payload[0].value}{suffix}</p>
    </div>
  );
};

const getGreeting = () => {
  const hour = getHours(new Date());
  if (hour < 12) return { text: 'Good Morning', icon: FiSun, emoji: 'morning' };
  if (hour < 17) return { text: 'Good Afternoon', icon: FiCloud, emoji: 'afternoon' };
  return { text: 'Good Evening', icon: FiMoon, emoji: 'evening' };
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { student, attendance, assignments, certificates, trophies, courses, loading, error, refetch } = useStudentData();
  const greeting = getGreeting();

  const enrolledCourses = courses?.filter?.(c => student?.enrolledCourses?.includes?.(c._id)) || [];
  const enrolledCount = student?.enrolledCourses?.length || 0;
  const attendanceRate = student?.attendance || 0;
  const certCount = Array.isArray(certificates) ? certificates.length : 0;
  const pendingCount = Array.isArray(assignments) ? assignments.filter(a => a.status !== 'submitted').length : 0;
  const streakCount = student?.streak || 0;

  const weeklyProgress = student?.weeklyProgress || [
    { week: 'Week 1', progress: 65 }, { week: 'Week 2', progress: 72 },
    { week: 'Week 3', progress: 68 }, { week: 'Week 4', progress: 85 },
    { week: 'Week 5', progress: 78 }, { week: 'Week 6', progress: 92 },
  ];

  const weeklyActivity = [
    { day: 'Mon', hours: 4 }, { day: 'Tue', hours: 3 },
    { day: 'Wed', hours: 5.5 }, { day: 'Thu', hours: 2.5 },
    { day: 'Fri', hours: 6 }, { day: 'Sat', hours: 3.5 },
    { day: 'Sun', hours: 1.5 },
  ];

  const deadlineItems = Array.isArray(assignments) && assignments.length > 0
    ? assignments.filter(a => a.dueDate).slice(0, 4)
    : [
        { title: 'Calculus Problem Set', course: 'Mathematics', dueDate: '2026-06-15' },
        { title: 'Physics Lab Report', course: 'Physics', dueDate: '2026-06-20' },
        { title: 'Chemistry Assignment', course: 'Chemistry', dueDate: '2026-06-25' },
        { title: 'Literature Essay', course: 'English', dueDate: '2026-06-10' },
      ];

  const recentActivity = student?.recentActivity || [
    { type: 'course', action: 'Started Data Structures module', time: '2 hours ago' },
    { type: 'trophy', action: 'Earned "Quiz Master" badge', time: '1 day ago' },
    { type: 'assignment', action: 'Submitted Physics Lab Report', time: '2 days ago' },
    { type: 'quiz', action: 'Completed Mathematics quiz (92%)', time: '3 days ago' },
    { type: 'course', action: 'Watched "Binary Trees" lecture', time: '4 days ago' },
  ];

  const GreetingIcon = greeting.icon;

  if (loading) return <PageSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center">
          <FiActivity className="text-rose-400" size={28} />
        </div>
        <p className="text-slate-400 text-sm">Failed to load dashboard data</p>
        <p className="text-slate-600 text-xs max-w-md text-center">{error}</p>
        <button
          onClick={refetch}
          className="px-5 py-2 rounded-xl bg-indigo-500/20 text-indigo-400 text-sm hover:bg-indigo-500/30 transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 pb-8">

      {/* Welcome Banner */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-white/[0.06] p-6 lg:p-8"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full -translate-y-40 translate-x-40 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full translate-y-32 -translate-x-32 blur-3xl" />
        <div className="absolute top-1/2 right-12 w-32 h-32 bg-pink-500/8 rounded-full blur-2xl" />
        <div className="relative flex flex-col sm:flex-row items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 p-[2px] flex-shrink-0">
              <div className="w-full h-full rounded-full bg-[#0B1120] flex items-center justify-center">
                <span className="text-xl text-indigo-400 font-bold">{getInitials(student?.name || user?.name)}</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <GreetingIcon className="text-indigo-400" size={18} />
                <h1 className="text-2xl lg:text-3xl font-bold text-white font-heading">
                  {greeting.text}, {student?.name?.split(' ')[0] || user?.name?.split(' ')[0] || 'Student'}!
                </h1>
              </div>
              <p className="text-slate-400 text-sm">
                {greeting.emoji === 'morning' ? 'Ready to learn something new today?' :
                 greeting.emoji === 'afternoon' ? 'Keep up the great progress!' :
                 'Wrap up with some evening study.'}
              </p>
              <div className="flex flex-wrap gap-3 mt-4">
                <Link to="/courses" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-all">
                  <FiBookOpen size={16} /> Continue Learning <FiChevronRight size={14} />
                </Link>
                <Link to="/assignments" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-all">
                  <FiClipboard size={16} /> View Assignments
                </Link>
                <Link to="/trophies" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-all">
                  <FiAward size={16} /> My Trophies
                </Link>
              </div>
            </div>
          </div>
          {streakCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/20 flex-shrink-0"
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
              >
                <FiZap className="text-amber-400" size={20} />
              </motion.div>
              <div>
                <p className="text-amber-400 text-lg font-bold leading-none">{streakCount} day streak</p>
                <p className="text-amber-500/70 text-xs">Keep going!</p>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Quick Stats Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FiCalendar} label="Attendance" value={`${attendanceRate}%`} trend="up" trendValue="This month" color="emerald" variant="gradient" index={0} />
        <StatCard icon={FiBookOpen} label="Enrolled Courses" value={String(enrolledCount)} trend="up" trendValue="Active" color="indigo" variant="gradient" index={1} />
        <StatCard icon={FiClipboard} label="Pending Assignments" value={String(pendingCount)} trend={pendingCount > 0 ? 'up' : 'down'} trendValue={pendingCount > 0 ? 'Needs attention' : 'All done'} color="amber" variant="gradient" index={2} />
        <StatCard icon={FiAward} label="Certificates Earned" value={String(certCount)} trend="up" trendValue="Total earned" color="purple" variant="gradient" index={3} />
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Learning Progress */}
        <motion.div variants={itemVariants} className="bg-[#0F172A] border border-white/[0.06] rounded-2xl p-5">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FiTrendingUp className="text-indigo-400" /> Learning Progress
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyProgress}>
                <defs>
                  <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818CF8" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#818CF8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="week" stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} />
                <YAxis domain={[0, 100]} stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
                <Tooltip content={<CustomTooltip suffix="%" />} />
                <Area type="monotone" dataKey="progress" stroke="#818CF8" strokeWidth={2} fill="url(#progressGradient)" dot={{ fill: '#818CF8', strokeWidth: 2, r: 3 }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Weekly Activity */}
        <motion.div variants={itemVariants} className="bg-[#0F172A] border border-white/[0.06] rounded-2xl p-5">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FiBarChart2 className="text-indigo-400" /> Weekly Activity
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="day" stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} />
                <YAxis stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip suffix=" hrs" />} />
                <Bar dataKey="hours" fill="#818CF8" radius={[6, 6, 0, 0]} barSize={32}>
                  {weeklyActivity.map((entry, i) => (
                    <rect key={i} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Content Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div variants={itemVariants} className="bg-[#0F172A] border border-white/[0.06] rounded-2xl p-5">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FiActivity className="text-indigo-400" /> Recent Activity
          </h2>
          <div className="space-y-1">
            {recentActivity.length > 0 ? recentActivity.map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.03)' }}
                className="group flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all"
              >
                <div className={`w-1 self-stretch rounded-full flex-shrink-0 ${
                  a.type === 'course' ? 'bg-indigo-500' :
                  a.type === 'assignment' ? 'bg-amber-500' :
                  a.type === 'trophy' ? 'bg-emerald-500' : 'bg-rose-500'
                }`} />
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  a.type === 'course' ? 'bg-indigo-500/20 text-indigo-400' :
                  a.type === 'assignment' ? 'bg-amber-500/20 text-amber-400' :
                  a.type === 'trophy' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {a.type === 'course' ? <FiBookOpen size={14} /> : a.type === 'assignment' ? <FiClipboard size={14} /> : a.type === 'trophy' ? <FiAward size={14} /> : <FiTrendingUp size={14} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-300 group-hover:text-white transition-colors">{a.action}</p>
                  <span className="text-xs text-slate-600">{a.time}</span>
                </div>
              </motion.div>
            )) : (
              <p className="text-sm text-slate-500 text-center py-8">No recent activity.</p>
            )}
          </div>
        </motion.div>

        {/* Upcoming Deadlines */}
        <motion.div variants={itemVariants} className="bg-[#0F172A] border border-white/[0.06] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <FiClock className="text-amber-400" /> Upcoming Deadlines
            </h2>
            <Link to="/assignments" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
              View All <FiChevronRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {deadlineItems.length > 0 ? deadlineItems.map((d, i) => {
              const status = getDeadlineStatus(d.dueDate);
              const urgencyBg = status.label === 'Overdue' ? 'bg-rose-500/10' :
                status.label.includes('today') || status.label.includes('tomorrow') ? 'bg-amber-500/10' : 'bg-emerald-500/10';
              const urgencyDot = status.label === 'Overdue' ? 'bg-rose-500' :
                status.label.includes('today') || status.label.includes('tomorrow') ? 'bg-amber-500' : 'bg-emerald-500';
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ x: 4 }}
                  className="group flex items-center justify-between p-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-1 h-10 rounded-full flex-shrink-0 mt-0.5 ${urgencyDot}`} />
                    <div>
                      <p className="text-sm text-white group-hover:text-indigo-400 transition-colors">{d.title}</p>
                      <p className="text-xs text-slate-500">{d.course || d.courseName}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${urgencyBg} ${status.color}`}>{status.label}</span>
                </motion.div>
              );
            }) : (
              <p className="text-sm text-slate-500 text-center py-8">No upcoming deadlines.</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* My Courses Section */}
      <motion.div variants={itemVariants} className="bg-[#0F172A] border border-white/[0.06] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <FiBookOpen className="text-indigo-400" /> My Courses
          </h2>
          <Link to="/courses" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
            View All <FiChevronRight size={12} />
          </Link>
        </div>
        {enrolledCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrolledCourses.map(c => (
              <CourseProgressCard
                key={c._id || c}
                course={typeof c === 'object' ? c : { _id: c, title: 'Course', progress: 0 }}
                onContinue={(id) => navigate(`/learning/${id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-sm text-slate-500 text-center py-12">
            <FiBookOpen className="mx-auto mb-2 text-slate-600" size={24} />
            <p>No courses enrolled yet.</p>
            <Link to="/courses" className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors mt-2">
              Browse Courses <FiChevronRight size={12} />
            </Link>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default StudentDashboard;
