import { motion } from 'framer-motion';
import { FiBookOpen, FiClipboard, FiAward, FiCalendar, FiTrendingUp, FiClock, FiMessageSquare, FiChevronRight } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import StatCard from '../../components/shared/StatCard';
import CourseProgressCard from '../../components/CourseProgressCard';
import { useStudentData } from '../../hooks/useStudentData';
import { useAuth } from '../../hooks/useAuth';
import { getInitials } from '../../utils/helpers';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { student, courses, loading } = useStudentData();
  const enrolledCourses = courses?.filter?.(c => student?.enrolledCourses?.includes?.(c._id)) || [];

  const stats = [
    { icon: FiAward, label: 'Credit Points', value: `${student?.credits || 0} / ${student?.graduationCredits || 120}`, trend: 'up', trendValue: 'Total earned', color: 'emerald' },
    { icon: FiBookOpen, label: 'Courses in Progress', value: String(student?.enrolledCourses?.length || 0), trend: 'up', trendValue: 'Enrolled', color: 'indigo' },
    { icon: FiClipboard, label: 'Certificates', value: '0', trend: 'up', trendValue: 'Earned', color: 'amber' },
    { icon: FiCalendar, label: 'Attendance', value: `${student?.attendance || 0}%`, trend: 'up', trendValue: 'This month', color: 'rose' },
  ];

  const timetable = [
    { time: '08:00 - 08:45', subject: 'Mathematics', room: '101', teacher: 'Dr. Verma' },
    { time: '08:45 - 09:30', subject: 'Physics', room: '102', teacher: 'Prof. Kumar' },
    { time: '09:30 - 10:15', subject: 'Chemistry', room: '103', teacher: 'Dr. Gupta' },
    { time: '10:15 - 10:30', subject: 'Break', room: '-', teacher: '-' },
    { time: '10:30 - 11:15', subject: 'English', room: '104', teacher: 'Ms. Singh' },
    { time: '11:15 - 12:00', subject: 'Computer Science', room: 'Lab 1', teacher: 'Mr. Raj' },
  ];

  const deadlines = [
    { title: 'Calculus Problem Set', course: 'Mathematics', due: 'Jun 15', color: 'text-rose' },
    { title: 'Physics Lab Report', course: 'Physics', due: 'Jun 20', color: 'text-amber' },
    { title: 'Chemistry Assignment', course: 'Chemistry', due: 'Jun 25', color: 'text-emerald' },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="gradient-hero rounded-2xl p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full translate-y-24 -translate-x-24" />
        <div className="relative flex flex-col sm:flex-row items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-indigo-500/20 border-2 border-indigo-500/30 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl text-indigo-400 font-bold">{getInitials(student?.name || user?.name)}</span>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl lg:text-3xl font-bold text-white font-heading">Good morning, {student?.name?.split(' ')[0] || user?.name?.split(' ')[0] || 'Student'}!</h1>
            <p className="text-slate-300 mt-1">Class {student?.class || user?.class || ''} · Roll No. {student?.rollNumber || ''} · Let's make today productive!</p>
            <div className="flex flex-wrap gap-3 mt-4">
              <Link to="/courses" className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-colors">
                <FiBookOpen size={16} /> Continue Learning <FiChevronRight size={14} />
              </Link>
              <Link to="/assignments" className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-colors">
                <FiClipboard size={16} /> View Assignments
              </Link>
              <Link to="/trophies" className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-colors">
                <FiAward size={16} /> My Trophies
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <StatCard key={i} icon={s.icon} label={s.label} value={s.value} trend={s.trend} trendValue={s.trendValue} color={s.color} variant="gradient" />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="glass rounded-xl p-5">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FiTrendingUp className="text-indigo-400" /> Recent Activity
            </h2>
            <div className="space-y-3">
              {(student?.recentActivity || []).length > 0 ? student.recentActivity.map((a, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    a.type === 'course' ? 'bg-indigo-500/20 text-indigo-400' :
                    a.type === 'assignment' ? 'bg-amber-500/20 text-amber-400' :
                    a.type === 'trophy' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {a.type === 'course' ? <FiBookOpen size={14} /> : a.type === 'assignment' ? <FiClipboard size={14} /> : a.type === 'trophy' ? <FiAward size={14} /> : <FiTrendingUp size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-300">{a.action}</p>
                    <span className="text-xs text-slate-500">{a.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-xl p-5">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FiBookOpen className="text-indigo-400" /> My Courses
            </h2>
            <div className="space-y-3">
              {(student?.enrolledCourses || []).map(c => (
                <CourseProgressCard key={c._id || c} course={typeof c === 'object' ? c : { _id: c, title: 'Course', progress: 0 }} onContinue={(id) => navigate(`/learning/${id}`)} />
              ))}
              {(!student?.enrolledCourses || student.enrolledCourses.length === 0) && (
                <p className="text-sm text-slate-500 text-center py-4">No courses enrolled yet.</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass rounded-xl p-5">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FiClock className="text-indigo-400" /> Today's Schedule
            </h2>
            <div className="space-y-2">
              {timetable.map((t, i) => (
                <div key={i} className={`flex items-center p-2 rounded-lg ${t.subject === 'Break' ? 'bg-white/5' : 'hover:bg-white/5'}`}>
                  <span className={`text-xs font-medium w-24 flex-shrink-0 ${t.subject === 'Break' ? 'text-slate-500' : 'text-slate-400'}`}>{t.time}</span>
                  <span className={`text-sm ${t.subject === 'Break' ? 'text-slate-500 italic' : 'text-white'}`}>{t.subject}</span>
                  {t.subject !== 'Break' && <span className="ml-auto text-xs text-slate-500">{t.room}</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-xl p-5">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FiCalendar className="text-amber-400" /> Upcoming Deadlines
            </h2>
            <div className="space-y-3">
              {deadlines.map((d, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div>
                    <p className="text-sm text-white">{d.title}</p>
                    <p className="text-xs text-slate-500">{d.course}</p>
                  </div>
                  <span className={`text-xs font-medium ${d.color}`}>{d.due}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
