import { useState, useEffect } from 'react';
import { FiUsers, FiLayers, FiTrendingUp, FiCheckCircle, FiActivity, FiArrowRight } from 'react-icons/fi';
import {
  AreaChart, Area, BarChart, Bar,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import API from '../../api/client';
import { KpiCard } from '../../components/ui';
import { PageSkeleton } from '../../components/shared/LoadingSkeleton';

const enrollmentTrend = [
  { month: 'Jan', students: 320 }, { month: 'Feb', students: 345 },
  { month: 'Mar', students: 360 }, { month: 'Apr', students: 380 },
  { month: 'May', students: 410 }, { month: 'Jun', students: 428 },
  { month: 'Jul', students: 445 }, { month: 'Aug', students: 470 },
  { month: 'Sep', students: 490 }, { month: 'Oct', students: 510 },
  { month: 'Nov', students: 525 }, { month: 'Dec', students: 540 },
];

const courseDist = [
  { name: 'Engineering', count: 24 }, { name: 'Science', count: 18 },
  { name: 'Humanities', count: 14 }, { name: 'Arts', count: 10 },
  { name: 'Music', count: 7 },
];

const recentActivity = [
  { id: 1, action: 'Sarah Johnson enrolled in Advanced Mathematics', time: '2 min ago' },
  { id: 2, action: 'Physics 101 course published', time: '1 hour ago' },
  { id: 3, action: 'Attendance recorded for Grade 10A', time: '3 hours ago' },
  { id: 4, action: 'New student orientation completed', time: 'Today' },
  { id: 5, action: 'Semester reports generated', time: 'Today' },
];

const AdminDashboard = () => {
  const [data, setData] = useState({ students: [], courses: [], attendance: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin</h1>
        <p className="text-sm text-slate-500 mt-1">Dashboard overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={FiUsers} label="Total Students" value={totalStudents} color="indigo" trend={12} />
        <KpiCard icon={FiLayers} label="Total Courses" value={totalCourses} color="emerald" trend={8} />
        <KpiCard icon={FiTrendingUp} label="Avg Attendance" value={`${avgAttendance}%`} color="amber" trend={avgAttendance >= 75 ? 5 : -3} />
        <KpiCard icon={FiCheckCircle} label="Completion Rate" value={`${completionRate}%`} color="purple" trend={completionRate >= 50 ? 10 : -5} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0F172A] border border-white/[0.06] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-white">Enrollment Trend</h2>
            <span className="text-xs text-slate-500">Jan - Dec</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={enrollmentTrend} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="enrollmentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.05)' }} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', color: '#fff', fontSize: '13px' }} labelStyle={{ color: '#94A3B8' }} />
              <Area type="monotone" dataKey="students" stroke="#6366F1" strokeWidth={2} fill="url(#enrollmentGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#0F172A] border border-white/[0.06] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-white">Course Distribution</h2>
            <span className="text-xs text-slate-500">{courseDist.length} domains</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={courseDist} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.05)' }} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', color: '#fff', fontSize: '13px' }} labelStyle={{ color: '#94A3B8' }} />
              <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-[#0F172A] border border-white/[0.06] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <FiActivity className="text-indigo-400" size={16} /> Recent Activity
          </h2>
          <button className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
            View All <FiArrowRight size={12} />
          </button>
        </div>
        <div className="space-y-1">
          {recentActivity.map(a => (
            <div key={a.id} className="flex items-center gap-3 py-3 border-b border-white/[0.04] last:border-0">
              <div className="w-7 h-7 rounded-lg bg-white/[0.05] flex items-center justify-center flex-shrink-0">
                <FiActivity size={13} className="text-slate-500" />
              </div>
              <p className="text-sm text-slate-300 flex-1 truncate">{a.action}</p>
              <span className="text-xs text-slate-500 flex-shrink-0">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
