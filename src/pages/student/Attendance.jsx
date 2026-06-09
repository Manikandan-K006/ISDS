import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCalendar, FiAlertCircle, FiInfo, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useStudentData } from '../../hooks/useStudentData';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

const cellStyles = {
  present: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  absent: 'bg-rose-500/15 text-rose-300 border-rose-500/20',
  leave: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
  holiday: 'bg-white/[0.03] text-slate-600 border-white/[0.04]',
};

const dotColors = {
  present: 'bg-emerald-400',
  absent: 'bg-rose-400',
  leave: 'bg-amber-400',
  holiday: 'bg-slate-600',
};

const Attendance = () => {
  const { attendance, loading, error } = useStudentData();
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 4));
  const [selectedDay, setSelectedDay] = useState(null);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      <span className="ml-3 text-slate-400">Loading...</span>
    </div>
  );

  if (error) return (
    <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-rose-400 text-sm">
      Failed to load data: {error}
    </div>
  );

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const total = attendance.filter(a => a.status !== 'holiday').length;
  const present = attendance.filter(a => a.status === 'present').length;
  const absent = attendance.filter(a => a.status === 'absent').length;
  const leave = attendance.filter(a => a.status === 'leave').length;
  const holiday = attendance.filter(a => a.status === 'holiday').length;
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

  const getStatus = (dateStr) => {
    const record = attendance.find(a => a.date === dateStr);
    return record ? record.status : null;
  };

  const statusLevel = percentage >= 85 ? 'Good' : percentage >= 70 ? 'Average' : 'Poor';
  const statusRing = percentage >= 85 ? 'stroke-emerald-400' : percentage >= 70 ? 'stroke-amber-400' : 'stroke-rose-400';

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

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#0F172A] rounded-2xl border border-white/[0.06] p-5 lg:col-span-1 flex flex-col items-center justify-center"
        >
          <div className="relative w-24 h-24 mb-3">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="42" fill="none"
                className={statusRing}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(percentage / 100) * 264} 264`}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white">
              {percentage}%
            </span>
          </div>
          <div className={`text-sm font-medium ${
            percentage >= 85 ? 'text-emerald-400' : percentage >= 70 ? 'text-amber-400' : 'text-rose-400'
          }`}>{statusLevel}</div>
        </motion.div>

        {[
          { label: 'Present', value: present, color: 'text-emerald-400', delay: 0.05 },
          { label: 'Absent', value: absent, color: 'text-rose-400', delay: 0.1 },
          { label: 'Leave', value: leave, color: 'text-amber-400', delay: 0.15 },
          { label: 'Holiday', value: holiday, color: 'text-slate-400', delay: 0.2 },
        ].map(stat => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: stat.delay }}
            className="bg-[#0F172A] rounded-2xl border border-white/[0.06] p-4 flex flex-col items-center justify-center"
          >
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0F172A] rounded-2xl border border-white/[0.06] p-4 lg:p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center hover:bg-white/[0.08] transition-colors"
          >
            <FiChevronLeft className="text-slate-400" size={16} />
          </button>
          <h2 className="text-sm font-semibold text-white">{format(currentMonth, 'MMMM yyyy')}</h2>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center hover:bg-white/[0.08] transition-colors"
          >
            <FiChevronRight className="text-slate-400" size={16} />
          </button>
        </div>

        <div className="grid grid-cols-7 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-xs text-slate-500 py-1">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, i) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const status = getStatus(dateStr);
            const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
            const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

            return (
              <button
                key={i}
                onClick={() => {
                  if (status && status !== 'present') {
                    const record = attendance.find(a => a.date === dateStr);
                    if (record) setSelectedDay(record);
                  }
                }}
                disabled={!status}
                className={`aspect-square rounded-xl text-xs font-medium transition-all flex flex-col items-center justify-center ${
                  !isCurrentMonth ? 'opacity-20' : ''
                } ${
                  status ? `${cellStyles[status]} cursor-pointer hover:scale-110` : 'text-slate-700'
                } ${isToday ? 'ring-2 ring-indigo-500/40' : ''}`}
              >
                <span>{format(day, 'd')}</span>
                {status && <span className={`w-1 h-1 rounded-full mt-0.5 ${dotColors[status]}`} />}
              </button>
            );
          })}
        </div>
      </motion.div>

      <div className="flex flex-wrap gap-4 justify-center">
        {[
          { label: 'Present', dot: 'bg-emerald-400' },
          { label: 'Absent', dot: 'bg-rose-400' },
          { label: 'Leave', dot: 'bg-amber-400' },
          { label: 'Holiday', dot: 'bg-slate-600' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className={`w-2 h-2 rounded-full ${item.dot}`} />
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
                  <p className="text-sm text-slate-400">Reason: {selectedDay.reason}</p>
                )}
                {selectedDay.teacherNote && (
                  <div className="bg-white/[0.04] rounded-xl px-4 py-3">
                    <p className="text-xs text-slate-500 mb-1">Teacher's Note</p>
                    <p className="text-sm text-slate-300">{selectedDay.teacherNote}</p>
                  </div>
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
