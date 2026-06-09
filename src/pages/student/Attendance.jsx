import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCalendar, FiAlertCircle, FiInfo, FiChevronLeft, FiChevronRight,
  FiRefreshCw, FiTrendingUp
} from 'react-icons/fi';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { useStudentData } from '../../hooks/useStudentData';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, parseISO, getDay } from 'date-fns';
import { PageSkeleton } from '../../components/shared/LoadingSkeleton';

const cellStyles = {
  present: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20',
  absent: 'bg-rose-500/20 text-rose-400 border-rose-500/20',
  leave: 'bg-amber-500/20 text-amber-400 border-amber-500/20',
  holiday: 'bg-slate-500/10 text-slate-600 border-slate-500/10',
};

const dotColors = {
  present: 'bg-emerald-400',
  absent: 'bg-rose-400',
  leave: 'bg-amber-400',
  holiday: 'bg-slate-600',
};

const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1E293B]/90 backdrop-blur-xl border border-white/[0.12] rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-sm text-white font-semibold">{payload[0].value}% attendance</p>
    </div>
  );
};

const Attendance = () => {
  const { attendance, loading, error, refetch } = useStudentData();
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date(2026, 4, 1);
    return now;
  });
  const [selectedDay, setSelectedDay] = useState(null);

  const monthStart = useMemo(() => startOfMonth(currentMonth), [currentMonth]);
  const monthEnd = useMemo(() => endOfMonth(currentMonth), [currentMonth]);
  const calStart = useMemo(() => startOfWeek(monthStart), [monthStart]);
  const calEnd = useMemo(() => endOfWeek(monthEnd), [monthEnd]);
  const days = useMemo(() => eachDayOfInterval({ start: calStart, end: calEnd }), [calStart, calEnd]);

  const monthAttendance = useMemo(
    () => attendance.filter(a => {
      const d = parseISO(a.date);
      return d >= monthStart && d <= monthEnd;
    }),
    [attendance, monthStart, monthEnd]
  );

  const nonHoliday = useMemo(() => monthAttendance.filter(a => a.status !== 'holiday'), [monthAttendance]);
  const present = useMemo(() => monthAttendance.filter(a => a.status === 'present').length, [monthAttendance]);
  const absent = useMemo(() => monthAttendance.filter(a => a.status === 'absent').length, [monthAttendance]);
  const leave = useMemo(() => monthAttendance.filter(a => a.status === 'leave').length, [monthAttendance]);
  const holiday = useMemo(() => monthAttendance.filter(a => a.status === 'holiday').length, [monthAttendance]);
  const percentage = nonHoliday.length > 0 ? Math.round((present / nonHoliday.length) * 100) : 0;

  const chartData = useMemo(() => {
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    return daysInMonth.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const rec = attendance.find(a => a.date === dateStr);
      let value = null;
      if (rec) {
        if (rec.status === 'present') value = 100;
        else if (rec.status === 'absent') value = 0;
        else if (rec.status === 'leave') value = 50;
      }
      return {
        date: format(day, 'MMM dd'),
        value,
        status: rec?.status || null,
      };
    });
  }, [attendance, monthStart, monthEnd]);

  const getStatus = (dateStr) => {
    const record = attendance.find(a => a.date === dateStr);
    return record ? record.status : null;
  };

  const getRecord = (dateStr) => attendance.find(a => a.date === dateStr);

  const isToday = (day) => format(day, 'yyyy-MM-dd') === format(new Date(2026, 5, 9), 'yyyy-MM-dd');

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const statusLevel = percentage >= 85 ? 'Excellent' : percentage >= 75 ? 'Good' : percentage >= 60 ? 'Average' : 'Poor';
  const statusRing = percentage >= 85 ? '#34D399' : percentage >= 75 ? '#818CF8' : percentage >= 60 ? '#FBBF24' : '#FB7185';

  const ringColor = percentage >= 85 ? 'stroke-emerald-400' : percentage >= 75 ? 'stroke-indigo-400' : percentage >= 60 ? 'stroke-amber-400' : 'stroke-rose-400';
  const textColor = percentage >= 85 ? 'text-emerald-400' : percentage >= 75 ? 'text-indigo-400' : percentage >= 60 ? 'text-amber-400' : 'text-rose-400';

  if (loading) return <PageSkeleton />;

  if (error) return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-8 text-center"
    >
      <FiAlertCircle className="mx-auto text-rose-400 mb-3" size={40} />
      <p className="text-rose-300 font-medium mb-2">Failed to load attendance</p>
      <p className="text-rose-400/70 text-sm mb-4">{error}</p>
      <button
        onClick={refetch}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm font-medium hover:bg-rose-500/20 transition-colors"
      >
        <FiRefreshCw size={14} /> Retry
      </button>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0F172A] rounded-2xl p-6 lg:p-8 border border-white/[0.06]"
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Attendance</h1>
        <p className="text-slate-400 mt-1">Track your attendance record</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#0F172A] rounded-2xl border border-white/[0.06] p-6 flex flex-col items-center justify-center"
        >
          <div className="relative w-28 h-28 mb-3">
            <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
              <circle
                cx="50" cy="50" r="42" fill="none"
                className={ringColor}
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={`${(percentage / 100) * 264} 264`}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-white">
              {percentage}%
            </span>
          </div>
          <span className={`text-sm font-semibold ${textColor}`}>{statusLevel}</span>
          <span className="text-xs text-slate-500 mt-1">This month</span>
        </motion.div>

        {[
          { label: 'Present', value: present, color: 'text-emerald-400', bg: 'bg-emerald-500/10', iconBg: 'bg-emerald-500/20', delay: 0.05 },
          { label: 'Absent', value: absent, color: 'text-rose-400', bg: 'bg-rose-500/10', iconBg: 'bg-rose-500/20', delay: 0.1 },
          { label: 'Leave', value: leave, color: 'text-amber-400', bg: 'bg-amber-500/10', iconBg: 'bg-amber-500/20', delay: 0.15 },
        ].map(stat => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: stat.delay }}
            className="bg-[#0F172A] rounded-2xl border border-white/[0.06] p-5 flex items-center gap-4"
          >
            <div className={`w-12 h-12 rounded-xl ${stat.iconBg} flex items-center justify-center shrink-0`}>
              <FiCalendar className={stat.color} size={20} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-slate-400">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0F172A] rounded-2xl border border-white/[0.06] p-4 lg:p-6 lg:col-span-3"
        >
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevMonth}
              className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center hover:bg-white/[0.08] transition-colors"
            >
              <FiChevronLeft className="text-slate-400" size={16} />
            </button>
            <h2 className="text-sm font-semibold text-white">{format(currentMonth, 'MMMM yyyy')}</h2>
            <button
              onClick={nextMonth}
              className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center hover:bg-white/[0.08] transition-colors"
            >
              <FiChevronRight className="text-slate-400" size={16} />
            </button>
          </div>

          <div className="grid grid-cols-7 mb-2">
            {DAY_ABBR.map(d => (
              <div key={d} className="text-center text-[11px] text-slate-500 py-1 font-medium">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const status = getStatus(dateStr);
              const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
              const today = isToday(day);

              return (
                <button
                  key={i}
                  onClick={() => {
                    if (status && status !== 'present') {
                      const record = getRecord(dateStr);
                      if (record && (record.reason || record.teacherNote)) setSelectedDay(record);
                    }
                  }}
                  disabled={!status}
                  className={`aspect-square rounded-xl text-xs font-medium transition-all flex flex-col items-center justify-center relative ${
                    !isCurrentMonth ? 'opacity-20' : ''
                  } ${
                    status ? `${cellStyles[status]} cursor-pointer hover:scale-105` : 'text-slate-700'
                  } ${today ? 'ring-2 ring-indigo-500' : ''}`}
                >
                  <span>{format(day, 'd')}</span>
                  {status && <span className={`w-1 h-1 rounded-full mt-0.5 ${dotColors[status]}`} />}
                </button>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-[#0F172A] rounded-2xl border border-white/[0.06] p-4 lg:p-6 lg:col-span-2"
        >
          <div className="flex items-center gap-2 mb-4">
            <FiTrendingUp className="text-indigo-400" size={16} />
            <h3 className="text-sm font-semibold text-white">Daily Trend</h3>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#64748B', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: '#64748B', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#818CF8"
                  strokeWidth={2}
                  dot={(props) => {
                    const { cx, cy, payload } = props;
                    if (payload.value === null) return null;
                    let fill = '#818CF8';
                    if (payload.status === 'present') fill = '#34D399';
                    else if (payload.status === 'absent') fill = '#FB7185';
                    else if (payload.status === 'leave') fill = '#FBBF24';
                    return (
                      <circle key={payload.date} cx={cx} cy={cy} r={3} fill={fill} stroke="#0F172A" strokeWidth={1.5} />
                    );
                  }}
                  activeDot={{ r: 5, fill: '#818CF8', stroke: '#0F172A', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="flex flex-wrap gap-5 justify-center">
        {[
          { label: 'Present', dot: 'bg-emerald-400' },
          { label: 'Absent', dot: 'bg-rose-400' },
          { label: 'Leave', dot: 'bg-amber-400' },
          { label: 'Holiday', dot: 'bg-slate-600' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-2 text-xs text-slate-400">
            <span className={`w-2.5 h-2.5 rounded-full ${item.dot}`} />
            {item.label}
          </div>
        ))}
      </div>

      <AnimatePresence>
        {selectedDay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedDay(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#0F172A] rounded-2xl border border-white/[0.06] p-6 max-w-sm w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Day Details</h3>
                <button
                  onClick={() => setSelectedDay(null)}
                  className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center hover:bg-white/[0.08]"
                >
                  <FiInfo className="text-slate-400" size={16} />
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <FiCalendar className="text-slate-500" size={16} />
                  <span className="text-white">{selectedDay.date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FiAlertCircle className="text-slate-500" size={16} />
                  <span className={`capitalize font-medium ${
                    selectedDay.status === 'absent' ? 'text-rose-400' : 'text-amber-400'
                  }`}>{selectedDay.status}</span>
                </div>
                {selectedDay.reason && (
                  <div className="bg-white/[0.04] rounded-xl px-4 py-3">
                    <p className="text-xs text-slate-500 mb-1">Reason</p>
                    <p className="text-sm text-slate-300">{selectedDay.reason}</p>
                  </div>
                )}
                {selectedDay.teacherNote && (
                  <div className="bg-white/[0.04] rounded-xl px-4 py-3">
                    <p className="text-xs text-slate-500 mb-1">Teacher's Note</p>
                    <p className="text-sm text-slate-300">{selectedDay.teacherNote}</p>
                  </div>
                )}
                {!selectedDay.reason && !selectedDay.teacherNote && (
                  <p className="text-sm text-slate-500">No additional details available.</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Attendance;
