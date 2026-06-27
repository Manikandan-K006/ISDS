import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiClipboard, FiClock, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay, parseISO, getDay } from 'date-fns';
import { useStudentData } from '../../hooks/useStudentData';
import { Card } from '../../components/ui';
import { PageSkeleton } from '../../components/shared/LoadingSkeleton';

const Schedule = () => {
  const { assignments, attendance, loading } = useStudentData();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getAttendanceForDay = (day) => {
    return attendance.find(a => isSameDay(new Date(a.date), day));
  };

  const getAssignmentsForDay = (day) => {
    return assignments.filter(a => {
      if (!a.deadline) return false;
      try { return isSameDay(parseISO(a.deadline), day); }
      catch { return false; }
    });
  };

  const dayEvents = (day) => {
    const att = getAttendanceForDay(day);
    const assns = getAssignmentsForDay(day);
    return { attendance: att?.status || null, assignments: assns };
  };

  const selectedEvents = selectedDay ? dayEvents(selectedDay) : null;
  const todayEvents = dayEvents(new Date());

  const statusColors = {
    present: 'bg-emerald-500',
    absent: 'bg-rose-500',
    leave: 'bg-amber-500',
    holiday: 'bg-gray-400',
  };

  if (loading) return <PageSkeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold theme-text">Schedule</h1>
        <p className="text-sm theme-text-muted mt-1">Assignments & attendance calendar</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FiCalendar className="theme-text-muted" size={16} />
              <h2 className="text-sm font-semibold theme-text">{format(currentMonth, 'MMMM yyyy')}</h2>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-1.5 rounded-lg hover:theme-hover theme-text-muted transition-colors"><FiChevronLeft size={16} /></button>
              <button onClick={() => setCurrentMonth(new Date())} className="px-2 py-1 text-xs rounded-lg hover:theme-hover theme-text-muted transition-colors">Today</button>
              <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-1.5 rounded-lg hover:theme-hover theme-text-muted transition-colors"><FiChevronRight size={16} /></button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-xs theme-text-muted py-2">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-px">
            {Array.from({ length: getDay(monthStart) }).map((_, i) => (
              <div key={`e-${i}`} />
            ))}
            {days.map(day => {
              const events = dayEvents(day);
              const isToday = isSameDay(day, new Date());
              const isSelected = selectedDay && isSameDay(day, selectedDay);
              const hasDeadline = events.assignments.length > 0;
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDay(day)}
                  className={`relative min-h-[48px] p-1 rounded-lg text-xs transition-colors flex flex-col items-center ${
                    isSelected ? 'bg-indigo-500/10 ring-1 ring-indigo-500/50' :
                    isToday ? 'theme-subtle' : 'hover:theme-hover'
                  }`}
                >
                  <span className={`text-xs ${isToday ? 'font-bold text-indigo-400' : 'theme-text'}`}>{format(day, 'd')}</span>
                  <div className="flex gap-0.5 mt-0.5">
                    {events.attendance && <span className={`w-1.5 h-1.5 rounded-full ${statusColors[events.attendance] || ''}`} />}
                    {hasDeadline && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex gap-4 mt-4 pt-3 border-t theme-border text-xs theme-text-muted">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Present</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" /> Absent</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Leave</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-400" /> Deadline</span>
          </div>
        </Card>

        <div className="space-y-4">
          {selectedDay ? (
            <Card className="p-5">
              <h3 className="text-sm font-semibold theme-text mb-3">{format(selectedDay, 'EEEE, MMM d')}</h3>
              {selectedEvents?.attendance && (
                <div className="flex items-center gap-2 mb-3 text-sm">
                  <span className={`w-2.5 h-2.5 rounded-full ${statusColors[selectedEvents.attendance]}`} />
                  <span className="theme-text capitalize">{selectedEvents.attendance}</span>
                </div>
              )}
              {selectedEvents?.assignments.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs theme-text-muted font-medium">Assignment Deadlines</p>
                  {selectedEvents.assignments.map(a => (
                    <div key={a._id} className="flex items-start gap-2 p-2 rounded-lg theme-subtle">
                      <FiClipboard className="text-indigo-400 mt-0.5 shrink-0" size={13} />
                      <div>
                        <p className="text-xs theme-text font-medium">{a.title}</p>
                        <p className="text-[10px] theme-text-muted">{a.courseName || ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs theme-text-muted">No events this day</p>
              )}
              {!selectedEvents?.attendance && selectedEvents?.assignments.length === 0 && (
                <p className="text-xs theme-text-muted">No events this day</p>
              )}
            </Card>
          ) : (
            <Card className="p-5">
              <h3 className="text-sm font-semibold theme-text mb-3">Today</h3>
              <p className="text-xs theme-text-muted mb-1">{format(new Date(), 'EEEE, MMM d')}</p>
              {todayEvents.attendance && (
                <div className="flex items-center gap-2 mb-3 text-sm">
                  <span className={`w-2.5 h-2.5 rounded-full ${statusColors[todayEvents.attendance]}`} />
                  <span className="theme-text capitalize">{todayEvents.attendance}</span>
                </div>
              )}
              {todayEvents.assignments.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs theme-text-muted font-medium">Due today</p>
                  {todayEvents.assignments.map(a => (
                    <div key={a._id} className="flex items-start gap-2 p-2 rounded-lg bg-amber-500/10">
                      <FiClock className="text-amber-400 mt-0.5 shrink-0" size={13} />
                      <p className="text-xs theme-text">{a.title}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs theme-text-muted">No deadlines today</p>
              )}
              {!todayEvents.attendance && todayEvents.assignments.length === 0 && (
                <p className="text-xs theme-text-muted">No events today</p>
              )}
            </Card>
          )}

          <Card className="p-5">
            <h3 className="text-sm font-semibold theme-text mb-3 flex items-center gap-2">
              <FiClipboard className="text-indigo-400" size={14} /> Upcoming Deadlines
            </h3>
            {assignments.filter(a => a.deadline).slice(0, 4).map(a => {
              const deadline = parseISO(a.deadline);
              return (
                <div key={a._id} className="flex items-center gap-2 py-2 border-b theme-border-light last:border-0">
                  <div className="w-6 h-6 rounded bg-indigo-500/10 flex items-center justify-center shrink-0">
                    <FiCalendar className="text-indigo-400" size={11} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs theme-text truncate">{a.title}</p>
                    <p className="text-[10px] theme-text-muted">{format(deadline, 'MMM d')}</p>
                  </div>
                </div>
              );
            })}
            {assignments.filter(a => a.deadline).length === 0 && (
              <p className="text-xs theme-text-muted">No upcoming deadlines</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
