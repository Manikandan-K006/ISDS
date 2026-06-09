import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiClipboard, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import Modal from '../../components/shared/Modal';
import { getAssignments, createAssignment, updateAssignment, deleteAssignment } from '../../api/assignments';
import { getCourses } from '../../api/courses';
import { formatDateTime } from '../../utils/helpers';

const ManageAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    courseId: '', title: '', description: '', deadline: '', maxMarks: 100, type: 'file'
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.allSettled([getAssignments(), getCourses()]);
      if (results[0].status === 'fulfilled') setAssignments(Array.isArray(results[0].value) ? results[0].value : []);
      if (results[1].status === 'fulfilled') setCourses(Array.isArray(results[1].value) ? results[1].value : []);
      if (results.every(r => r.status === 'rejected')) setError('Failed to load data');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = assignments.filter(a => a.title && a.title.toLowerCase().includes(search.toLowerCase()));

  const handleSave = async () => {
    try {
      if (editing) {
        await updateAssignment(editing._id, form);
      } else {
        await createAssignment(form);
      }
      setShowForm(false);
      setEditing(null);
      setForm({ courseId: courses.length > 0 ? courses[0]._id : '', title: '', description: '', deadline: '', maxMarks: 100, type: 'file' });
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAssignment(id);
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      <span className="ml-3 text-slate-400">Loading...</span>
    </div>
  );

  if (error) return (
    <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-6">
      <p className="text-rose-400 text-sm font-medium">Failed to load assignments</p>
      <p className="text-rose-400/60 text-xs mt-1">{error}</p>
      <button onClick={fetchData} className="mt-3 px-4 py-2 bg-rose-500/20 rounded-lg text-rose-400 text-sm">Retry</button>
    </div>
  );

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="gradient-hero rounded-2xl p-6 lg:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white font-heading">Manage Assignments</h1>
            <p className="text-slate-300 mt-1">Create and grade assignments</p>
          </div>
          <button onClick={() => { setEditing(null); setForm({ courseId: courses.length > 0 ? courses[0]._id : '', title: '', description: '', deadline: '', maxMarks: 100, type: 'file' }); setShowForm(true); }}
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
                  <p className="text-xs text-slate-500">{a.courseName || courses.find(c => c._id === a.courseId)?.title || ''}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditing(a); setForm({ courseId: a.courseId, title: a.title, description: a.description, deadline: a.deadline, maxMarks: a.maxMarks, type: a.type }); setShowForm(true); }}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white">
                  <FiEdit2 size={14} />
                </button>
                <button onClick={() => handleDelete(a._id)}
                  className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400">
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2 line-clamp-1">{a.description}</p>
            <div className="flex gap-3 mt-2 text-xs text-slate-500">
              <span>Max Marks: {a.maxMarks}</span>
              {a.deadline && <span>Due: {formatDateTime(a.deadline)}</span>}
              <span>Type: {a.type}</span>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Assignment' : 'Create Assignment'}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Course</label>
            <select value={form.courseId} onChange={e => setForm({...form, courseId: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50">
              {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
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
