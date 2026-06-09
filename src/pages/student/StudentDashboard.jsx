import { motion } from 'framer-motion';
import {
  FiBookOpen, FiClipboard, FiAward, FiCalendar, FiTrendingUp,
  FiChevronRight, FiBarChart2, FiActivity
} from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import StatCard from '../../components/shared/StatCard';
import CourseProgressCard from '../../components/CourseProgressCard';
import { useStudentData } from '../../hooks/useStudentData';
import { useAuth } from '../../hooks/useAuth';
import { getInitials } from '../../utils/helpers';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1E293B] border border-white/[0.06] rounded-xl px-3 py-2 shadow-lg">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm text-white font-semibold">{payload[0].value}</p>
    </div>
  );
};

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { student, courses } = useStudentData();
  const enrolledCourses = courses?.filter?.(c => student?.enrolledCourses?.includes?.(c._id)) || [];

  const stats = [
    { icon: FiAward, label: 'Credit Points', value: `${student?.credits || 0} / ${student?.graduationCredits || 120}`, trend: 'up', trendValue: 'Total earned', color: 'emerald' },
    { icon: FiBookOpen, label: 'Courses in Progress', value: String(student?.enrolledCourses?.length || 0), trend: 'up', trendValue: 'Enrolled', color: 'indigo' },
    { icon: FiClipboard, label: 'Certificates', value: '0', trend: 'up', trendValue: 'Earned', color: 'purple' },
    { icon: FiCalendar, label: 'Attendance', value: `${student?.attendance || 0}%`, trend: 'up', trendValue: 'This month', color: 'amber' },
  ];

  const gpaHistory = student?.gpaHistory || [
    { semester: 'Sem 1', gpa: 3.2 },
    { semester: 'Sem 2', gpa: 3.5 },
    { semester: 'Sem 3', gpa: 3.4 },
    { semester: 'Sem 4', gpa: 3.8 },
  ];

  const weeklyActivity = [
    { day: 'Mon', hours: 4 }, { day: 'Tue', hours: 3 },
    { day: 'Wed', hours: 5 }, { day: 'Thu', hours: 2 },
    { day: 'Fri', hours: 6 }, { day: 'Sat', hours: 3.5 },
    { day: 'Sun', hours: 1 },
  ];

  const deadlines = [
    { title: 'Calculus Problem Set', course: 'Mathematics', due: 'Jun 15', color: 'text-rose' },
    { title: 'Physics Lab Report', course: 'Physics', due: 'Jun 20', color: 'text-amber' },
    { title: 'Chemistry Assignment', course: 'Chemistry', due: 'Jun 25', color: 'text-emerald' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 pb-8">
      {/* Welcome Banner */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-white/[0.06] p-6 lg:p-8"
      >
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/10 rounded-full -translate-y-36 translate-x-36 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-purple-500/10 rounded-full translate-y-28 -translate-x-28 blur-3xl" />
        <div className="relative flex flex-col sm:flex-row items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 p-[2px] flex-shrink-0">
            <div className="w-full h-full rounded-full bg-[#0B1120] flex items-center justify-center">
              <span className="text-xl text-indigo-400 font-bold">{getInitials(student?.name || user?.name)}</span>
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl lg:text-3xl font-bold text-white font-heading">
              Good morning, {student?.name?.split(' ')[0] || user?.name?.split(' ')[0] || 'Student'}!
            </h1>
            <p className="text-slate-400 mt-1">
              Class {student?.class || user?.class || ''} &middot; Roll No. {student?.rollNumber || ''}
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
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <StatCard key={i} icon={s.icon} label={s.label} value={s.value} trend={s.trend} trendValue={s.trendValue} color={s.color} variant="gradient" index={i} />
        ))}
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GPA Progress */}
        <motion.div variants={itemVariants} className="bg-[#0F172A] border border-white/[0.06] rounded-xl p-5">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FiTrendingUp className="text-indigo-400" /> GPA Progress
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={gpaHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="semester" stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} />
                <YAxis domain={[0, 4]} stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="gpa" stroke="#818CF8" strokeWidth={2} dot={{ fill: '#818CF8', strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Weekly Activity */}
        <motion.div variants={itemVariants} className="bg-[#0F172A] border border-white/[0.06] rounded-xl p-5">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FiBarChart2 className="text-indigo-400" /> Weekly Activity
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="day" stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} />
                <YAxis stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="hours" fill="#818CF8" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity + Upcoming Assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div variants={itemVariants} className="bg-[#0F172A] border border-white/[0.06] rounded-xl p-5">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FiActivity className="text-indigo-400" /> Recent Activity
          </h2>
          <div className="space-y-1">
            {(student?.recentActivity || []).length > 0 ? student.recentActivity.map((a, i) => (
              <motion.div
                key={i}
                whileHover={{ x: 4 }}
                className="group flex items-start gap-3 p-3 rounded-lg hover:bg-white/[0.03] transition-all cursor-pointer"
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

        {/* Upcoming Assignments */}
        <motion.div variants={itemVariants} className="bg-[#0F172A] border border-white/[0.06] rounded-xl p-5">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FiCalendar className="text-amber-400" /> Upcoming Assignments
          </h2>
          <div className="space-y-2">
            {deadlines.length > 0 ? deadlines.map((d, i) => (
              <motion.div
                key={i}
                whileHover={{ x: 4 }}
                className="group flex items-center justify-between p-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-1 h-10 rounded-full flex-shrink-0 mt-0.5 bg-amber-500" />
                  <div>
                    <p className="text-sm text-white group-hover:text-indigo-400 transition-colors">{d.title}</p>
                    <p className="text-xs text-slate-500">{d.course}</p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full bg-white/5 ${d.color}`}>{d.due}</span>
              </motion.div>
            )) : (
              <p className="text-sm text-slate-500 text-center py-8">No upcoming assignments.</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Enrolled Courses */}
      <motion.div variants={itemVariants} className="bg-[#0F172A] border border-white/[0.06] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <FiBookOpen className="text-indigo-400" /> Enrolled Courses
          </h2>
          <Link to="/courses" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
            View All <FiChevronRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {enrolledCourses.length > 0 ? enrolledCourses.map(c => (
            <CourseProgressCard
              key={c._id || c}
              course={typeof c === 'object' ? c : { _id: c, title: 'Course', progress: 0 }}
              onContinue={(id) => navigate(`/learning/${id}`)}
            />
          )) : (
            <div className="col-span-full text-sm text-slate-500 text-center py-8">No courses enrolled yet.</div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StudentDashboard;
