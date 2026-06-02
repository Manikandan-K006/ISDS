import { motion } from 'framer-motion';
import { FiBarChart2, FiDownload, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const subjectData = [
  { subject: 'Math', average: 78 },
  { subject: 'Physics', average: 72 },
  { subject: 'Chemistry', average: 68 },
  { subject: 'English', average: 82 },
  { subject: 'CS', average: 85 },
  { subject: 'History', average: 74 },
];

const attendanceTrend = [
  { month: 'Jan', rate: 85 }, { month: 'Feb', rate: 88 }, { month: 'Mar', rate: 82 },
  { month: 'Apr', rate: 90 }, { month: 'May', rate: 87 }, { month: 'Jun', rate: 84 },
];

const cocurricularData = [
  { name: 'Sports', value: 35 }, { name: 'Arts', value: 25 }, { name: 'Music', value: 15 },
  { name: 'Debate', value: 15 }, { name: 'Other', value: 10 },
];

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#F43F5E', '#64748B'];

const top5 = [
  { name: 'Ananya Gupta', gpa: 3.9, class: '9A' },
  { name: 'Sneha Reddy', gpa: 3.8, class: '10A' },
  { name: 'Priya Patel', gpa: 3.7, class: '10A' },
  { name: 'Arjun Sharma', gpa: 3.6, class: '10A' },
  { name: 'Rahul Singh', gpa: 3.6, class: '10B' },
];

const bottom5 = [
  { name: 'Rohit Kumar', gpa: 1.8, class: '11A' },
  { name: 'Vikram Joshi', gpa: 2.1, class: '10B' },
  { name: 'Neha Kapoor', gpa: 2.5, class: '9A' },
  { name: 'Amit Verma', gpa: 3.2, class: '9B' },
  { name: 'Kavita Sharma', gpa: 3.0, class: '11B' },
];

const Analytics = () => {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="gradient-hero rounded-2xl p-6 lg:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white font-heading">Analytics</h1>
            <p className="text-slate-300 mt-1">Class-level performance insights</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-colors">
            <FiDownload size={16} /> Export PDF
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><FiBarChart2 className="text-indigo-400" /> Subject-wise Average</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={subjectData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#94A3B8', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
              <Bar dataKey="average" fill="#6366F1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><FiTrendingUp className="text-emerald-400" /> Attendance Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={attendanceTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#94A3B8', fontSize: 12 }} />
              <YAxis domain={[60, 100]} tick={{ fill: '#94A3B8', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
              <Line type="monotone" dataKey="rate" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Co-curricular Participation</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={cocurricularData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                {cocurricularData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2">
            {cocurricularData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
                <span className="text-slate-400">{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass rounded-xl p-5 border border-emerald-500/10">
            <h2 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2"><FiTrendingUp size={16} /> Top 5 Performers</h2>
            <div className="space-y-2">
              {top5.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 w-4">#{i + 1}</span>
                    <span className="text-sm text-white">{s.name}</span>
                    <span className="text-xs text-slate-500">{s.class}</span>
                  </div>
                  <span className="text-sm font-medium text-emerald-400">{s.gpa}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="glass rounded-xl p-5 border border-rose-500/10">
            <h2 className="text-sm font-semibold text-rose-400 mb-3 flex items-center gap-2"><FiTrendingDown size={16} /> Bottom 5 Performers</h2>
            <div className="space-y-2">
              {bottom5.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 w-4">#{i + 1}</span>
                    <span className="text-sm text-white">{s.name}</span>
                    <span className="text-xs text-slate-500">{s.class}</span>
                  </div>
                  <span className="text-sm font-medium text-rose-400">{s.gpa}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
