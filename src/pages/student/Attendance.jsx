import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiInfo, FiSend } from 'react-icons/fi';
import AttendanceCalendar from '../../components/charts/AttendanceCalendar';
import Modal from '../../components/shared/Modal';
import { MOCK_ATTENDANCE } from '../../utils/constants';
import { format } from 'date-fns';

const Attendance = () => {
  const [selectedDay, setSelectedDay] = useState(null);
  const [showLeave, setShowLeave] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ date: '', reason: '' });

  const total = MOCK_ATTENDANCE.filter(a => a.status !== 'holiday').length;
  const present = MOCK_ATTENDANCE.filter(a => a.status === 'present').length;
  const absent = MOCK_ATTENDANCE.filter(a => a.status === 'absent').length;
  const leave = MOCK_ATTENDANCE.filter(a => a.status === 'leave').length;
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

  const handleDayClick = (dayData) => {
    const record = MOCK_ATTENDANCE.find(a => a.date === format(dayData.date, 'yyyy-MM-dd'));
    if (record && record.status !== 'present') setSelectedDay(record);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="gradient-hero rounded-2xl p-6 lg:p-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-white font-heading">Attendance</h1>
        <p className="text-slate-300 mt-1">Track your attendance and apply for leave</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-emerald-400">{percentage}%</div>
          <div className="text-xs text-slate-500 mt-1">Attendance</div>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-emerald-400">{present}</div>
          <div className="text-xs text-slate-500 mt-1">Present</div>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-rose-400">{absent}</div>
          <div className="text-xs text-slate-500 mt-1">Absent</div>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-amber-400">{leave}</div>
          <div className="text-xs text-slate-500 mt-1">Leave</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AttendanceCalendar attendanceData={MOCK_ATTENDANCE} onDayClick={handleDayClick} />
        </div>
        <div className="space-y-4">
          <div className="glass rounded-xl p-5">
            <h2 className="text-sm font-semibold text-white mb-3">Monthly Summary</h2>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Present</span>
                  <span>{present}/{total}</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(present / total) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Absent</span>
                  <span>{absent}/{total}</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${(absent / total) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Leave</span>
                  <span>{leave}/{total}</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(leave / total) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>
          <button onClick={() => setShowLeave(true)}
            className="w-full py-3 rounded-lg gradient-accent text-white text-sm font-medium flex items-center justify-center gap-2"
          >
            <FiSend size={16} /> Apply for Leave
          </button>
        </div>
      </div>

      <Modal isOpen={!!selectedDay} onClose={() => setSelectedDay(null)} title="Attendance Detail" size="sm">
        {selectedDay && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <FiCalendar className="text-slate-400" size={16} />
              <span className="text-white">{selectedDay.date}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <FiInfo className="text-slate-400" size={16} />
              <span className={`capitalize font-medium ${selectedDay.status === 'absent' ? 'text-rose-400' : 'text-amber-400'}`}>
                {selectedDay.status}
              </span>
            </div>
            {selectedDay.reason && <p className="text-sm text-slate-300">Reason: {selectedDay.reason}</p>}
            {selectedDay.teacherNote && <p className="text-sm text-slate-300">Teacher's note: {selectedDay.teacherNote}</p>}
          </div>
        )}
      </Modal>

      <Modal isOpen={showLeave} onClose={() => setShowLeave(false)} title="Apply for Leave" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Date</label>
            <input type="date" value={leaveForm.date} onChange={e => setLeaveForm({...leaveForm, date: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Reason</label>
            <textarea value={leaveForm.reason} onChange={e => setLeaveForm({...leaveForm, reason: e.target.value})}
              placeholder="Enter reason for leave..."
              className="w-full h-24 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 resize-none"
            />
          </div>
          <button className="w-full py-2.5 rounded-lg gradient-accent text-white text-sm font-medium">
            Submit Leave Application
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Attendance;
