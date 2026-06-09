import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FiUsers, FiLayers, FiBarChart2, FiPhone,
  FiArrowRight, FiClock, FiTrendingUp, FiCheckCircle,
  FiActivity, FiUserPlus, FiBookOpen, FiArrowUp, FiArrowDown
} from 'react-icons/fi';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import API from '../../api/client';
import StatCard from '../../components/shared/StatCard';
import { PageSkeleton } from '../../components/shared/LoadingSkeleton';

const PIE_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#F43F5E', '#8B5CF6', '#06B6D4'];

const activityIcons = {
  enrollment: FiUserPlus,
  course: FiBookOpen,
  report: FiActivity,
};

const activityBorders = {
  enrollment: 'border-l-emerald-500',
  course: 'border-l-indigo-500',
  report: 'border-l-amber-500',
};

const dateRanges = [
  { label: 'This Month', value: 'month' },
  { label: 'This Quarter', value: 'quarter' },
  { label: 'This Year', value: 'year' },
];

const tooltipStyle = {
  contentStyle: {
    background: 'rgba(15, 23, 42, 0.9)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '13px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
  },
  labelStyle: { color: '#94A3B8' },
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState('month');
  const [data, setData] = useState({ students: [], courses: [], attendance: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [minutesAgo, setMinutesAgo] = useState('just now');
  const intervalRef = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.allSettled([
        API.get('/students'),
        API.get('/courses'),
        API.get('/attendance'),
      ]);
      setData({
        students: results[0].status === 'fulfilled' ? results[0].value.data : [],
        courses: results[1].status === 'fulfilled' ? results[1].value.data : [],
        attendance: results[2].status === 'fulfilled' ? results[2].value.data : [],
      });
      setLastUpdated(Date.now());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const diff = Math.floor((Date.now() - lastUpdated) / 60000);
      setMinutesAgo(diff < 1 ? 'just now' : `${diff} min${diff !== 1 ? '' : ''} ago`);
    }, 30000);
    return () => clearInterval(intervalRef.current);
  }, [lastUpdated]);

  const totalStudents = data.students.length;
  const totalCourses = data.courses.length;
  const presentCount = data.attendance.filter(a => a.status === 'present').length;
  const absentCount = data.attendance.filter(a => a.status === 'absent').length;
  const leaveCount = data.attendance.filter(a => a.status === 'leave').length;
  const totalDays = data.attendance.filter(a => a.status !== 'holiday').length;
  const avgAttendance = totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : 0;
  const publishedCount = data.courses.filter(c => c.status === 'published').length;
  const completionRate = totalCourses > 0 ? Math.round((publishedCount / totalCourses) * 100) : 0;

  const domainData = data.courses.reduce((acc, c) => {
    const existing = acc.find(d => d.name === c.domain);
    if (existing) existing.count++;
    else acc.push({ name: c.domain, count: 1 });
    return acc;
  }, []);

  const coursePerformance = [...data.courses]
    .sort((a, b) => (b.enrolledCount || 0) - (a.enrolledCount || 0))
    .slice(0, 5)
    .map(c => ({
      name: c.title && c.title.length > 18 ? c.title.slice(0, 18) + '...' : c.title || 'Untitled',
      enrolled: c.enrolledCount || 0,
      completion: Math.min(Math.round(((c.enrolledCount || 0) / Math.max(totalStudents, 1)) * 100), 100),
    }));

  const enrollmentTrend = [
    { month: 'Jan', students: 320 },
    { month: 'Feb', students: 345 },
    { month: 'Mar', students: 360 },
    { month: 'Apr', students: 380 },
    { month: 'May', students: 410 },
    { month: 'Jun', students: 428 },
    { month: 'Jul', students: 445 },
    { month: 'Aug', students: 470 },
    { month: 'Sep', students: 490 },
    { month: 'Oct', students: 510 },
    { month: 'Nov', students: 525 },
    { month: 'Dec', students: Math.max(totalStudents, 540) },
  ];

  const recentActivity = [
    { id: 1, action: totalStudents > 0 ? `${data.students[0]?.name || 'A student'} enrolled in a course` : 'New student registration', time: '2 min ago', type: 'enrollment' },
    { id: 2, action: `${publishedCount} course${publishedCount !== 1 ? 's' : ''} published`, time: '1 hour ago', type: 'course' },
    { id: 3, action: `Attendance recorded for ${totalDays} day${totalDays !== 1 ? 's' : ''}`, time: '3 hours ago', type: 'report' },
    { id: 4, action: `${totalStudents} student${totalStudents !== 1 ? 's' : ''} currently enrolled`, time: 'Today', type: 'enrollment' },
    { id: 5, action: `${totalCourses} course${totalCourses !== 1 ? 's' : ''} in the system`, time: 'Today', type: 'course' },
  ];

  const stats = [
    { icon: FiUsers, label: 'Total Students', value: String(totalStudents), trend: 'up', trendValue: '12% this month', color: 'indigo' },
    { icon: FiLayers, label: 'Total Courses', value: String(totalCourses), trend: 'up', trendValue: `${publishedCount} published`, color: 'emerald' },
    { icon: FiTrendingUp, label: 'Avg Attendance', value: `${avgAttendance}%`, trend: avgAttendance >= 75 ? 'up' : 'down', trendValue: `${totalDays} days recorded`, color: 'amber' },
    { icon: FiCheckCircle, label: 'Completion Rate', value: `${completionRate}%`, trend: completionRate >= 50 ? 'up' : 'down', trendValue: `${publishedCount}/${totalCourses} completed`, color: 'purple' },
  ];

  if (loading) return <PageSkeleton />;

  if (error) return (
    <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-8 text-center">
      <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-rose-500/20 flex items-center justify-center">
        <FiActivity className="text-rose-400" size={24} />
      </div>
      <p className="text-rose-400 text-sm font-semibold">Failed to load dashboard data</p>
      <p className="text-rose-400/60 text-xs mt-1 mb-4">{error}</p>
      <button onClick={fetchData} className="px-5 py-2 bg-rose-500/20 hover:bg-rose-500/30 rounded-xl text-rose-400 text-sm font-medium transition-colors">
        Retry
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-heading">Admin Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1 flex items-center gap-1.5">
            <FiClock size={13} /> Last updated {minutesAgo}
          </p>
        </div>
        <div className="flex items-center bg-[#0F172A] border border-white/[0.06] rounded-xl p-1">
          {dateRanges.map(r => (
            <button
              key={r.value}
              onClick={() => setDateRange(r.value)}
              className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${
                dateRange === r.value
                  ? 'bg-indigo-500/20 text-indigo-300 shadow-sm'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <StatCard key={i} icon={s.icon} label={s.label} value={s.value} trend={s.trend} trendValue={s.trendValue} color={s.color} variant="gradient" index={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#0F172A] border border-white/[0.06] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <FiTrendingUp className="text-emerald-400" size={16} /> Student Enrollment Trend
            </h2>
            <span className="text-xs text-slate-500">Jan - Dec</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={enrollmentTrend} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="enrollmentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.05)' }} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Area type="monotone" dataKey="students" stroke="#6366F1" strokeWidth={2.5} fill="url(#enrollmentGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-[#0F172A] border border-white/[0.06] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <FiBarChart2 className="text-indigo-400" size={16} /> Course Distribution
            </h2>
            <span className="text-xs text-slate-500">{domainData.length} domains</span>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={domainData} cx="50%" cy="50%" innerRadius={65} outerRadius={105} paddingAngle={3} dataKey="count">
                  {domainData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-full md:w-auto space-y-2.5">
              {domainData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-xs text-slate-400 min-w-[80px] truncate">{d.name}</span>
                  <span className="text-xs text-white font-semibold">{d.count}</span>
                </div>
              ))}
              {domainData.length === 0 && (
                <p className="text-xs text-slate-500">No domain data</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[#0F172A] border border-white/[0.06] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <FiActivity className="text-indigo-400" size={16} /> Recent Activity
            </h2>
            <button className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
              View All <FiArrowRight size={12} />
            </button>
          </div>
          <div className="space-y-1 max-h-[320px] overflow-y-auto custom-scrollbar">
            {recentActivity.map(a => {
              const Icon = activityIcons[a.type] || FiActivity;
              return (
                <div key={a.id} className={`border-l-4 ${activityBorders[a.type] || 'border-l-slate-500'} pl-3 py-3 pr-2 rounded-r-xl hover:bg-white/[0.03] transition-colors`}>
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 bg-white/[0.05]">
                      <Icon size={13} className="text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-300 truncate">{a.action}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{a.time}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-[#0F172A] border border-white/[0.06] rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <FiBarChart2 className="text-indigo-400" size={16} /> Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => navigate('/admin/students')} className="group relative p-4 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.1] transition-all text-left overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <FiUsers className="text-indigo-400" size={18} />
                </div>
                <p className="text-sm text-white font-medium">Manage Students</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[11px] text-slate-500">{totalStudents} enrolled</span>
                  <FiArrowRight size={14} className="text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            </button>

            <button onClick={() => navigate('/admin/courses')} className="group relative p-4 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.1] transition-all text-left overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <FiLayers className="text-emerald-400" size={18} />
                </div>
                <p className="text-sm text-white font-medium">Manage Courses</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[11px] text-slate-500">{totalCourses} active</span>
                  <FiArrowRight size={14} className="text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            </button>

            <button onClick={() => navigate('/admin/analytics')} className="group relative p-4 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.1] transition-all text-left overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <FiBarChart2 className="text-amber-400" size={18} />
                </div>
                <p className="text-sm text-white font-medium">View Analytics</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[11px] text-slate-500">Reports</span>
                  <FiArrowRight size={14} className="text-slate-600 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            </button>

            <button onClick={() => navigate('/admin/communications')} className="group relative p-4 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.1] transition-all text-left overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/5 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-purple-500/15 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <FiPhone className="text-purple-400" size={18} />
                </div>
                <p className="text-sm text-white font-medium">Communications</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[11px] text-slate-500">Send messages</span>
                  <FiArrowRight size={14} className="text-slate-600 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            </button>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-[#0F172A] border border-white/[0.06] rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <FiCheckCircle className="text-emerald-400" size={16} /> Today's Attendance Overview
          </h2>
          <div className="flex items-center gap-6">
            <div className="relative w-20 h-20 flex-shrink-0">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 72 72">
                <circle cx="36" cy="36" r="32" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
                <circle
                  cx="36" cy="36" r="32"
                  fill="none" stroke="#10B981"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 32}`}
                  strokeDashoffset={`${2 * Math.PI * 32 * (1 - avgAttendance / 100)}`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-white font-heading">{avgAttendance}%</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="w-full bg-white/[0.06] rounded-full h-2 mb-4">
                <div className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-1000" style={{ width: `${avgAttendance}%` }} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/10">
                  <p className="text-lg font-bold text-emerald-400 font-heading">{presentCount}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Present</p>
                </div>
                <div className="text-center p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/10">
                  <p className="text-lg font-bold text-rose-400 font-heading">{absentCount}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Absent</p>
                </div>
                <div className="text-center p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/10">
                  <p className="text-lg font-bold text-amber-400 font-heading">{leaveCount}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Leave</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-[#0F172A] border border-white/[0.06] rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <FiTrendingUp className="text-emerald-400" size={16} /> Course Performance
          </h2>
          <div className="space-y-4">
            {coursePerformance.length > 0 ? coursePerformance.map((c, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-slate-500 w-5 font-mono">{String(i + 1).padStart(2, '0')}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-slate-300 truncate">{c.name}</span>
                    <span className="text-xs text-slate-500 ml-2 flex-shrink-0">{c.enrolled} students</span>
                  </div>
                  <div className="w-full bg-white/[0.06] rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000"
                      style={{ width: `${c.completion}%` }}
                    />
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8">
                <FiTrendingUp size={24} className="mx-auto text-slate-600 mb-2" />
                <p className="text-xs text-slate-500">No course data available</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
