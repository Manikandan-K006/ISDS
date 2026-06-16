import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiLayers, FiTrendingUp, FiCheckCircle, FiActivity, FiArrowRight } from 'react-icons/fi';
import {
  AreaChart, Area, BarChart, Bar,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import API from '../../api/client';
import { getDashboardAnalytics } from '../../api/analytics';
import { KpiCard, Card, Button } from '../../components/ui';
import { PageSkeleton } from '../../components/shared/LoadingSkeleton';

const AdminDashboard = () => {
  const [data, setData] = useState({ students: [], courses: [], attendance: [] });
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const results = await Promise.allSettled([
        API.get('/students'),
        API.get('/courses'),
        API.get('/attendance'),
        getDashboardAnalytics(),
      ]);
      setData({
        students: results[0].status === 'fulfilled' ? results[0].value.data : [],
        courses: results[1].status === 'fulfilled' ? results[1].value.data : [],
        attendance: results[2].status === 'fulfilled' ? results[2].value.data : [],
      });
      if (results[3].status === 'fulfilled') setAnalytics(results[3].value.data);
      setLoading(false);
    })();
  }, []);

  if (loading) return <PageSkeleton />;

  const totalStudents = data.students.length;
  const totalCourses = data.courses.length;
  const presentCount = data.attendance.filter(a => a.status === 'present').length;
  const totalDays = data.attendance.filter(a => a.status !== 'holiday').length;
  const avgAttendance = totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : 0;
  const publishedCount = data.courses.filter(c => c.status === 'published').length;
  const completionRate = totalCourses > 0 ? Math.round((publishedCount / totalCourses) * 100) : 0;

  const enrollmentTrend = analytics?.enrollmentsByMonth || [];
  const courseDist = analytics?.coursesByDomain || [];
  const recentActivity = analytics?.recentEnrollments?.slice(0, 6).map(e => ({
    id: e.id,
    action: e.student ? `${e.student.name} enrolled in ${e.course?.title || 'a course'}` : 'New enrollment',
    time: e.date ? new Date(e.date).toLocaleDateString() : 'Recently',
  })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold theme-text">Admin</h1>
        <p className="text-sm theme-text-muted mt-1">Dashboard overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={FiUsers} label="Total Students" value={totalStudents} color="indigo" />
        <KpiCard icon={FiLayers} label="Total Courses" value={totalCourses} color="emerald" />
        <KpiCard icon={FiTrendingUp} label="Avg Attendance" value={`${avgAttendance}%`} color="amber" />
        <KpiCard icon={FiCheckCircle} label="Completion Rate" value={`${completionRate}%`} color="purple" />
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold theme-text">Enrollment Trend</h2>
            <span className="text-xs theme-text-muted">Monthly</span>
          </div>
          {enrollmentTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={enrollmentTrend} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="enrollmentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366F1" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text)', fontSize: '13px' }} />
                <Area type="monotone" dataKey="count" stroke="#6366F1" strokeWidth={2} fill="url(#enrollmentGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="theme-text-muted text-sm py-12 text-center">No data available</p>
          )}
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold theme-text">Course Distribution</h2>
            <span className="text-xs theme-text-muted">{courseDist.length} domains</span>
          </div>
          {courseDist.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={courseDist} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text)', fontSize: '13px' }} />
                <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="theme-text-muted text-sm py-12 text-center">No data available</p>
          )}
        </Card>
      </motion.div>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold theme-text flex items-center gap-2">
            <FiActivity className="text-indigo-400" size={16} /> Recent Activity
          </h2>
        </div>
        {recentActivity.length > 0 ? (
          <div className="space-y-1">
            {recentActivity.map(a => (
              <div key={a.id} className="flex items-center gap-3 py-3 border-b theme-border last:border-0">
                <div className="w-7 h-7 rounded-lg theme-subtle flex items-center justify-center shrink-0">
                  <FiActivity size={13} className="theme-text-muted" />
                </div>
                <p className="text-sm theme-text flex-1 truncate">{a.action}</p>
                <span className="text-xs theme-text-muted shrink-0">{a.time}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="theme-text-muted text-sm py-6 text-center">No recent activity</p>
        )}
      </Card>
    </div>
  );
};

export default AdminDashboard;
