import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiUsers, FiLayers, FiTrendingUp, FiCheckCircle,
  FiFileText, FiUpload, FiAward, FiBookOpen,
  FiActivity, FiArrowRight, FiPlus, FiSearch,
  FiBarChart2, FiPieChart,
} from 'react-icons/fi';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import API from '../../api/client';
import { getDashboardAnalytics } from '../../api/analytics';
import { KpiCard, Card, Button, Badge } from '../../components/ui';
import { PageSkeleton } from '../../components/shared/LoadingSkeleton';

const PIE_COLORS = ['#22c55e', '#6366f1', '#f59e0b', '#f97316', '#ef4444'];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({ students: [], courses: [] });
  const [analytics, setAnalytics] = useState(null);
  const [courseStats, setCourseStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchCourseStats = useCallback(async () => {
    try {
      const res = await API.get('/analytics/courses');
      if (res.data) setCourseStats(res.data);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    (async () => {
      const results = await Promise.allSettled([
        API.get('/students'),
        API.get('/courses'),
        getDashboardAnalytics(),
      ]);
      setData({
        students: results[0].status === 'fulfilled' ? results[0].value.data : [],
        courses: results[1].status === 'fulfilled' ? results[1].value.data : [],
      });
      if (results[2].status === 'fulfilled') setAnalytics(results[2].value.data);
      setLoading(false);
    })();
    fetchCourseStats();
  }, [fetchCourseStats]);

  if (loading) return <PageSkeleton />;

  const a = analytics || {};
  const totalStudents = data.students.filter(s => s.role === 'student' || !s.role).length;
  const totalCourses = data.courses.length;

  const kpis = [
    { icon: FiUsers, label: 'Total Students', value: a.totalStudents || totalStudents, color: 'indigo' },
    { icon: FiLayers, label: 'Total Courses', value: a.totalCourses || totalCourses, color: 'emerald' },
    { icon: FiBookOpen, label: 'Enrollments', value: a.totalEnrollments || 0, color: 'purple' },
    { icon: FiFileText, label: 'Assignments', value: a.totalAssignments || 0, color: 'amber' },
    { icon: FiUpload, label: 'Submissions', value: a.totalSubmissions || 0, color: 'rose' },
    { icon: FiAward, label: 'Certificates', value: a.totalCertificates || 0, color: 'indigo' },
    { icon: FiTrendingUp, label: 'Attendance', value: `${a.attendanceRate || 0}%`, color: 'amber' },
    { icon: FiCheckCircle, label: 'Completion', value: `${a.completionRate || 0}%`, color: 'emerald' },
  ];

  const enrollmentTrend = a.enrollmentsByMonth || [];
  const regTrend = a.registrationsByMonth || [];
  const courseDist = a.coursesByDomain || [];
  const gradeDist = a.gradeDistribution || {};
  const gradeData = Object.entries(gradeDist).map(([grade, count]) => ({ grade, count }));
  const recentActivity = a.recentEnrollments?.slice(0, 6) || [];

  const quickActions = [
    { label: 'Add Course', icon: FiPlus, path: '/admin/courses', color: 'indigo' },
    { label: 'View Students', icon: FiUsers, path: '/admin/students', color: 'emerald' },
    { label: 'Analytics', icon: FiBarChart2, path: '/admin/analytics', color: 'purple' },
    { label: 'Manage Calls', icon: FiSearch, path: '/admin/calls', color: 'amber' },
  ];

  const actionBg = { indigo: 'bg-indigo-500/10', emerald: 'bg-emerald-500/10', purple: 'bg-purple-500/10', amber: 'bg-amber-500/10' };
  const actionText = { indigo: 'text-indigo-400', emerald: 'text-emerald-400', purple: 'text-purple-400', amber: 'text-amber-400' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold theme-text">Admin Dashboard</h1>
          <p className="text-sm theme-text-muted mt-1">Platform overview & management</p>
        </div>
        <div className="flex gap-2">
          {['overview', 'courses'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-indigo-500/10 text-indigo-400'
                  : 'theme-text-muted hover:theme-hover'
              }`}
            >
              {tab === 'overview' ? 'Overview' : 'Courses'}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
            {kpis.map((k, i) => (
              <motion.div key={k.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <KpiCard {...k} />
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-semibold theme-text">Enrollment Trend</h2>
                <span className="text-xs theme-text-muted">Monthly</span>
              </div>
              {enrollmentTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={enrollmentTrend} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="enrollGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366F1" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text)', fontSize: '13px' }} />
                    <Area type="monotone" dataKey="count" stroke="#6366F1" strokeWidth={2} fill="url(#enrollGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="py-12 text-center text-sm theme-text-muted">No enrollment data</div>
              )}
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-semibold theme-text">Student Registrations</h2>
                <span className="text-xs theme-text-muted">Monthly</span>
              </div>
              {regTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={regTrend} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22c55e" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text)', fontSize: '13px' }} />
                    <Area type="monotone" dataKey="count" stroke="#22c55e" strokeWidth={2} fill="url(#regGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="py-12 text-center text-sm theme-text-muted">No registration data</div>
              )}
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-semibold theme-text">Grade Distribution</h2>
                <span className="text-xs theme-text-muted">{gradeData.reduce((s, g) => s + g.count, 0)} graded</span>
              </div>
              {gradeData.some(g => g.count > 0) ? (
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width="50%" height={220}>
                    <PieChart>
                      <Pie data={gradeData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="count" nameKey="grade" paddingAngle={3}>
                        {gradeData.map((e, i) => <Cell key={e.grade} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text)', fontSize: '13px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2">
                    {gradeData.map((g, i) => (
                      <div key={g.grade} className="flex items-center gap-3 text-sm">
                        <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold" style={{ background: PIE_COLORS[i] + '20', color: PIE_COLORS[i] }}>{g.grade}</span>
                        <span className="theme-text-muted">{g.count} students</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-sm theme-text-muted">No graded submissions yet</div>
              )}
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-semibold theme-text">Course Distribution</h2>
                <span className="text-xs theme-text-muted">{courseDist.length} domains</span>
              </div>
              {courseDist.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={courseDist} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text)', fontSize: '13px' }} />
                    <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="py-12 text-center text-sm theme-text-muted">No course data</div>
              )}
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="p-5 lg:col-span-2">
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
                      <p className="text-sm theme-text flex-1 truncate">
                        {a.student?.name || 'A student'} enrolled in <span className="font-medium">{a.course?.title || 'a course'}</span>
                      </p>
                      <span className="text-xs theme-text-muted shrink-0">
                        {a.date ? new Date(a.date).toLocaleDateString() : ''}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="theme-text-muted text-sm py-6 text-center">No recent activity</p>
              )}
            </Card>

            <Card className="p-5">
              <h2 className="text-sm font-semibold theme-text mb-4">Quick Actions</h2>
              <div className="space-y-2">
                {quickActions.map(action => (
                  <button
                    key={action.label}
                    onClick={() => navigate(action.path)}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:theme-hover transition-colors group"
                  >
                    <div className={`w-8 h-8 rounded-lg ${actionBg[action.color]} flex items-center justify-center`}>
                      <action.icon className={actionText[action.color]} size={15} />
                    </div>
                    <span className="text-sm theme-text flex-1 text-left">{action.label}</span>
                    <FiArrowRight size={14} className="theme-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}

      {activeTab === 'courses' && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold theme-text">Course Performance</h2>
            <Badge color="indigo">{courseStats.length} courses</Badge>
          </div>
          {courseStats.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b theme-border">
                    <th className="text-left py-3 px-2 theme-text-muted font-medium text-xs">Course</th>
                    <th className="text-center py-3 px-2 theme-text-muted font-medium text-xs">Enrolled</th>
                    <th className="text-center py-3 px-2 theme-text-muted font-medium text-xs">Completed</th>
                    <th className="text-center py-3 px-2 theme-text-muted font-medium text-xs">Rate</th>
                    <th className="text-center py-3 px-2 theme-text-muted font-medium text-xs">Assignments</th>
                    <th className="text-center py-3 px-2 theme-text-muted font-medium text-xs">Submissions</th>
                    <th className="text-center py-3 px-2 theme-text-muted font-medium text-xs">Certificates</th>
                  </tr>
                </thead>
                <tbody>
                  {courseStats.slice(0, 15).map(c => (
                    <tr key={c.id} className="border-b theme-border-light hover:theme-hover transition-colors">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <span className="theme-text font-medium truncate max-w-[180px]">{c.title}</span>
                          <Badge color={c.difficulty === 'advanced' ? 'rose' : c.difficulty === 'intermediate' ? 'amber' : 'emerald'}>{c.difficulty || 'beginner'}</Badge>
                        </div>
                      </td>
                      <td className="text-center py-3 px-2 theme-text">{c.enrollments}</td>
                      <td className="text-center py-3 px-2 theme-text">{c.completed}</td>
                      <td className="text-center py-3 px-2">
                        <span className={`text-xs font-medium ${c.completionRate >= 70 ? 'text-emerald-400' : c.completionRate >= 40 ? 'text-amber-400' : 'text-rose-400'}`}>
                          {c.completionRate}%
                        </span>
                      </td>
                      <td className="text-center py-3 px-2 theme-text">{c.assignments}</td>
                      <td className="text-center py-3 px-2 theme-text">{c.submissions}</td>
                      <td className="text-center py-3 px-2 theme-text">{c.certificates}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="theme-text-muted text-sm py-8 text-center">No course data available</p>
          )}
        </Card>
      )}
    </div>
  );
};

export default AdminDashboard;
