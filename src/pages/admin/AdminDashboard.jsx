import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiBookOpen, FiTrendingUp, FiCheckCircle, FiClock, FiMessageSquare, FiArrowRight, FiActivity, FiBarChart2 } from 'react-icons/fi';
import { LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import StatCard from '../../components/shared/StatCard';
import { MOCK_STUDENT, MOCK_COURSES, MOCK_ATTENDANCE } from '../../utils/constants';

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#F43F5E', '#8B5CF6', '#EC4899', '#14B8A6', '#64748B'];

const AdminDashboard = () => {
  const navigate = useNavigate();

  const enrollmentTrend = [
    { month: 'Jan', students: 320, previous: 290 },
    { month: 'Feb', students: 345, previous: 310 },
    { month: 'Mar', students: 360, previous: 335 },
    { month: 'Apr', students: 380, previous: 350 },
    { month: 'May', students: 410, previous: 375 },
    { month: 'Jun', students: 428, previous: 390 },
  ];

  const domainData = MOCK_COURSES.reduce((acc, c) => {
    const existing = acc.find(d => d.name === c.domain);
    if (existing) existing.count++;
    else acc.push({ name: c.domain, count: 1 });
    return acc;
  }, []);

  const todayAttendance = MOCK_ATTENDANCE.filter(a => a.date === '2026-05-30');
  const attendanceStatus = todayAttendance.length > 0 ? todayAttendance[0].status : 'present';
  const presentCount = MOCK_ATTENDANCE.filter(a => a.status === 'present').length;
  const totalDays = MOCK_ATTENDANCE.filter(a => a.status !== 'holiday').length;
  const avgAttendance = totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : 0;

  const coursePerformance = MOCK_COURSES.slice(0, 5).map(c => ({
    name: c.title.length > 18 ? c.title.slice(0, 18) + '...' : c.title,
    enrolled: c.enrolledCount,
    completion: Math.floor(Math.random() * 30) + 60,
  }));

  const recentActivity = [
    { id: 1, action: 'Arjun Sharma completed "Calculus Problem Set"', time: '2h ago', type: 'assignment' },
    { id: 2, action: 'Priya Patel enrolled in "Quantum Physics"', time: '4h ago', type: 'enrollment' },
    { id: 3, action: 'New course "AI Fundamentals" published', time: '6h ago', type: 'course' },
    { id: 4, action: 'Attendance report for May generated', time: '1d ago', type: 'report' },
    { id: 5, action: 'Sneha Reddy scored 95/100 in Math quiz', time: '1d ago', type: 'quiz' },
  ];

  const stats = [
    { icon: FiUsers, label: 'Total Students', value: '428', trend: 'up', trendValue: '+12 this month', color: 'indigo' },
    { icon: FiBookOpen, label: 'Active Courses', value: '24', trend: 'up', trendValue: '+3 this month', color: 'emerald' },
    { icon: FiTrendingUp, label: 'Avg Attendance', value: `${avgAttendance}%`, trend: 'up', trendValue: '+2.1%', color: 'amber' },
    { icon: FiCheckCircle, label: 'Completion Rate', value: '87%', trend: 'up', trendValue: '+5.3%', color: 'purple' },
  ];

  const topPerformers = [
    { name: 'Ananya Gupta', class: '9A', gpa: 3.9, attendance: 98 },
    { name: 'Sneha Reddy', class: '10A', gpa: 3.8, attendance: 95 },
    { name: 'Priya Patel', class: '10A', gpa: 3.7, attendance: 92 },
    { name: 'Arjun Sharma', class: '10A', gpa: 3.6, attendance: 87 },
  ];

  const atRisk = [
    { name: 'Vikram Joshi', class: '10B', attendance: 62, reason: 'Low attendance' },
    { name: 'Neha Kapoor', class: '9A', attendance: 68, reason: 'Missing assignments' },
    { name: 'Rohit Kumar', class: '11A', attendance: 58, reason: 'Multiple absences' },
  ];

  const chartTooltipStyle = {
    contentStyle: { background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '13px' },
    labelStyle: { color: '#94A3B8' },
  };

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
                <p className="text-[10px] text-slate-500 mt-0.5">24 active courses</p>
              </button>
              <button onClick={() => navigate('/admin/students')} className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.1] transition-all text-left group">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <FiUsers className="text-emerald-400" size={15} />
                </div>
                <p className="text-xs text-white font-medium">View Students</p>
                <p className="text-[10px] text-slate-500 mt-0.5">428 enrolled</p>
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
                <p className="text-[10px] text-slate-500 mt-0.5">3 at-risk alerts</p>
              </button>
            </div>
          </div>

          <div className="bg-[#0F172A] border border-white/[0.06] rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <FiCheckCircle className="text-emerald-400" size={16} /> Today's Attendance
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
            {coursePerformance.map((c, i) => (
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
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-[#0F172A] border border-white/[0.06] rounded-2xl p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <FiTrendingUp className="text-emerald-400" size={14} /> Top Performers
              </h2>
              <div className="space-y-2">
                {topPerformers.map((s, i) => (
                  <div key={i} onClick={() => navigate('/admin/students')} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.04] cursor-pointer transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        i === 0 ? 'bg-amber-500/20 text-amber-400' :
                        i === 1 ? 'bg-slate-400/20 text-slate-400' :
                        i === 2 ? 'bg-amber-700/20 text-amber-700' :
                        'bg-indigo-500/20 text-indigo-400'
                      }`}>#{i + 1}</div>
                      <div>
                        <p className="text-sm text-white">{s.name}</p>
                        <p className="text-[10px] text-slate-500">{s.class}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-emerald-400">{s.gpa}</p>
                      <p className="text-[10px] text-slate-500">{s.attendance}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-rose-400 mb-3 flex items-center gap-2">
                <FiMessageSquare size={14} /> At-Risk Students
              </h2>
              <div className="space-y-2">
                {atRisk.map((s, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-rose-500/[0.04] border border-rose-500/10">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-white">{s.name}</span>
                      <span className="text-xs font-medium text-rose-400">{s.attendance}%</span>
                    </div>
                    <p className="text-[10px] text-slate-500">{s.reason}</p>
                    <button onClick={() => navigate('/admin/calls')} className="mt-1.5 text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                      <FiMessageSquare size={10} /> Contact
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
