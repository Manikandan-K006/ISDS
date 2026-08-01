import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import API from '../../api/client';
import { DashboardSkeleton } from '../../components/ui/Skeleton';
import { BookOpen, CalendarCheck, BarChart3, TrendingUp, Clock, ArrowRight, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/students/dashboard')
      .then(({ data }) => setData(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  const stats = data?.stats || {};
  const enrollments = data?.enrollments || [];
  const upcomingAssignments = data?.upcomingAssignments || [];
  const notifications = data?.notifications || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="gradient-hero rounded-2xl p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 theme-input rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 theme-input rounded-full translate-y-24 -translate-x-24" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold theme-text font-heading">Welcome back, {user?.name}</h1>
            <p className="theme-text mt-1">
              {user?.program || 'Program'} · {user?.department || 'Department'}
              {user?.registerNumber && <span className="ml-2 text-xs theme-text-muted">Reg: {user.registerNumber}</span>}
            </p>
            <p className="text-xs theme-text-muted mt-1">
              {user?.semester && <span className="mr-3">Semester {user.semester}</span>}
              {user?.batch && <span className="mr-3">Batch {user.batch}</span>}
              {user?.section && <span className="mr-3">Section {user.section}</span>}
              {user?.facultyAdvisor && <span>Faculty Advisor: {user.facultyAdvisor}</span>}
            </p>
          </div>
          {user?.cgpa != null && (
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold theme-text">{user.cgpa}</p>
                <p className="text-xs theme-text-muted">CGPA</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold theme-text">{user.creditsEarned ?? '—'}<span className="text-base theme-text-muted">/{user.creditsRequired || '—'}</span></p>
                <p className="text-xs theme-text-muted">Credits</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Enrolled Courses', value: stats.totalCourses, icon: BookOpen, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
          { label: 'Avg Progress', value: `${stats.avgProgress}%`, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Attendance', value: `${stats.attendanceRate}%`, icon: CalendarCheck, color: 'text-violet-500', bg: 'bg-violet-500/10' },
          { label: 'Avg Quiz Score', value: `${stats.avgQuizScore}%`, icon: BarChart3, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="theme-card rounded-2xl p-5 card-shadow-premium"
          >
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon size={20} className={stat.color} />
            </div>
            <p className="text-2xl font-bold theme-text">{stat.value}</p>
            <p className="text-xs theme-text-muted mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrolled Courses */}
        <div className="theme-card rounded-2xl p-5 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-card-subtitle theme-text">My Courses</h2>
            <Link to="/courses" className="text-xs text-indigo-500 hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {enrollments.slice(0, 5).map((enrollment) => (
              <Link key={enrollment.id} to={`/learning/${enrollment.course.id}`}
                className="flex items-center gap-3 p-3 rounded-xl hover:theme-hover transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <BookOpen size={18} className="text-indigo-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium theme-text truncate">{enrollment.course.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${enrollment.progress}%` }} />
                    </div>
                    <span className="text-xs theme-text-muted">{Math.round(enrollment.progress)}%</span>
                  </div>
                </div>
                <ArrowRight size={16} className="theme-text-muted" />
              </Link>
            ))}
            {enrollments.length === 0 && (
              <div className="text-center py-6">
                <GraduationCap size={32} className="mx-auto theme-text-muted mb-2" />
                <p className="text-sm theme-text-muted">No courses enrolled yet</p>
                <Link to="/courses" className="text-sm text-indigo-500 hover:underline mt-2 inline-block">Browse Courses</Link>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="theme-card rounded-2xl p-5 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-card-subtitle theme-text">Upcoming Deadlines</h2>
            <Link to="/assignments" className="text-xs text-indigo-500 hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {upcomingAssignments.map((assignment) => (
              <div key={assignment.id} className="flex items-center gap-3 p-3 rounded-xl hover:theme-hover transition-colors">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Clock size={18} className="text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium theme-text truncate">{assignment.title}</p>
                  <p className="text-xs theme-text-muted">{assignment.course?.title} • Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-amber-500/10 text-amber-500">
                  {Math.ceil((new Date(assignment.dueDate) - new Date()) / (1000 * 60 * 60 * 24))}d
                </span>
              </div>
            ))}
            {upcomingAssignments.length === 0 && (
              <p className="text-sm theme-text-muted text-center py-6">No upcoming deadlines</p>
            )}
          </div>
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="theme-card rounded-2xl p-5 card-shadow">
          <h2 className="text-card-subtitle theme-text mb-4">Recent Notifications</h2>
          <div className="space-y-2">
            {notifications.slice(0, 5).map((n) => (
              <div key={n.id} className="flex items-center gap-3 p-3 rounded-xl hover:theme-hover transition-colors">
                <div className={`w-2 h-2 rounded-full ${n.isRead ? 'bg-transparent' : 'bg-indigo-500'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm theme-text">{n.title}</p>
                  <p className="text-xs theme-text-muted">{n.message}</p>
                </div>
                <span className="text-xs theme-text-muted">{new Date(n.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}