import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiPhone, FiMessageSquare, FiCalendar, FiUser, FiMail, FiClock, FiSend } from 'react-icons/fi';
import API from '../../api/client';
import { PageSkeleton } from '../../components/shared/LoadingSkeleton';
import toast from 'react-hot-toast';

const CallModule = () => {
  const [logs, setLogs] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('All');
  const [selectedParent, setSelectedParent] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [logsRes, studentsRes] = await Promise.all([
          API.get('/calls').catch(() => ({ data: [] })),
          API.get('/students').catch(() => ({ data: [] })),
        ]);
        setLogs(Array.isArray(logsRes.data) ? logsRes.data : []);
        setStudents(Array.isArray(studentsRes.data) ? studentsRes.data : []);
      } catch (e) {
        setLogs([]);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const parentList = students.map(s => ({
    _id: s._id,
    studentName: s.name || 'Unknown',
    className: s.class || 'N/A',
    parentName: s.parentContact || s.name || 'Unknown',
    phone: s.parentContact || '',
    email: s.email || '',
    lastContacted: s.updatedAt ? new Date(s.updatedAt).toLocaleDateString() : 'N/A',
  }));

  const classes = ['All', ...new Set(parentList.map(p => p.className).filter(Boolean))];

  const filtered = parentList.filter(p => {
    if (classFilter !== 'All' && p.className !== classFilter) return false;
    if (search && !p.studentName.toLowerCase().includes(search.toLowerCase()) && !p.parentName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) return <PageSkeleton />;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="gradient-hero rounded-2xl p-6 lg:p-8">
        <h1 className="text-2xl lg:text-3xl font-bold theme-text font-heading">Parent Communication</h1>
        <p className="theme-text mt-1">Call, message, and manage parent communications</p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted" size={16} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by student or parent name..."
            className="w-full theme-input border theme-border rounded-lg pl-10 pr-3 py-2.5 text-sm theme-text placeholder-theme-muted focus:outline-none focus:border-indigo-500/50"
          />
        </div>
        <select value={classFilter} onChange={e => setClassFilter(e.target.value)}
          className="theme-input border theme-border rounded-lg px-3 py-2.5 text-sm theme-text focus:outline-none focus:border-indigo-500/50"
        >
          {classes.map(c => <option key={c} value={c}>{c === 'All' ? 'All Classes' : c}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {filtered.length > 0 ? filtered.map(p => (
            <motion.div key={p._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`theme-card border rounded-xl p-4 cursor-pointer transition-all ${selectedParent?._id === p._id ? 'border-indigo-500/30 bg-indigo-500/5' : 'theme-border hover:theme-border-light'}`}
              onClick={() => setSelectedParent(p)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                    <FiUser className="text-indigo-400" size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold theme-text">{p.parentName}</h3>
                    <p className="text-xs theme-text-muted">Parent of {p.studentName} ({p.className})</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a href={`tel:${p.phone}`} className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors">
                    <FiPhone size={16} />
                  </a>
                  <button className="p-2.5 rounded-lg bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 transition-colors">
                    <FiMessageSquare size={16} />
                  </button>
                </div>
              </div>
              <div className="flex gap-4 mt-3 text-xs theme-text-muted">
                {p.email && <span className="flex items-center gap-1"><FiMail size={12} /> {p.email}</span>}
                <span className="flex items-center gap-1"><FiClock size={12} /> Last: {p.lastContacted}</span>
              </div>
            </motion.div>
          )) : (
            <div className="theme-card border theme-border rounded-xl p-8 text-center">
              <FiUser className="mx-auto theme-text-muted mb-2" size={32} />
              <p className="theme-text-muted text-sm">No students found</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {selectedParent ? (
            <>
              <div className="theme-card border theme-border rounded-xl p-5">
                <h3 className="text-sm font-semibold theme-text mb-3">Contact Details</h3>
                <div className="space-y-3 text-sm">
                  <div><span className="theme-text-muted">Parent:</span> <span className="theme-text">{selectedParent.parentName}</span></div>
                  <div><span className="theme-text-muted">Student:</span> <span className="theme-text">{selectedParent.studentName}</span></div>
                  <div><span className="theme-text-muted">Class:</span> <span className="theme-text">{selectedParent.className}</span></div>
                  {selectedParent.phone && <div><span className="theme-text-muted">Phone:</span> <a href={`tel:${selectedParent.phone}`} className="text-indigo-400 hover:text-indigo-300">{selectedParent.phone}</a></div>}
                  {selectedParent.email && <div><span className="theme-text-muted">Email:</span> <span className="theme-text">{selectedParent.email}</span></div>}
                </div>
                <div className="flex gap-2 mt-4">
                  <a href={`tel:${selectedParent.phone}`} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-sm hover:bg-emerald-500/30 transition-colors">
                    <FiPhone size={16} /> Quick Call
                  </a>
                  <button className="flex-1 py-2.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 text-sm hover:bg-indigo-500/30 transition-colors">
                    <FiCalendar size={16} /> Schedule
                  </button>
                </div>
              </div>
              <div className="theme-card border theme-border rounded-xl p-5">
                <h3 className="text-sm font-semibold theme-text mb-3">Send Message</h3>
                <textarea value={message} onChange={e => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full h-24 theme-input border theme-border rounded-lg p-3 text-sm theme-text placeholder-theme-muted focus:outline-none focus:border-indigo-500/50 resize-none"
                />
                <button onClick={async () => {
                  if (!message.trim()) return;
                  try {
                    await API.post('/calls', {
                      studentId: selectedParent._id,
                      parentContact: selectedParent.phone,
                      type: 'message',
                      notes: message,
                    });
                    toast.success('Message sent');
                    setMessage('');
                  } catch {
                    toast.error('Failed to send message');
                  }
                }} className="mt-2 w-full py-2.5 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-400 transition-colors">
                  <FiSend size={14} className="inline mr-1" /> Send Message
                </button>
              </div>
            </>
          ) : (
            <div className="theme-card border theme-border rounded-xl p-5 text-center theme-text-muted">
              <FiUser className="mx-auto mb-2" size={24} />
              <p className="text-sm">Select a parent to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallModule;
