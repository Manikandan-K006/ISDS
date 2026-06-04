import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiBookOpen, FiAlertTriangle, FiClipboard, FiTrendingUp, FiMessageSquare } from 'react-icons/fi';
import StatCard from '../../components/shared/StatCard';
import ParticipationHeatmap from '../../components/charts/ParticipationHeatmap';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const stats = [
    { icon: FiUsers, label: 'Total Students', value: '428', trend: 'up', trendValue: '+12 this month', color: 'indigo' },
    { icon: FiBookOpen, label: 'Active Courses', value: '24', trend: 'up', trendValue: '+3', color: 'emerald' },
    { icon: FiAlertTriangle, label: 'At-Risk Students', value: '18', trend: 'down', trendValue: '4.2%', color: 'rose' },
    { icon: FiClipboard, label: 'Upcoming Assignments', value: '9', trend: 'up', trendValue: '+2', color: 'amber' },
  ];

  const heatmapData = {
    Mon: [80, 85, 75, 90, 70, 60, 85, 80],
    Tue: [85, 90, 70, 85, 75, 65, 80, 75],
    Wed: [75, 80, 85, 70, 80, 70, 90, 85],
    Thu: [90, 85, 80, 75, 85, 75, 70, 80],
    Fri: [70, 75, 90, 80, 60, 80, 75, 70],
  };

  const topPerformers = [
    { name: 'Arjun Sharma', class: '10A', gpa: 3.8, attendance: 95 },
    { name: 'Priya Patel', class: '10A', gpa: 3.7, attendance: 92 },
    { name: 'Rahul Singh', class: '10B', gpa: 3.6, attendance: 90 },
    { name: 'Ananya Gupta', class: '9A', gpa: 3.9, attendance: 98 },
  ];

  const atRisk = [
    { name: 'Vikram Joshi', class: '10B', attendance: 62, reason: 'Low attendance' },
    { name: 'Neha Kapoor', class: '9A', attendance: 68, reason: 'Missing assignments' },
    { name: 'Rohit Kumar', class: '11A', attendance: 58, reason: 'Multiple absences' },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="gradient-hero rounded-2xl p-6 lg:p-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-white font-heading">Admin Dashboard</h1>
        <p className="text-slate-300 mt-1">School overview and management</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <StatCard key={i} icon={s.icon} label={s.label} value={s.value} trend={s.trend} trendValue={s.trendValue} color={s.color} variant="gradient" />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <ParticipationHeatmap data={heatmapData} />

          <div className="glass rounded-xl p-5">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FiTrendingUp className="text-emerald-400" /> Top Performers This Month
            </h2>
            <div className="space-y-3">
              {topPerformers.map((s, i) => (
                <div key={i} onClick={() => navigate('/admin/students')} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      i === 0 ? 'bg-amber-500/20 text-amber-400' : i === 1 ? 'bg-slate-400/20 text-slate-400' : i === 2 ? 'bg-amber-700/20 text-amber-700' : 'bg-indigo-500/20 text-indigo-400'
                    }`}>
                      #{i + 1}
                    </div>
                    <div>
                      <p className="text-sm text-white">{s.name}</p>
                      <p className="text-xs text-slate-500">{s.class}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs">
                    <span className="text-emerald-400">GPA: {s.gpa}</span>
                    <span className="text-indigo-400">{s.attendance}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass rounded-xl p-5 border border-rose-500/20">
            <h2 className="text-lg font-semibold text-rose-400 mb-4 flex items-center gap-2">
              <FiAlertTriangle size={18} /> At-Risk Students
            </h2>
            <div className="space-y-3">
              {atRisk.map((s, i) => (
                <div key={i} className="p-3 rounded-lg bg-rose-500/5 border border-rose-500/10">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white">{s.name}</span>
                    <span className="text-xs text-rose-400">{s.attendance}%</span>
                  </div>
                  <p className="text-xs text-slate-500">{s.reason}</p>
                  <button onClick={() => navigate('/admin/calls')} className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                    <FiMessageSquare size={12} /> Contact
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-xl p-5">
            <h2 className="text-sm font-semibold text-white mb-3">Quick Actions</h2>
            <div className="space-y-2">
              <button onClick={() => navigate('/admin/courses')} className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5 transition-colors">
                Add New Course
              </button>
              <button onClick={() => navigate('/admin/assignments')} className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5 transition-colors">
                Manage Assignments
              </button>
              <button onClick={() => navigate('/admin/students')} className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5 transition-colors">
                View All Students
              </button>
              <button onClick={() => navigate('/admin/calls')} className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5 transition-colors">
                Contact Parents
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
