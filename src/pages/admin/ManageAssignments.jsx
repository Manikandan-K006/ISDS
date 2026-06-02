import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiClipboard, FiEdit2, FiTrash2, FiSearch, FiCheck, FiX } from 'react-icons/fi';
import Modal from '../../components/shared/Modal';
import { MOCK_ASSIGNMENTS, MOCK_COURSES } from '../../utils/constants';
import { formatDateTime } from '../../utils/helpers';

const ManageAssignments = () => {
  const [assignments, setAssignments] = useState(MOCK_ASSIGNMENTS);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    courseId: 'c1', title: '', description: '', deadline: '', maxMarks: 100, type: 'file'
  });

  const filtered = assignments.filter(a => a.title.toLowerCase().includes(search.toLowerCase()));
  const submissions = [
    { _id: 's1', student: 'Arjun Sharma', assignment: 'Calculus Problem Set', submitted: '2026-05-28T10:30:00', status: 'pending', downloadUrl: '#' },
    { _id: 's2', student: 'Priya Patel', assignment: 'Calculus Problem Set', submitted: '2026-05-27T14:00:00', status: 'graded', grade: 92 },
    { _id: 's3', student: 'Rahul Singh', assignment: 'Calculus Problem Set', submitted: '2026-05-29T09:00:00', status: 'pending' },
  ];

  const handleSave = () => {
    if (editing) {
      setAssignments(assignments.map(a => a._id === editing._id ? { ...a, ...form } : a));
    } else {
      setAssignments([...assignments, {
        ...form, _id: String(Date.now()), courseName: MOCK_COURSES.find(c => c._id === form.courseId)?.title || '', status: 'pending'
      }]);
    }
    setShowForm(false);
    setEditing(null);
    setForm({ courseId: 'c1', title: '', description: '', deadline: '', maxMarks: 100, type: 'file' });
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="gradient-hero rounded-2xl p-6 lg:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white font-heading">Manage Assignments</h1>
            <p className="text-slate-300 mt-1">Create and grade assignments</p>
          </div>
          <button onClick={() => { setEditing(null); setForm({ courseId: 'c1', title: '', description: '', deadline: '', maxMarks: 100, type: 'file' }); setShowForm(true); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg gradient-accent text-white text-sm font-medium">
            <FiPlus size={16} /> Create Assignment
          </button>
        </div>
      </motion.div>

      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search assignments..."
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50"
        />
      </div>

      <div className="space-y-3">
        {filtered.map(a => (
          <div key={a._id} className="glass rounded-xl p-4 border border-white/10">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <FiClipboard className="text-indigo-400" size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{a.title}</h3>
                  <p className="text-xs text-slate-500">{a.courseName}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditing(a); setForm({ courseId: a.courseId, title: a.title, description: a.description, deadline: a.deadline, maxMarks: a.maxMarks, type: a.type }); setShowForm(true); }}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white">
                  <FiEdit2 size={14} />
                </button>
                <button onClick={() => setAssignments(assignments.filter(x => x._id !== a._id))}
                  className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400">
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2 line-clamp-1">{a.description}</p>
            <div className="flex gap-3 mt-2 text-xs text-slate-500">
              <span>Max Marks: {a.maxMarks}</span>
              <span>Due: {formatDateTime(a.deadline)}</span>
              <span>Type: {a.type}</span>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold text-white mt-4">Recent Submissions</h2>
      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-3 text-left text-xs text-slate-400 font-medium uppercase">Student</th>
                <th className="p-3 text-left text-xs text-slate-400 font-medium uppercase">Assignment</th>
                <th className="p-3 text-left text-xs text-slate-400 font-medium uppercase">Submitted</th>
                <th className="p-3 text-left text-xs text-slate-400 font-medium uppercase">Status</th>
                <th className="p-3 text-left text-xs text-slate-400 font-medium uppercase">Grade</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {submissions.map(s => (
                <tr key={s._id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-3 text-sm text-white">{s.student}</td>
                  <td className="p-3 text-sm text-slate-300">{s.assignment}</td>
                  <td className="p-3 text-sm text-slate-500">{formatDateTime(s.submitted)}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${s.status === 'graded' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-white">{s.grade ?? '-'}</td>
                  <td className="p-3">
                    {s.status === 'pending' ? (
                      <button className="text-xs text-indigo-400 hover:text-indigo-300">Grade</button>
                    ) : (
                      <FiCheck className="text-emerald-400" size={16} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Assignment' : 'Create Assignment'}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Course</label>
            <select value={form.courseId} onChange={e => setForm({...form, courseId: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50">
              {MOCK_COURSES.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
            </select>
          </div>
          {['title', 'description'].map(f => (
            <div key={f}>
              <label className="block text-xs text-slate-400 mb-1 capitalize">{f}</label>
              {f === 'description' ? (
                <textarea value={form[f]} onChange={e => setForm({...form, [f]: e.target.value})} rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
              ) : (
                <input value={form[f]} onChange={e => setForm({...form, [f]: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
              )}
            </div>
          ))}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Deadline</label>
              <input type="datetime-local" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Max Marks</label>
              <input type="number" value={form.maxMarks} onChange={e => setForm({...form, maxMarks: +e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Submission Type</label>
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50">
              <option value="file">File Upload</option>
              <option value="text">Text Entry</option>
            </select>
          </div>
          <button onClick={handleSave} className="w-full py-2.5 rounded-lg gradient-accent text-white text-sm font-medium">
            {editing ? 'Update Assignment' : 'Create Assignment'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ManageAssignments;
