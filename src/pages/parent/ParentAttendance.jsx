import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import API from '../../api/client';
import { FiCalendar, FiCheckCircle, FiXCircle, FiClock, FiTrendingUp, FiUsers } from 'react-icons/fi';
import { StatsSkeleton, ListSkeleton } from '../../components/shared/LoadingSkeleton';

const STATUS_STYLES = {
  present: 'bg-emerald-500/10 text-emerald-400',
  absent: 'bg-rose-500/10 text-rose-400',
  late: 'bg-amber-500/10 text-amber-500',
  leave: 'bg-violet-500/10 text-violet-400',
  holiday: 'bg-slate-500/10 theme-text-muted',
};

const STATUS_LABELS = {
  present: 'Present',
  absent: 'Absent',
  late: 'Late',
  leave: 'Leave',
  holiday: 'Holiday',
};

const monthKey = (dateStr) => {
  if (!dateStr) return '';
  const dt = new Date(dateStr);
  if (Number.isNaN(dt.getTime())) return '';
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
};

export default function ParentAttendance() {
  const [students, setStudents] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [stats, setStats] = useState(null);
  const [records, setRecords] = useState([]);
  const [month, setMonth] = useState('all');
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    API.get('/parents/dashboard')
      .then(({ data }) => {
        const list = data?.students || [];
        setStudents(list);
        if (list.length > 0) setSelectedId(list[0].id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setLoadingData(true);
    Promise.all([
      API.get(`/attendance/stats/${selectedId}`),
      API.get(`/attendance/student/${selectedId}`),
    ])
      .then(([statsRes, recordsRes]) => {
        setStats(statsRes.data?.stats || null);
        setRecords(recordsRes.data?.records || []);
        setMonth('all');
      })
      .catch(() => {})
      .finally(() => setLoadingData(false));
  }, [selectedId]);

  const months = [...new Set(records.map((r) => monthKey(r.date)).filter(Boolean))].sort().reverse();

  const filteredRecords =
    month === 'all' ? records : records.filter((r) => monthKey(r.date) === month);

  const statCards = [
    { label: 'Present', value: stats?.present ?? 0, icon: FiCheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Absent', value: stats?.absent ?? 0, icon: FiXCircle, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { label: 'Late', value: stats?.late ?? 0, icon: FiClock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Total', value: stats?.total ?? 0, icon: FiCalendar, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { label: 'Rate', value: stats?.rate != null ? `${stats.rate}%` : 'N/A', icon: FiTrendingUp, color: 'text-violet-500', bg: 'bg-violet-500/10' },
  ];

  if (loading) return <StatsSkeleton />;

  if (students.length === 0) {
    return (
      <div className="theme-card rounded-2xl p-12 text-center card-shadow">
        <FiUsers className="mx-auto theme-text-muted mb-3" size={40} />
        <p className="theme-text-muted text-lg">No students linked</p>
        <p className="theme-text-muted text-sm mt-1">Contact the administration to link a student profile.</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="gradient-hero rounded-2xl p-6 lg:p-8 relative overflow-hidden">
        <div className="relative">
          <h1 className="text-2xl lg:text-3xl font-bold theme-text font-heading">Attendance</h1>
          <p className="theme-text mt-1">Track your child's attendance records</p>
        </div>
      </div>

      {students.length > 1 && (
        <div className="theme-card rounded-2xl p-5 card-shadow">
          <label className="block text-xs theme-text-muted font-medium mb-1.5">Student</label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full max-w-sm theme-card border theme-border rounded-xl px-3.5 py-2.5 text-sm theme-text focus:outline-none focus:border-indigo-500/50 transition-colors"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.name} • Class {s.class} • Roll {s.rollNumber}</option>
            ))}
          </select>
        </div>
      )}

      {selectedId && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {statCards.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="theme-card rounded-2xl p-4 card-shadow-premium"
              >
                <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center mb-2`}>
                  <stat.icon size={18} className={stat.color} />
                </div>
                <p className="text-xl font-bold theme-text">{stat.value}</p>
                <p className="text-xs theme-text-muted mt-0.5">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="theme-card rounded-2xl p-5 card-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-card-subtitle theme-text">Attendance Records</h2>
              {months.length > 0 && (
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="theme-card border theme-border rounded-xl px-3 py-2 text-sm theme-text focus:outline-none focus:border-indigo-500/50 transition-colors"
                >
                  <option value="all">All months</option>
                  {months.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              )}
            </div>

            {loadingData ? (
              <ListSkeleton count={4} />
            ) : filteredRecords.length === 0 ? (
              <p className="text-sm theme-text-muted text-center py-8">No attendance records found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b theme-border">
                      <th className="p-3 text-left text-xs theme-text-muted font-medium uppercase tracking-wider">Date</th>
                      <th className="p-3 text-left text-xs theme-text-muted font-medium uppercase tracking-wider">Status</th>
                      <th className="p-3 text-left text-xs theme-text-muted font-medium uppercase tracking-wider">Remark</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((r) => (
                      <tr key={r.id} className="border-b theme-border hover:theme-subtle transition-colors">
                        <td className="p-3 text-sm theme-text">
                          {r.date ? new Date(r.date).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="p-3">
                          <span className={`text-xs px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[r.status] || 'theme-text-muted'}`}>
                            {STATUS_LABELS[r.status] || r.status || 'N/A'}
                          </span>
                        </td>
                        <td className="p-3 text-sm theme-text-muted">{r.remark || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}
