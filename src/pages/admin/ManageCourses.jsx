import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiBookOpen, FiSearch, FiToggleLeft, FiToggleRight, FiVideo, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import Modal from '../../components/shared/Modal';
import { DOMAINS, DIFFICULTIES } from '../../utils/constants';
import { getCourses, createCourse, updateCourse, deleteCourse } from '../../api/courses';

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    title: '', domain: 'Engineering', type: 'elective', creditPoints: 0,
    instructor: '', duration: '', difficulty: 'Beginner', status: 'draft',
    modules: []
  });
  const [expandedModules, setExpandedModules] = useState([]);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCourses();
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourses(); }, []);

  const filtered = courses.filter(c => c.title && c.title.toLowerCase().includes(search.toLowerCase()));

  const handleSave = async () => {
    try {
      if (editingCourse) {
        await updateCourse(editingCourse._id, form);
      } else {
        await createCourse(form);
      }
      setShowForm(false);
      setEditingCourse(null);
      setForm({ title: '', domain: 'Engineering', type: 'elective', creditPoints: 0, instructor: '', duration: '', difficulty: 'Beginner', status: 'draft', modules: [] });
      setExpandedModules([]);
      await fetchCourses();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setForm({
      title: course.title, domain: course.domain, type: course.type,
      creditPoints: course.creditPoints, instructor: course.instructor,
      duration: course.duration, difficulty: course.difficulty, status: course.status,
      modules: course.modules || []
    });
    setShowForm(true);
  };

  const addModule = () => {
    setForm(prev => ({ ...prev, modules: [...prev.modules, { title: '', lessons: [] }] }));
    setExpandedModules(prev => [...prev, form.modules.length]);
  };

  const updateModule = (idx, val) => {
    const m = [...form.modules];
    m[idx] = { ...m[idx], title: val };
    setForm(prev => ({ ...prev, modules: m }));
  };

  const removeModule = (idx) => {
    setForm(prev => ({ ...prev, modules: prev.modules.filter((_, i) => i !== idx) }));
  };

  const addLesson = (modIdx) => {
    const m = [...form.modules];
    m[modIdx] = { ...m[modIdx], lessons: [...m[modIdx].lessons, { title: '', videoUrl: '' }] };
    setForm(prev => ({ ...prev, modules: m }));
  };

  const updateLesson = (modIdx, lesIdx, field, val) => {
    const m = [...form.modules];
    m[modIdx].lessons[lesIdx] = { ...m[modIdx].lessons[lesIdx], [field]: val };
    setForm(prev => ({ ...prev, modules: m }));
  };

  const removeLesson = (modIdx, lesIdx) => {
    const m = [...form.modules];
    m[modIdx].lessons = m[modIdx].lessons.filter((_, i) => i !== lesIdx);
    setForm(prev => ({ ...prev, modules: m }));
  };

  const handleDelete = async (id) => {
    try {
      await deleteCourse(id);
      await fetchCourses();
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
      <p className="text-rose-400 text-sm font-medium">Failed to load courses</p>
      <p className="text-rose-400/60 text-xs mt-1">{error}</p>
      <button onClick={fetchCourses} className="mt-3 px-4 py-2 bg-rose-500/20 rounded-lg text-rose-400 text-sm">Retry</button>
    </div>
  );

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="gradient-hero rounded-2xl p-6 lg:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white font-heading">Manage Courses</h1>
            <p className="text-slate-300 mt-1">Create, edit, and manage courses</p>
          </div>
          <button onClick={() => { setEditingCourse(null); setForm({ title: '', domain: 'Engineering', type: 'elective', creditPoints: 0, instructor: '', duration: '', difficulty: 'Beginner', status: 'draft', modules: [] }); setShowForm(true); setExpandedModules([]); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm font-medium">
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
                  <span>{course.enrolledCount || 0} enrolled · {(course.modules || []).length} modules</span>
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

        <div className="mt-4 border-t border-white/10 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">Course Content (Modules & Lessons)</h3>
            <button onClick={addModule} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 text-xs border border-indigo-500/20 hover:bg-indigo-500/30">
              <FiPlus size={12} /> Add Module
            </button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {form.modules.map((mod, mi) => (
              <div key={mi} className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="flex items-center gap-2">
                  <input value={mod.title} onChange={e => updateModule(mi, e.target.value)}
                    placeholder="Module title (e.g. Module 1: Algebra)"
                    className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50"
                  />
                  <button onClick={() => setExpandedModules(prev => prev.includes(mi) ? prev.filter(i => i !== mi) : [...prev, mi])}
                    className="p-1 text-slate-400 hover:text-white">
                    {expandedModules.includes(mi) ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                  </button>
                  <button onClick={() => removeModule(mi)} className="p-1 text-rose-400 hover:text-rose-300">
                    <FiTrash2 size={14} />
                  </button>
                </div>
                {expandedModules.includes(mi) && (
                  <div className="mt-2 pl-3 space-y-1.5 border-l border-white/10">
                    {mod.lessons.map((les, li) => (
                      <div key={li} className="flex items-center gap-1.5">
                        <input value={les.title} onChange={e => updateLesson(mi, li, 'title', e.target.value)}
                          placeholder="Lesson title"
                          className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50"
                        />
                        <input value={les.videoUrl} onChange={e => updateLesson(mi, li, 'videoUrl', e.target.value)}
                          placeholder="YouTube URL"
                          className="w-36 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50"
                        />
                        <FiVideo className="text-slate-500" size={12} />
                        <button onClick={() => removeLesson(mi, li)} className="p-0.5 text-rose-400 hover:text-rose-300">
                          <FiTrash2 size={11} />
                        </button>
                      </div>
                    ))}
                    <button onClick={() => addLesson(mi)}
                      className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 mt-1">
                      <FiPlus size={11} /> Add Lesson
                    </button>
                  </div>
                )}
              </div>
            ))}
            {form.modules.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-3">No modules yet. Click "Add Module" to create course content.</p>
            )}
          </div>
        </div>

        <button onClick={handleSave} className="mt-4 w-full py-2.5 rounded-lg bg-indigo-500 text-white text-sm font-medium">
          {editingCourse ? 'Update Course' : 'Create Course'}
        </button>
      </Modal>
    </div>
  );
};

export default ManageCourses;
