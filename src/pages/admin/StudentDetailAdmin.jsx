import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiEdit2, FiSave, FiUser, FiBookOpen, FiCalendar, FiAward, FiStar, FiFileText, FiMessageSquare, FiActivity, FiChevronLeft, FiBarChart2, FiTarget } from 'react-icons/fi';
import PerformanceRadar from '../../components/charts/PerformanceRadar';
import GradeTrendLine from '../../components/charts/GradeTrendLine';
import AttendanceCalendar from '../../components/charts/AttendanceCalendar';
import Modal from '../../components/shared/Modal';
import API from '../../api/client';

const tabs = [
  { key: 'academic', label: 'Academic', icon: FiBarChart2 },
  { key: 'attendance', label: 'Attendance', icon: FiCalendar },
  { key: 'courses', label: 'Courses', icon: FiBookOpen },
  { key: 'cocurricular', label: 'Co-curricular', icon: FiStar },
  { key: 'assignments', label: 'Assignments', icon: FiFileText },
  { key: 'certificates', label: 'Certificates', icon: FiAward },
  { key: 'trophies', label: 'Trophies', icon: FiTarget },
  { key: 'notes', label: 'Notes', icon: FiMessageSquare },
];

const StudentDetailAdmin = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('academic');
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [student, setStudent] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [trophies, setTrophies] = useState([]);
  const [teacherNote, setTeacherNote] = useState('');
  const [notes, setNotes] = useState([]);

  const fetchStudentData = async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.allSettled([
        API.get(`/students/${id}`),
        API.get('/attendance', { params: { studentId: id } }),
        API.get('/assignments', { params: { studentId: id } }),
        API.get(`/students/${id}/certificates`),
        API.get(`/students/${id}/trophies`),
        API.get(`/students/${id}/notes`),
      ]);

      if (results[0].status === 'fulfilled') setStudent(results[0].value.data);
      if (results[1].status === 'fulfilled') setAttendanceData(Array.isArray(results[1].value.data) ? results[1].value.data : []);
      if (results[2].status === 'fulfilled') setAssignments(Array.isArray(results[2].value.data) ? results[2].value.data : []);
      if (results[3].status === 'fulfilled') setCertificates(Array.isArray(results[3].value.data) ? results[3].value.data : []);
      if (results[4].status === 'fulfilled') setTrophies(Array.isArray(results[4].value.data) ? results[4].value.data : []);
      if (results[5].status === 'fulfilled') setNotes(Array.isArray(results[5].value.data) ? results[5].value.data : []);

      if (results[0].status === 'rejected') setError('Failed to load student data');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (id) fetchStudentData(); }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      <span className="ml-3 theme-text-muted">Loading...</span>
    </div>
  );

  if (error) return (
    <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-6">
      <p className="text-rose-400 text-sm font-medium">Failed to load student data</p>
      <p className="text-rose-400/60 text-xs mt-1">{error}</p>
      <button onClick={fetchStudentData} className="mt-3 px-4 py-2 bg-rose-500/20 rounded-lg text-rose-400 text-sm">Retry</button>
    </div>
  );

  if (!student) return null;

  const gpaData = student.gpaHistory ? student.gpaHistory.map((gpa, i) => ({ term: `T${i + 1}`, gpa })) : [];

  const presentCount = attendanceData.filter(a => a.status === 'present').length;
  const absentCount = attendanceData.filter(a => a.status === 'absent').length;
  const leaveCount = attendanceData.filter(a => a.status === 'leave').length;
  const holidayCount = attendanceData.filter(a => a.status === 'holiday').length;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'academic':
        return (
          <div className="space-y-4">
            <div className="theme-card border theme-border rounded-xl p-5">
              <h3 className="text-sm font-semibold theme-text mb-3">Subject-wise Marks</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b theme-border">
                      <th className="text-left py-2 theme-text-muted font-medium">Subject</th>
                      <th className="text-center py-2 theme-text-muted font-medium">Term 1</th>
                      <th className="text-center py-2 theme-text-muted font-medium">Term 2</th>
                      <th className="text-center py-2 theme-text-muted font-medium">Overall</th>
                    </tr>
                  </thead>
                  <tbody>
                    {student.subjects && student.subjects.map(s => (
                      <tr key={s.name} className="border-b border-white/5">
                        <td className="py-2 theme-text">{s.name}</td>
                        <td className="text-center theme-text">{s.term1}</td>
                        <td className="text-center theme-text">{s.term2}</td>
                        <td className={`text-center font-medium ${s.score >= 90 ? 'text-emerald-400' : s.score >= 75 ? 'text-amber-400' : 'text-rose-400'}`}>{s.score}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="theme-card border theme-border rounded-xl p-5">
              <h3 className="text-sm font-semibold theme-text mb-3">GPA Trend</h3>
              <GradeTrendLine data={gpaData} />
            </div>
            <div className="theme-card border theme-border rounded-xl p-5">
              <h3 className="text-sm font-semibold theme-text mb-3">Performance Radar</h3>
              <PerformanceRadar />
            </div>
          </div>
        );
      case 'attendance':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Present', value: presentCount, color: 'text-emerald-400' },
                { label: 'Absent', value: absentCount, color: 'text-rose-400' },
                { label: 'Leave', value: leaveCount, color: 'text-amber-400' },
                { label: 'Holiday', value: holidayCount, color: 'theme-text-muted' }
              ].map(d => (
                <div key={d.label} className="theme-card border theme-border rounded-lg p-3 text-center">
                  <div className={`text-lg font-bold ${d.color}`}>{d.value}</div>
                  <div className="text-xs theme-text-muted">{d.label}</div>
                </div>
              ))}
            </div>
            <AttendanceCalendar attendanceData={attendanceData} />
            <div className="theme-card border theme-border rounded-xl p-5">
              <h3 className="text-sm font-semibold theme-text mb-3">Absent Reasons</h3>
              {attendanceData.filter(a => a.status === 'absent').map(a => (
                <div key={a.date || a._id} className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-sm theme-text">{a.date}</span>
                  <span className="text-xs theme-text-muted">{a.reason || 'No reason provided'}</span>
                </div>
              ))}
            </div>
          </div>
        );
      case 'courses':
        return (
          <div className="space-y-3">
            {student.enrolledCourses && student.enrolledCourses.map(c => (
              <div key={c._id} className="theme-card border theme-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="text-sm font-semibold theme-text">{c.title}</h4>
                    <p className="text-xs theme-text-muted">{c.instructor}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${c.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                    {c.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs theme-text-muted">
                  <span>Progress: {c.progress}%</span>
                  {c.creditPoints > 0 && <span>· {c.creditPoints} Credits</span>}
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${c.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        );
      case 'cocurricular':
        return (
          <div className="space-y-3">
            {(student.cocurricular || []).map((c, i) => (
              <div key={i} className="theme-card border theme-border rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-semibold theme-text">{c.activity}</h4>
                    <p className="text-xs theme-text-muted">{c.role} · {c.date}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs theme-text-muted">{c.outcome}</span>
                    {c.award && <p className="text-xs text-amber-400 mt-1">{c.award}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      case 'assignments':
        return (
          <div className="space-y-3">
            {assignments.map(a => (
              <div key={a._id} className="theme-card border theme-border rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold theme-text">{a.title}</h4>
                    <p className="text-xs theme-text-muted">{a.courseName || ''}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    a.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                    a.status === 'submitted' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {a.status}
                  </span>
                </div>
                {a.grade !== undefined && (
                  <div className="mt-2 text-xs">
                    <span className="text-emerald-400">Grade: {a.grade}/{a.maxMarks}</span>
                    {a.feedback && <p className="theme-text-muted mt-1">Feedback: {a.feedback}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      case 'certificates':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {certificates.map(c => (
              <div key={c._id} className="theme-card border theme-border rounded-xl p-4 border border-indigo-500/10">
                <div className="flex items-center gap-2 mb-2">
                  <FiAward className="text-indigo-400" size={20} />
                  <h4 className="text-sm font-semibold theme-text">{c.courseName}</h4>
                </div>
                <div className="text-xs theme-text-muted space-y-1">
                  <p>Grade: {c.grade}</p>
                  <p>Issued: {c.issuedAt}</p>
                  {c.creditPoints > 0 && <p>Credits: {c.creditPoints}</p>}
                </div>
              </div>
            ))}
          </div>
        );
      case 'trophies':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {trophies.map(t => (
              <div key={t._id} className="theme-card border theme-border rounded-xl p-4 border border-amber-500/10">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{t.icon}</span>
                  <div>
                    <h4 className="text-sm font-semibold theme-text">{t.title}</h4>
                    <p className="text-xs theme-text-muted">{t.description}</p>
                    <p className="text-xs theme-text-muted mt-1">Earned: {t.earnedAt}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      case 'notes':
        return (
          <div className="space-y-4">
            <div className="theme-card border theme-border rounded-xl p-5">
              <h3 className="text-sm font-semibold theme-text mb-3">Add Teacher Note</h3>
              <textarea value={teacherNote} onChange={e => setTeacherNote(e.target.value)}
                placeholder="Write a private note about this student..."
                className="w-full h-24 theme-input border theme-border rounded-lg p-3 text-sm theme-text placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 resize-none"
              />
              <button onClick={() => { if (teacherNote.trim()) { setNotes([...notes, `${teacherNote} - Teacher`]); setTeacherNote(''); } }}
                className="mt-2 px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm font-medium">
                Add Note
              </button>
            </div>
            <div className="space-y-2">
              {notes.map((n, i) => (
                <div key={i} className="theme-card border theme-border rounded-xl p-3">
                  <p className="text-sm theme-text">{n}</p>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const initials = student.name ? student.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'ST';

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="theme-bg rounded-2xl p-6 lg:p-8">
        <Link to="/admin/students" className="flex items-center gap-1 text-sm theme-text-muted hover:theme-text mb-4 transition-colors">
          <FiChevronLeft size={16} /> Back to Students
        </Link>
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-indigo-500/20 border-2 border-indigo-500/30 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl text-indigo-400 font-bold">{initials}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold theme-text">{student.name}</h1>
                <p className="theme-text">Class {student.class} · Roll No. {student.rollNumber}</p>
                <p className="text-xs theme-text-muted mt-1">Parent: {student.parentContact}</p>
              </div>
              <button onClick={() => setEditMode(!editMode)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/10 theme-text text-sm hover:bg-white/20 transition-colors">
                {editMode ? <FiSave size={16} /> : <FiEdit2 size={16} />}
                {editMode ? 'Save' : 'Edit Profile'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-48 flex-shrink-0">
          <div className="theme-card border theme-border rounded-xl p-3 sticky top-20 space-y-1">
            {tabs.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeTab === tab.key ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/20' : 'theme-text-muted hover:theme-text hover:theme-input'
                }`}
              >
                <tab.icon size={14} /> {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold theme-text">{tabs.find(t => t.key === activeTab)?.label}</h2>
            {editMode && <button className="text-xs text-indigo-400 hover:text-indigo-300">Update Section</button>}
          </div>
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default StudentDetailAdmin;
