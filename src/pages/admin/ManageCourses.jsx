import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiBookOpen, FiSearch, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import Modal from '../../components/shared/Modal';
import { MOCK_COURSES, DOMAINS, DIFFICULTIES } from '../../utils/constants';

const ManageCourses = () => {
  const [courses, setCourses] = useState(MOCK_COURSES);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [form, setForm] = useState({
    title: '', domain: 'Engineering', type: 'elective', creditPoints: 0,
    instructor: '', duration: '', difficulty: 'Beginner', status: 'draft'
  });

  const filtered = courses.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));

  const handleSave = () => {
    if (editingCourse) {
      setCourses(courses.map(c => c._id === editingCourse._id ? { ...c, ...form } : c));
    } else {
      setCourses([...courses, { ...form, _id: String(Date.now()), enrolledCount: 0, modules: [] }]);
    }
    setShowForm(false);
    setEditingCourse(null);
    setForm({ title: '', domain: 'Engineering', type: 'elective', creditPoints: 0, instructor: '', duration: '', difficulty: 'Beginner', status: 'draft' });
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setForm({
      title: course.title, domain: course.domain, type: course.type,
      creditPoints: course.creditPoints, instructor: course.instructor,
      duration: course.duration, difficulty: course.difficulty, status: course.status
    });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setCourses(courses.filter(c => c._id !== id));
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="gradient-hero rounded-2xl p-6 lg:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white font-heading">Manage Courses</h1>
            <p className="text-slate-300 mt-1">Create, edit, and manage courses</p>
          </div>
          <button onClick={() => { setEditingCourse(null); setForm({ title: '', domain: 'Engineering', type: 'elective', creditPoints: 0, instructor: '', duration: '', difficulty: 'Beginner', status: 'draft' }); setShowForm(true); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg gradient-accent text-white text-sm font-medium">
            <FiPlus size={16} /> Add Course
          </button>
        </div>
      </motion.div>

      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses..."
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(course => (
          <div key={course._id} className="glass rounded-xl p-4 border border-white/10 hover:border-indigo-500/20 transition-all">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                <FiBookOpen className="text-indigo-400" size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">{course.title}</h3>
                    <p className="text-xs text-slate-500">{course.instructor} · {course.duration}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(course)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white">
                      <FiEdit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(course._id)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400">
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-500/20 text-slate-400">{course.domain}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400">{course.difficulty}</span>
                  {course.creditPoints > 0 && <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">{course.creditPoints} Credits</span>}
                  <span className={`text-xs px-2 py-0.5 rounded ${course.status === 'published' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {course.status}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                  <span>{course.enrolledCount} enrolled</span>
                  <button className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300">
                    {course.status === 'published' ? <FiToggleRight size={14} /> : <FiToggleLeft size={14} />}
                    {course.status === 'published' ? 'Published' : 'Draft'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editingCourse ? 'Edit Course' : 'Add Course'} size="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs text-slate-400 mb-1">Title</label>
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Domain</label>
            <select value={form.domain} onChange={e => setForm({...form, domain: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50">
              {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Type</label>
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50">
              <option value="elective">Elective</option>
              <option value="mandatory">Mandatory</option>
              <option value="co-curricular">Co-curricular</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Credit Points</label>
            <input type="number" value={form.creditPoints} onChange={e => setForm({...form, creditPoints: +e.target.value})} className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Difficulty</label>
            <select value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50">
              {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Instructor</label>
            <input value={form.instructor} onChange={e => setForm({...form, instructor: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Duration</label>
            <input value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} placeholder="e.g. 12 weeks" className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Status</label>
            <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
        <button onClick={handleSave} className="mt-4 w-full py-2.5 rounded-lg gradient-accent text-white text-sm font-medium">
          {editingCourse ? 'Update Course' : 'Create Course'}
        </button>
      </Modal>
    </div>
  );
};

export default ManageCourses;
