import { useState } from 'react';
import { motion } from 'framer-motion';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay } from 'date-fns';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const AttendanceCalendar = ({ attendanceData, onDayClick }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getStatus = (day) => {
    const record = attendanceData?.find(a => isSameDay(new Date(a.date), day));
    return record?.status || null;
  };

  const statusColors = {
    present: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    absent: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    leave: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    holiday: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  };

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">{format(currentMonth, 'MMMM yyyy')}</h3>
        <div className="flex gap-1">
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400">
            <FiChevronLeft size={18} />
          </button>
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400">
            <FiChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="text-center text-xs text-slate-500 py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: monthStart.getDay() }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map(day => {
          const status = getStatus(day);
          const isSelected = selectedDay && isSameDay(day, selectedDay);
          return (
            <motion.button
              key={day.toISOString()}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setSelectedDay(day);
                if (onDayClick && status) onDayClick({ date: day, status });
              }}
              className={`aspect-square rounded-lg text-xs font-medium border transition-all ${
                isSelected ? 'ring-2 ring-indigo-500' : ''
              } ${status ? statusColors[status] : 'text-slate-600 hover:bg-white/5'}`}
            >
              {format(day, 'd')}
            </motion.button>
          );
        })}
      </div>

      <div className="flex gap-4 mt-4 text-xs text-slate-400">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500/40" /> Present</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-rose-500/40" /> Absent</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-500/40" /> Leave</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-slate-500/30" /> Holiday</span>
      </div>
    </div>
  );
};

export default AttendanceCalendar;
