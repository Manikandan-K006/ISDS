import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiAlertCircle, FiRefreshCw, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useStudentData } from '../../hooks/useStudentData';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, parseISO } from 'date-fns';
import { Card, Button } from '../../components/ui';
import { PageSkeleton } from '../../components/shared/LoadingSkeleton';

const dotColors = {
  present: 'bg-emerald-400',
  absent: 'bg-rose-400',
  leave: 'bg-amber-400',
  holiday: 'bg-slate-600',
};

const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const Attendance = () => {
  const { attendance, loading, error, refetch } = useStudentData();
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

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
  const percentage = nonHoliday.length > 0 ? Math.round((present / nonHoliday.length) * 100) : 0;

  const getStatus = (dateStr) => {
    const record = attendance.find(a => a.date === dateStr);
    return record ? record.status : null;
  };

  const isToday = (day) => format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  if (loading) return <PageSkeleton />;

  if (error) {
    return (
      <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-8 text-center">
        <FiAlertCircle className="mx-auto text-rose-400 mb-3" size={40} />
        <p className="text-rose-300 font-medium mb-2">Failed to load attendance</p>
        <p className="text-rose-400/70 text-sm mb-4">{error}</p>
        <Button variant="secondary" icon={FiRefreshCw} onClick={refetch}>Retry</Button>
      </div>
    );
  }

  const percentageColor = percentage >= 85 ? 'text-emerald-400' : percentage >= 75 ? 'text-indigo-400' : percentage >= 60 ? 'text-amber-400' : 'text-rose-400';

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold theme-text">Attendance</h1>
        <p className="text-sm theme-text-muted">Track your attendance record</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex flex-col items-center justify-center">
          <p className={`text-4xl font-bold ${percentageColor}`}>{percentage}%</p>
          <p className="text-xs theme-text-muted mt-1">This Month</p>
        </Card>
        {[
          { label: 'Present', value: present, color: 'text-emerald-400', dot: 'bg-emerald-400' },
          { label: 'Absent', value: absent, color: 'text-rose-400', dot: 'bg-rose-400' },
          { label: 'Leave', value: leave, color: 'text-amber-400', dot: 'bg-amber-400' },
        ].map(stat => (
          <Card key={stat.label} className="p-5 flex items-center gap-3">
            <span className={`w-3 h-3 rounded-full ${stat.dot}`} />
            <div>
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs theme-text-muted">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4 lg:p-6">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" icon={FiChevronLeft} onClick={prevMonth} />
          <h2 className="text-sm font-semibold theme-text">{format(currentMonth, 'MMMM yyyy')}</h2>
          <Button variant="ghost" size="sm" icon={FiChevronRight} onClick={nextMonth} />
        </div>

        <div className="grid grid-cols-7 mb-2">
          {DAY_ABBR.map(d => (
            <div key={d} className="text-center text-[11px] theme-text-muted py-1 font-medium">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, i) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const status = getStatus(dateStr);
            const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
            const today = isToday(day);

            return (
              <div
                key={i}
                className={`aspect-square rounded-xl text-xs font-medium flex flex-col items-center justify-center relative
                  ${!isCurrentMonth ? 'opacity-20' : 'theme-text-muted'}
                  ${today ? 'ring-1 ring-indigo-500' : ''}`}
              >
                <span>{format(day, 'd')}</span>
                {status && <span className={`w-1 h-1 rounded-full mt-0.5 ${dotColors[status]}`} />}
              </div>
            );
          })}
        </div>
      </Card>

      <div className="flex flex-wrap gap-5 justify-center">
        {[
          { label: 'Present', dot: 'bg-emerald-400' },
          { label: 'Absent', dot: 'bg-rose-400' },
          { label: 'Leave', dot: 'bg-amber-400' },
          { label: 'Holiday', dot: 'bg-slate-600' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-2 text-xs theme-text-muted">
            <span className={`w-2 h-2 rounded-full ${item.dot}`} />
            {item.label}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default Attendance;
