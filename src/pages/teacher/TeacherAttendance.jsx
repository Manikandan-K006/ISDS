import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import API from '../../api/client';
import { useAuth } from '../../hooks/useAuth';
import { FiCalendar, FiCheckCircle, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import { TableSkeleton } from '../../components/shared/LoadingSkeleton';

const STATUS_OPTIONS = [
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'late', label: 'Late' },
  { value: 'leave', label: 'Leave' },
];

const statusBadge = (status) => {
  const map = {
    present: 'bg-emerald-500/10 text-emerald-400',
    absent: 'bg-rose-500/10 text-rose-400',
    late: 'bg-amber-500/10 text-amber-500',
    leave: 'bg-violet-500/10 text-violet-400',
    holiday: 'bg-slate-500/10 theme-text-muted',
  };
  return map[status] || 'theme-text-muted';
};

export default function TeacherAttendance() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [statuses, setStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([API.get('/teachers/courses'), API.get('/teachers/students')])
      .then(([coursesRes, studentsRes]) => {
        const courseList = coursesRes.data?.courses || [];
        const studentList = studentsRes.data?.students || [];
        setCourses(courseList);
        setStudents(studentList);
        if (courseList.length > 0) setCourseId(courseList[0].id);
      })
      .catch(() => setError('Failed to load course and student data'))
      .finally(() => setLoading(false));
  }, []);

  const handleLoad = () => {
    if (!courseId || !date) return;
    setLoadingRecords(true);
    setError('');
    setMessage('');
    API.get(`/attendance/course/${courseId}`, { params: { date } })
      .then(({ data }) => {
        const map = {};
        (data?.records || []).forEach((r) => {
          map[r.studentId] = r.status;
        });
        setStatuses(map);
      })
      .catch(() => setError('Failed to load attendance records for this date'))
      .finally(() => setLoadingRecords(false));
  };

  const handleSave = () => {
    if (!courseId || !date || students.length === 0) return;
    setSaving(true);
    setError('');
    setMessage('');
    const records = students
      .map((s) => ({
        studentId: s.id,
        date,
        status: statuses[s.id] || 'present',
        courseId,
      }))
      .filter((r) => r.status);
    API.post('/attendance/mark', { records })
      .then(({ data }) => {
        setMessage(`Attendance saved for ${data?.count ?? records.length} student${records.length === 1 ? '' : 's'}`);
      })
      .catch(() => setError('Failed to save attendance'))
      .finally(() => setSaving(false));
  };

  if (loading) return <TableSkeleton rows={6} />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="gradient-hero rounded-2xl p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 theme-input rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 theme-input rounded-full translate-y-24 -translate-x-24" />
        <div className="relative">
          <h1 className="text-2xl lg:text-3xl font-bold theme-text font-heading">Attendance</h1>
          <p className="theme-text mt-1">Mark and record attendance for your courses, {user?.name}</p>
        </div>
      </div>

      <div className="theme-card rounded-2xl p-5 card-shadow">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div>
            <label className="block text-xs theme-text-muted font-medium mb-1.5">Course</label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full theme-card border theme-border rounded-xl px-3.5 py-2.5 text-sm theme-text focus:outline-none focus:border-indigo-500/50 transition-colors"
            >
              {courses.length === 0 && <option value="">No courses available</option>}
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs theme-text-muted font-medium mb-1.5">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full theme-card border theme-border rounded-xl px-3.5 py-2.5 text-sm theme-text focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
          </div>
          <button
            onClick={handleLoad}
            disabled={loadingRecords || !courseId || !date}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl gradient-accent text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <FiRefreshCw size={16} className={loadingRecords ? 'animate-spin' : ''} />
            {loadingRecords ? 'Loading...' : 'Load Records'}
          </button>
        </div>
      </div>

      {(message || error) && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm ${error ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
          {error ? <FiAlertTriangle size={16} /> : <FiCheckCircle size={16} />}
          {error || message}
        </div>
      )}

      <div className="theme-card rounded-2xl p-5 card-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FiCalendar size={18} className="text-indigo-500" />
            <h2 className="text-card-subtitle theme-text">Students</h2>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || students.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-accent text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b theme-border">
                <th className="p-3 text-left text-xs theme-text-muted font-medium uppercase tracking-wider">Student</th>
                <th className="p-3 text-left text-xs theme-text-muted font-medium uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-b theme-border hover:theme-subtle transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center shrink-0">
                        {s.profilePhoto ? (
                          <img src={s.profilePhoto} alt={s.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-indigo-400">{s.name?.charAt(0) || '?'}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm theme-text font-medium">{s.name}</p>
                        <p className="text-xs theme-text-muted">Roll: {s.rollNumber || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <select
                        value={statuses[s.id] || 'present'}
                        onChange={(e) => setStatuses((prev) => ({ ...prev, [s.id]: e.target.value }))}
                        className="theme-card border theme-border rounded-xl px-3 py-2 text-sm theme-text focus:outline-none focus:border-indigo-500/50 transition-colors"
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <span className={`text-xs px-2 py-1 rounded-full capitalize ${statusBadge(statuses[s.id] || 'present')}`}>
                        {statuses[s.id] || 'present'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={2} className="p-10 text-center theme-text-muted text-sm">No students found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
