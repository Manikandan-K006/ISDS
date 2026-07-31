import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import API from '../../api/client';
import { DashboardSkeleton } from '../../components/ui/Skeleton';
import { Users, BookOpen, GraduationCap, Building2, Activity, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/admin/dashboard')
      .then(({ data }) => setData(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  const stats = data?.stats || {};
  const recentUsers = data?.recentUsers || [];
  const recentActivity = data?.recentActivity || [];

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-500/10', link: '/admin/students' },
    { label: 'Students', value: stats.totalStudents, icon: GraduationCap, color: 'text-emerald-500', bg: 'bg-emerald-500/10', link: '/admin/students' },
    { label: 'Teachers', value: stats.totalTeachers, icon: Users, color: 'text-violet-500', bg: 'bg-violet-500/10', link: '/admin/teachers' },
    { label: 'Parents', value: stats.totalParents, icon: Users, color: 'text-amber-500', bg: 'bg-amber-500/10', link: '/admin/parents' },
    { label: 'Courses', value: stats.totalCourses, icon: BookOpen, color: 'text-rose-500', bg: 'bg-rose-500/10', link: '/admin/courses' },
    { label: 'Departments', value: stats.totalDepartments, icon: Building2, color: 'text-cyan-500', bg: 'bg-cyan-500/10', link: '/admin/departments' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-page-title theme-text">Admin Dashboard</h1>
        <p className="theme-text-muted mt-1">System overview and management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat, i) => (
          <Link key={stat.label} to={stat.link}
            className="theme-card rounded-2xl p-5 card-shadow-premium"
          >
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon size={20} className={stat.color} />
            </div>
            <p className="text-2xl font-bold theme-text">{stat.value}</p>
            <p className="text-xs theme-text-muted mt-1">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Recent Users & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="theme-card rounded-2xl p-5 card-shadow">
          <h2 className="text-card-subtitle theme-text mb-4">Recent Users</h2>
          <div className="space-y-3">
            {recentUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl hover:theme-hover transition-colors">
                <div className="w-9 h-9 rounded-full gradient-accent flex items-center justify-center text-xs font-bold text-white">
                  {u.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium theme-text truncate">{u.name}</p>
                  <p className="text-xs theme-text-muted">{u.email} • {u.role}</p>
                </div>
                <span className="text-xs theme-text-muted">{new Date(u.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="theme-card rounded-2xl p-5 card-shadow">
          <h2 className="text-card-subtitle theme-text mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.slice(0, 10).map((log) => (
              <div key={log.id} className="flex items-center gap-3 p-3 rounded-xl hover:theme-hover transition-colors">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                  <Activity size={16} className="theme-text-muted" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm theme-text truncate">{log.action}</p>
                  <p className="text-xs theme-text-muted">{log.user?.name} • {new Date(log.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}