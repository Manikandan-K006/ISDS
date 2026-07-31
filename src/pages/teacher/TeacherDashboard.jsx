import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import API from '../../api/client';
import { DashboardSkeleton } from '../../components/ui/Skeleton';
import { BookOpen, Users, ClipboardCheck, CalendarCheck, Plus, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/teachers/dashboard')
      .then(({ data }) => setData(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  const stats = data?.stats || {};
  const courses = data?.courses || [];
  const submissions = data?.submissions || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-page-title theme-text">Teacher Dashboard</h1>
          <p className="theme-text-muted mt-1">Welcome back, {user?.name}</p>
        </div>
        <Link to="/teacher/courses" className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-accent text-white text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus size={16} />
          Create Course
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Courses', value: stats.totalCourses, icon: BookOpen, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
          { label: 'Total Students', value: stats.totalStudents, icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Pending Grading', value: stats.pendingGrading, icon: ClipboardCheck, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: "Today's Attendance", value: data?.todayAttendance || 0, icon: CalendarCheck, color: 'text-violet-500', bg: 'bg-violet-500/10' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="theme-card rounded-2xl p-5 card-shadow-premium"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon size={20} className={stat.color} />
              </div>
            </div>
            <p className="text-2xl font-bold theme-text">{stat.value}</p>
            <p className="text-xs theme-text-muted mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Courses & Recent Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Courses */}
        <div className="theme-card rounded-2xl p-5 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-card-subtitle theme-text">Your Courses</h2>
            <Link to="/teacher/courses" className="text-xs text-indigo-500 hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {courses.slice(0, 5).map((course) => (
              <Link key={course.id} to={`/teacher/courses/${course.id}`}
                className="flex items-center gap-3 p-3 rounded-xl hover:theme-hover transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <BookOpen size={18} className="text-indigo-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium theme-text truncate">{course.title}</p>
                  <p className="text-xs theme-text-muted">{course._count?.enrollments || 0} students • {course._count?.modules || 0} modules</p>
                </div>
                <ArrowUpRight size={16} className="theme-text-muted" />
              </Link>
            ))}
            {courses.length === 0 && (
              <p className="text-sm theme-text-muted text-center py-4">No courses yet. Create your first course!</p>
            )}
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="theme-card rounded-2xl p-5 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-card-subtitle theme-text">Pending Submissions</h2>
            <Link to="/teacher/assignments" className="text-xs text-indigo-500 hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {submissions.slice(0, 8).map((sub) => (
              <div key={sub.id} className="flex items-center gap-3 p-3 rounded-xl hover:theme-hover transition-colors">
                <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-xs font-bold text-indigo-500">
                  {sub.student?.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm theme-text truncate">{sub.assignment?.title}</p>
                  <p className="text-xs theme-text-muted">{sub.student?.name} • {new Date(sub.submittedAt).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${sub.status === 'late' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-500'}`}>
                  {sub.status}
                </span>
              </div>
            ))}
            {submissions.length === 0 && (
              <p className="text-sm theme-text-muted text-center py-4">No pending submissions</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}