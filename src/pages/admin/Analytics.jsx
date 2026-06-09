import { motion } from 'framer-motion';
import { FiBarChart2, FiDownload, FiTrendingUp, FiTrendingDown, FiUsers, FiBookOpen, FiAward, FiClock, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';

const gradeData = [
  { grade: 'A', count: 45, fill: '#6366F1' },
  { grade: 'B+', count: 62, fill: '#10B981' },
  { grade: 'B', count: 55, fill: '#F59E0B' },
  { grade: 'C+', count: 38, fill: '#F43F5E' },
  { grade: 'C', count: 20, fill: '#8B5CF6' },
  { grade: 'D', count: 12, fill: '#EC4899' },
];

const attendanceTrend = [
  { month: 'Jan', rate: 85, target: 80 },
  { month: 'Feb', rate: 88, target: 80 },
  { month: 'Mar', rate: 82, target: 80 },
  { month: 'Apr', rate: 90, target: 82 },
  { month: 'May', rate: 87, target: 82 },
  { month: 'Jun', rate: 84, target: 83 },
];

const subjectData = [
  { subject: 'Math', average: 78, max: 98 },
  { subject: 'Physics', average: 72, max: 95 },
  { subject: 'Chemistry', average: 68, max: 92 },
  { subject: 'English', average: 82, max: 96 },
  { subject: 'CS', average: 85, max: 99 },
  { subject: 'History', average: 74, max: 93 },
];

const coursePerformance = [
  { name: 'Adv. Mathematics', score: 82, students: 120 },
  { name: 'Quantum Physics', score: 76, students: 85 },
  { name: 'English Literature', score: 88, students: 95 },
  { name: 'Environmental Sci.', score: 79, students: 110 },
  { name: 'Debate & Comm.', score: 91, students: 70 },
];

const cocurricularData = [
  { name: 'Sports', value: 35 }, { name: 'Arts', value: 25 }, { name: 'Music', value: 15 },
  { name: 'Debate', value: 15 }, { name: 'Other', value: 10 },
];

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#F43F5E', '#64748B'];

const studentPerformance = [
  { name: 'Ananya Gupta', class: '9A', gpa: 3.9, attendance: 98, trend: 'up' },
  { name: 'Sneha Reddy', class: '10A', gpa: 3.8, attendance: 95, trend: 'up' },
  { name: 'Priya Patel', class: '10A', gpa: 3.7, attendance: 92, trend: 'up' },
  { name: 'Arjun Sharma', class: '10A', gpa: 3.6, attendance: 87, trend: 'stable' },
  { name: 'Rahul Singh', class: '10B', gpa: 3.6, attendance: 90, trend: 'up' },
  { name: 'Amit Verma', class: '9B', gpa: 3.2, attendance: 85, trend: 'stable' },
  { name: 'Kavita Sharma', class: '11B', gpa: 3.0, attendance: 78, trend: 'down' },
  { name: 'Neha Kapoor', class: '9A', gpa: 2.5, attendance: 68, trend: 'down' },
  { name: 'Vikram Joshi', class: '10B', gpa: 2.1, attendance: 62, trend: 'down' },
  { name: 'Rohit Kumar', class: '11A', gpa: 1.8, attendance: 58, trend: 'down' },
];

const chartTooltipStyle = {
  contentStyle: { background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '13px' },
  labelStyle: { color: '#94A3B8' },
};

const Analytics = () => {
  const statCards = [
    { icon: FiUsers, label: 'Total Students', value: '428', change: '+12', changeType: 'up', color: 'indigo' },
    { icon: FiBookOpen, label: 'Active Courses', value: '24', change: '+3', changeType: 'up', color: 'emerald' },
    { icon: FiAward, label: 'Avg GPA', value: '3.2', change: '+0.15', changeType: 'up', color: 'amber' },
    { icon: FiClock, label: 'Avg Attendance', value: '86%', change: '+2.1%', changeType: 'up', color: 'purple' },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 rounded-2xl p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white font-heading">Analytics</h1>
            <p className="text-indigo-200 mt-1">Class-level performance insights and metrics</p>
          </div>
          <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white text-sm hover:bg-white/20 transition-colors">
            <FiDownload size={16} /> Export Report
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-[#0F172A] border border-white/[0.06] rounded-2xl p-5 hover:border-white/[0.12] transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-xl bg-${s.color}-500/10`}>
                <s.icon className={`text-${s.color}-400`} size={20} />
              </div>
              <div className={`flex items-center gap-0.5 text-xs font-medium ${s.changeType === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {s.changeType === 'up' ? <FiArrowUp size={12} /> : <FiArrowDown size={12} />}
                {s.change}
              </div>
            </div>
            <div className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">{s.label}</div>
            <div className="text-2xl font-bold text-white font-heading">{s.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#0F172A] border border-white/[0.06] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <FiBarChart2 className="text-indigo-400" size={16} /> Grade Distribution
            </h2>
            <span className="text-xs text-slate-500">All classes</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={gradeData} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="grade" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.05)' }} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip {...chartTooltipStyle} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {gradeData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-[#0F172A] border border-white/[0.06] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <FiTrendingUp className="text-emerald-400" size={16} /> Attendance Trends
            </h2>
            <span className="text-xs text-slate-500">Target: 83%</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={attendanceTrend}>
              <defs>
                <linearGradient id="attendanceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.05)' }} tickLine={false} />
              <YAxis domain={[70, 100]} tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip {...chartTooltipStyle} />
              <Area type="monotone" dataKey="target" stroke="#64748B" strokeWidth={1.5} strokeDasharray="6 3" fill="none" />
              <Area type="monotone" dataKey="rate" stroke="#10B981" strokeWidth={2.5} fill="url(#attendanceGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[#0F172A] border border-white/[0.06] rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
            <FiBarChart2 className="text-indigo-400" size={16} /> Subject-wise Performance
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={subjectData} layout="vertical" barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} width={80} />
              <Tooltip {...chartTooltipStyle} />
              <Bar dataKey="average" fill="#6366F1" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-[#0F172A] border border-white/[0.06] rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
            <FiTrendingUp className="text-emerald-400" size={16} /> Course Performance
          </h2>
          <div className="space-y-4">
            {coursePerformance.map((c, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 w-5">{i + 1}</span>
                    <span className="text-sm text-slate-300">{c.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-500">{c.students} students</span>
                    <span className={`font-medium ${c.score >= 80 ? 'text-emerald-400' : c.score >= 70 ? 'text-amber-400' : 'text-rose-400'}`}>
                      {c.score}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-white/[0.06] rounded-full h-1.5 ml-7">
                  <div className={`h-1.5 rounded-full ${
                    c.score >= 80 ? 'bg-emerald-500' : c.score >= 70 ? 'bg-amber-500' : 'bg-rose-500'
                  }`} style={{ width: `${c.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-[#0F172A] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/[0.06]">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <FiUsers className="text-indigo-400" size={16} /> Student Performance Overview
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="p-3 text-left text-xs text-slate-500 font-medium uppercase tracking-wider pl-5">Student</th>
                <th className="p-3 text-left text-xs text-slate-500 font-medium uppercase tracking-wider">Class</th>
                <th className="p-3 text-left text-xs text-slate-500 font-medium uppercase tracking-wider">GPA</th>
                <th className="p-3 text-left text-xs text-slate-500 font-medium uppercase tracking-wider">Attendance</th>
                <th className="p-3 text-left text-xs text-slate-500 font-medium uppercase tracking-wider">Trend</th>
                <th className="p-3 text-left text-xs text-slate-500 font-medium uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {studentPerformance.map((s, i) => (
                <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="p-3 pl-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                        <span className="text-xs text-indigo-400 font-bold">{s.name.split(' ').map(n => n[0]).join('')}</span>
                      </div>
                      <span className="text-sm text-white">{s.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-slate-400">{s.class}</td>
                  <td className="p-3">
                    <span className="text-sm font-medium text-white">{s.gpa}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-white/[0.06] rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${s.attendance >= 80 ? 'bg-emerald-500' : s.attendance >= 70 ? 'bg-amber-500' : 'bg-rose-500'}`}
                          style={{ width: `${s.attendance}%` }} />
                      </div>
                      <span className={`text-xs font-medium ${s.attendance >= 80 ? 'text-emerald-400' : s.attendance >= 70 ? 'text-amber-400' : 'text-rose-400'}`}>
                        {s.attendance}%
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    {s.trend === 'up' ? (
                      <FiArrowUp className="text-emerald-400" size={16} />
                    ) : s.trend === 'down' ? (
                      <FiArrowDown className="text-rose-400" size={16} />
                    ) : (
                      <FiTrendingUp className="text-slate-500" size={16} />
                    )}
                  </td>
                  <td className="p-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      s.gpa >= 3.5 ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
                      s.gpa >= 2.5 ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' :
                      'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                    }`}>
                      {s.gpa >= 3.5 ? 'Excellent' : s.gpa >= 2.5 ? 'Average' : 'At Risk'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;
