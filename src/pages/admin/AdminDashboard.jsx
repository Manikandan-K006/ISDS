import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiBookOpen, FiTrendingUp, FiCheckCircle, FiClock, FiMessageSquare, FiArrowRight, FiActivity, FiBarChart2 } from 'react-icons/fi';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis } from 'recharts';
import StatCard from '../../components/shared/StatCard';
import { getStudents } from '../../api/students';
import { getCourses } from '../../api/courses';
import { getAttendance } from '../../api/attendance';

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#F43F5E', '#8B5CF6', '#EC4899', '#14B8A6', '#64748B'];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [attendance, setAttendance] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.allSettled([
        getStudents(),
        getCourses(),
        getAttendance(),
      ]);
      if (results[0].status === 'fulfilled') setStudents(Array.isArray(results[0].value) ? results[0].value : []);
      if (results[1].status === 'fulfilled') setCourses(Array.isArray(results[1].value) ? results[1].value : []);
      if (results[2].status === 'fulfilled') setAttendance(Array.isArray(results[2].value) ? results[2].value : []);
      if (results.every(r => r.status === 'rejected')) setError('Failed to load dashboard data');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const totalStudents = students.length;
  const totalCourses = courses.length;
  const presentCount = attendance.filter(a => a.status === 'present').length;
  const totalDays = attendance.filter(a => a.status !== 'holiday').length;
  const avgAttendance = totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : 0;
  const publishedCount = courses.filter(c => c.status === 'published').length;
  const completionRate = totalCourses > 0 ? Math.round((publishedCount / totalCourses) * 100) : 0;

  const domainData = courses.reduce((acc, c) => {
    const existing = acc.find(d => d.name === c.domain);
    if (existing) existing.count++;
    else acc.push({ name: c.domain, count: 1 });
    return acc;
  }, []);

  const coursePerformance = [...courses]
    .sort((a, b) => (b.enrolledCount || 0) - (a.enrolledCount || 0))
    .slice(0, 5)
    .map(c => ({
      name: c.title && c.title.length > 18 ? c.title.slice(0, 18) + '...' : c.title || 'Untitled',
      enrolled: c.enrolledCount || 0,
      completion: Math.min(Math.round(((c.enrolledCount || 0) / Math.max(totalStudents, 1)) * 100), 100),
    }));

  const enrollmentTrend = [
    { month: 'Jan', students: 320, previous: 290 },
    { month: 'Feb', students: 345, previous: 310 },
    { month: 'Mar', students: 360, previous: 335 },
    { month: 'Apr', students: 380, previous: 350 },
    { month: 'May', students: 410, previous: 375 },
    { month: 'Jun', students: Math.max(totalStudents, 428), previous: 390 },
  ];

  const recentActivity = [
    { id: 1, action: totalStudents > 0 ? `${students[0]?.name || 'A student'} enrolled in a course` : 'New student enrolled', time: 'Today', type: 'enrollment' },
    { id: 2, action: publishedCount > 0 ? `${publishedCount} course${publishedCount > 1 ? 's' : ''} published` : 'No courses published', time: 'Today', type: 'course' },
    { id: 3, action: `Attendance tracked for ${totalDays} day${totalDays !== 1 ? 's' : ''}`, time: 'Today', type: 'report' },
    { id: 4, action: `${totalStudents} student${totalStudents !== 1 ? 's' : ''} enrolled`, time: 'Today', type: 'enrollment' },
    { id: 5, action: `${courses.length} course${courses.length !== 1 ? 's' : ''} in system`, time: 'Today', type: 'course' },
  ];

  const stats = [
    { icon: FiUsers, label: 'Total Students', value: String(totalStudents), trend: 'up', trendValue: `${totalStudents > 0 ? 'Active' : 'No data'}`, color: 'indigo' },
    { icon: FiBookOpen, label: 'Active Courses', value: String(totalCourses), trend: 'up', trendValue: `${publishedCount} published`, color: 'emerald' },
    { icon: FiTrendingUp, label: 'Avg Attendance', value: `${avgAttendance}%`, trend: avgAttendance >= 75 ? 'up' : 'down', trendValue: `${totalDays} days recorded`, color: 'amber' },
    { icon: FiCheckCircle, label: 'Completion Rate', value: `${completionRate}%`, trend: 'up', trendValue: `${publishedCount}/${totalCourses} published`, color: 'purple' },
  ];

  const chartTooltipStyle = {
    contentStyle: { background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '13px' },
    labelStyle: { color: '#94A3B8' },
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      <span className="ml-3 text-slate-400">Loading...</span>
    </div>
  );

  if (error) return (
    <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-6">
      <p className="text-rose-400 text-sm font-medium">Failed to load data</p>
      <p className="text-rose-400/60 text-xs mt-1">{error}</p>
      <button onClick={fetchData} className="mt-3 px-4 py-2 bg-rose-500/20 rounded-lg text-rose-400 text-sm">Retry</button>
    </div>
  );

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 rounded-2xl p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />
        <div className="relative">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white font-heading">Admin Dashboard</h1>
              <p className="text-indigo-200 mt-1">School overview and performance metrics</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-indigo-200 bg-white/10 px-3 py-1.5 rounded-full">
              <FiClock size={12} /> Last updated: just now
            </div>
          </div>
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
              <FiTrendingUp className="text-emerald-400" size={16} /> Enrollment Trend
            </h2>
            <span className="text-xs text-slate-500">Last 6 months</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={enrollmentTrend}>
              <defs>
                <linearGradient id="enrollmentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.05)' }} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip {...chartTooltipStyle} />
              <Area type="monotone" dataKey="previous" stroke="#64748B" strokeWidth={1} strokeDasharray="4 4" fill="none" />
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
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="60%" height={280}>
              <PieChart>
                <Pie data={domainData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="count">
                  {domainData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...chartTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {domainData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-xs text-slate-400 flex-1 truncate">{d.name}</span>
                  <span className="text-xs text-white font-medium">{d.count}</span>
                </div>
              ))}
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
            <button className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              View all <FiArrowRight size={12} />
            </button>
          </div>
          <div className="space-y-1">
            {recentActivity.map((a, i) => (
              <div key={a.id} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/[0.03] transition-colors">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  a.type === 'assignment' ? 'bg-amber-500/10 text-amber-400' :
                  a.type === 'enrollment' ? 'bg-emerald-500/10 text-emerald-400' :
                  a.type === 'course' ? 'bg-indigo-500/10 text-indigo-400' :
                  a.type === 'report' ? 'bg-purple-500/10 text-purple-400' :
                  'bg-rose-500/10 text-rose-400'
                }`}>
                  <FiActivity size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-300 truncate">{a.action}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="space-y-6">
          <div className="bg-[#0F172A] border border-white/[0.06] rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <FiClock className="text-indigo-400" size={16} /> Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => navigate('/admin/courses')} className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.1] transition-all text-left group">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <FiBookOpen className="text-indigo-400" size={15} />
                </div>
                <p className="text-xs text-white font-medium">Manage Courses</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{totalCourses} active courses</p>
              </button>
              <button onClick={() => navigate('/admin/students')} className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.1] transition-all text-left group">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <FiUsers className="text-emerald-400" size={15} />
                </div>
                <p className="text-xs text-white font-medium">View Students</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{totalStudents} enrolled</p>
              </button>
              <button onClick={() => navigate('/admin/analytics')} className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.1] transition-all text-left group">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <FiBarChart2 className="text-amber-400" size={15} />
                </div>
                <p className="text-xs text-white font-medium">Analytics</p>
                <p className="text-[10px] text-slate-500 mt-0.5">View reports</p>
              </button>
              <button onClick={() => navigate('/admin/calls')} className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.1] transition-all text-left group">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <FiMessageSquare className="text-rose-400" size={15} />
                </div>
                <p className="text-xs text-white font-medium">Contact Parents</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Manage communication</p>
              </button>
            </div>
          </div>

          <div className="bg-[#0F172A] border border-white/[0.06] rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <FiCheckCircle className="text-emerald-400" size={16} /> Attendance Overview
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white font-heading">{avgAttendance}%</span>
                  <span className={`text-xs font-medium ${avgAttendance >= 75 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {avgAttendance >= 75 ? 'Good' : 'Needs attention'}
                  </span>
                </div>
                <div className="mt-3 w-full bg-white/[0.06] rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full ${avgAttendance >= 75 ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${avgAttendance}%` }} />
                </div>
                <div className="flex justify-between mt-1.5 text-xs text-slate-500">
                  <span>{presentCount} present</span>
                  <span>{totalDays - presentCount} absent</span>
                </div>
              </div>
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-emerald-400">{avgAttendance}%</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-[#0F172A] border border-white/[0.06] rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <FiTrendingUp className="text-emerald-400" size={16} /> Course Performance
          </h2>
          <div className="space-y-3">
            {coursePerformance.length > 0 ? coursePerformance.map((c, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-slate-500 w-5">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-300 truncate">{c.name}</span>
                    <span className="text-xs text-slate-500">{c.enrolled} students</span>
                  </div>
                  <div className="w-full bg-white/[0.06] rounded-full h-1.5">
                    <div className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${c.completion}%` }} />
                  </div>
                </div>
              </div>
            )) : <p className="text-xs text-slate-500">No course data available</p>}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-[#0F172A] border border-white/[0.06] rounded-2xl p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <FiTrendingUp className="text-emerald-400" size={14} /> Enrolled Students
              </h2>
              <div className="space-y-2">
                {students.slice(0, 4).map((s, i) => (
                  <div key={s._id || i} onClick={() => navigate(`/admin/students/${s._id}`)} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.04] cursor-pointer transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        i === 0 ? 'bg-amber-500/20 text-amber-400' :
                        i === 1 ? 'bg-slate-400/20 text-slate-400' :
                        i === 2 ? 'bg-amber-700/20 text-amber-700' :
                        'bg-indigo-500/20 text-indigo-400'
                      }`}>#{i + 1}</div>
                      <div>
                        <p className="text-sm text-white">{s.name || 'Student'}</p>
                        <p className="text-[10px] text-slate-500">{s.class || ''}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-emerald-400">{(s.gpa || 0).toFixed(1)}</p>
                    </div>
                  </div>
                ))}
                {students.length === 0 && <p className="text-xs text-slate-500">No students enrolled</p>}
              </div>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-rose-400 mb-3 flex items-center gap-2">
                <FiMessageSquare size={14} /> At-Risk Students
              </h2>
              <div className="space-y-2">
                {students.filter(s => (s.attendance || 100) < 70).slice(0, 3).map(s => (
                  <div key={s._id} className="p-2.5 rounded-xl bg-rose-500/[0.04] border border-rose-500/10">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-white">{s.name || 'Student'}</span>
                      <span className="text-xs font-medium text-rose-400">{s.attendance || 0}%</span>
                    </div>
                    <p className="text-[10px] text-slate-500">Low attendance</p>
                    <button onClick={() => navigate('/admin/calls')} className="mt-1.5 text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                      <FiMessageSquare size={10} /> Contact
                    </button>
                  </div>
                ))}
                {students.filter(s => (s.attendance || 100) < 70).length === 0 && (
                  <p className="text-xs text-slate-500">No at-risk students</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
