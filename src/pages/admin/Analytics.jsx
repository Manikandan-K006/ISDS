import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiBarChart2, FiDownload, FiTrendingUp, FiTrendingDown, FiUsers, FiBookOpen, FiAward, FiClock, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { getDashboardAnalytics, getCourseAnalytics } from '../../api/analytics';
import { PageSkeleton } from '../../components/shared/LoadingSkeleton';
import { Card, Badge } from '../../components/ui';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [courseAnalytics, setCourseAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, courseRes] = await Promise.all([
          getDashboardAnalytics(),
          getCourseAnalytics(),
        ]);
        setAnalytics(dashRes.data);
        setCourseAnalytics(courseRes.data || []);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <PageSkeleton />;

  const statCards = [
    { label: 'Total Students', value: analytics?.totalStudents ?? 0, icon: FiUsers, color: 'indigo' },
    { label: 'Total Courses', value: analytics?.totalCourses ?? 0, icon: FiBookOpen, color: 'emerald' },
    { label: 'Enrollments', value: analytics?.totalEnrollments ?? 0, icon: FiTrendingUp, color: 'purple' },
    { label: 'Completion Rate', value: analytics ? `${analytics.completionRate}%` : '0%', icon: FiAward, color: 'amber' },
    { label: 'Submissions', value: analytics?.totalSubmissions ?? 0, icon: FiClock, color: 'rose' },
    { label: 'Certificates', value: analytics?.totalCertificates ?? 0, icon: FiAward, color: 'indigo' },
  ];

  const gradeData = analytics?.gradeDistribution
    ? Object.entries(analytics.gradeDistribution).map(([grade, count]) => ({
        grade,
        count,
        fill: grade === 'A' ? '#10b981' : grade === 'B' ? '#6366f1' : grade === 'C' ? '#f59e0b' : grade === 'D' ? '#f97316' : '#ef4444',
      }))
    : [];

  const courseData = courseAnalytics || [];

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const chartTooltipStyle = {
    contentStyle: { background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text)', fontSize: '13px' },
    labelStyle: { color: 'var(--text-muted)' },
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="gradient-hero rounded-2xl p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 theme-input rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 theme-input rounded-full translate-y-24 -translate-x-24" />
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold theme-text font-heading">Analytics Dashboard</h1>
            <p className="theme-text mt-1">Real-time insights from platform data</p>
          </div>
          <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 theme-text text-sm hover:bg-white/20 transition-colors">
            <FiDownload size={16} /> Export Report
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="theme-card border theme-border rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${s.color === 'indigo' ? 'bg-indigo-500/10' : s.color === 'emerald' ? 'bg-emerald-500/10' : s.color === 'purple' ? 'bg-purple-500/10' : s.color === 'amber' ? 'bg-amber-500/10' : 'bg-rose-500/10'}`}>
                <s.icon className={s.color === 'indigo' ? 'text-indigo-400' : s.color === 'emerald' ? 'text-emerald-400' : s.color === 'purple' ? 'text-purple-400' : s.color === 'amber' ? 'text-amber-400' : 'text-rose-400'} size={20} />
              </div>
            </div>
            <div className="theme-text-muted text-xs font-medium uppercase tracking-wider mb-1">{s.label}</div>
            <div className="text-2xl font-bold theme-text font-heading">{s.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-sm font-semibold theme-text mb-4">Enrollment Trend</h3>
          {analytics?.enrollmentsByMonth?.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={analytics.enrollmentsByMonth}>
                <defs>
                  <linearGradient id="enrollGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                <Tooltip {...chartTooltipStyle} />
                <Area type="monotone" dataKey="count" stroke="#6366f1" fill="url(#enrollGrad2)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <p className="theme-text-muted text-sm py-8 text-center">No data available</p>}
        </Card>

        <Card>
          <h3 className="text-sm font-semibold theme-text mb-4">Course Distribution</h3>
          {analytics?.coursesByDomain?.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={analytics.coursesByDomain} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="count" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {analytics.coursesByDomain.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip {...chartTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="theme-text-muted text-sm py-8 text-center">No data available</p>}
        </Card>

        <Card>
          <h3 className="text-sm font-semibold theme-text mb-4">Grade Distribution</h3>
          {gradeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={gradeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="grade" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                <Tooltip {...chartTooltipStyle} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {gradeData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="theme-text-muted text-sm py-8 text-center">No data available</p>}
        </Card>

        <Card>
          <h3 className="text-sm font-semibold theme-text mb-4">Course Performance</h3>
          {courseData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b theme-border">
                    <th className="text-left py-2 pr-2 theme-text-muted font-medium">Course</th>
                    <th className="text-center py-2 px-2 theme-text-muted font-medium">Enrolled</th>
                    <th className="text-center py-2 px-2 theme-text-muted font-medium">Complete</th>
                    <th className="text-center py-2 pl-2 theme-text-muted font-medium">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {courseData.map((c, i) => (
                    <tr key={c.id || i} className="border-t theme-border">
                      <td className="py-2 pr-2 theme-text">{c.title}</td>
                      <td className="text-center py-2 px-2 theme-text">{c.enrollments}</td>
                      <td className="text-center py-2 px-2 theme-text">{c.completed}</td>
                      <td className="text-center py-2 pl-2">
                        <Badge color={c.completionRate >= 50 ? 'emerald' : 'amber'}>{c.completionRate}%</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="theme-text-muted text-sm py-8 text-center">No courses available</p>}
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
