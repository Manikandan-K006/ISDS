import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FiPlus, FiEdit2, FiTrash2, FiBookOpen, FiSearch,
  FiChevronDown, FiChevronUp,
  FiUpload, FiLink, FiFile, FiSave,
} from 'react-icons/fi';
import Modal from '../../components/shared/Modal';
import { DOMAINS, DIFFICULTIES, RESOURCE_TYPES, VISIBILITY_OPTIONS } from '../../utils/constants';
import {
  getCourses, createCourse, updateCourse, deleteCourse,
  uploadFile, addResource, updateResource, deleteResource, updateResources,
} from '../../api/courses';

const EMPTY_FORM = {
  title: '', domain: 'Engineering', type: 'elective', creditPoints: 0,
  instructor: '', duration: '', difficulty: 'Beginner', status: 'draft',
  modules: [], resources: [],
};

const EMPTY_RESOURCE = {
  title: '', type: 'PDF', description: '', fileUrl: '', externalUrl: '',
  visibility: 'students', order: 0,
};

const resourceTypeIcons = {
  PDF: FiFile, DOC: FiFile, DOCX: FiFile, PPT: FiFile, PPTX: FiFile,
  XLS: FiFile, XLSX: FiFile, ZIP: FiFile, Image: FiFile, Video: FiFile,
  Audio: FiFile, YouTube: FiLink, GoogleDrive: FiLink, OneDrive: FiLink,
  GitHub: FiLink, Website: FiLink, ResearchPaper: FiLink, Docs: FiLink,
};

const visibilityColors = {
  public: 'text-emerald-400 bg-emerald-500/10',
  students: 'text-indigo-400 bg-indigo-500/10',
  draft: 'text-amber-400 bg-amber-500/10',
};

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('details');
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [expandedModules, setExpandedModules] = useState([]);

  const [resourceFormOpen, setResourceFormOpen] = useState(false);
  const [editingResourceIdx, setEditingResourceIdx] = useState(null);
  const [resourceForm, setResourceForm] = useState({ ...EMPTY_RESOURCE });
  const [uploadingFile, setUploadingFile] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [resourceErrors, setResourceErrors] = useState({});
  const [expandedResources, setExpandedResources] = useState([]);

  const fetchCourses = useCallback(async () => {
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
  }, []);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const filtered = courses.filter(c => c.title && c.title.toLowerCase().includes(search.toLowerCase()));

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      if (editingCourse) {
        await updateCourse(editingCourse._id, form);
      } else {
        await createCourse(form);
      }
      setShowForm(false);
      setEditingCourse(null);
      setForm({ ...EMPTY_FORM });
      setExpandedModules([]);
      await fetchCourses();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setForm({
      title: course.title, domain: course.domain, type: course.type,
      creditPoints: course.creditPoints, instructor: course.instructor,
      duration: course.duration, difficulty: course.difficulty, status: course.status,
      modules: course.modules || [],
      resources: (course.resources || []).map((r, i) => ({ ...r, order: r.order ?? i })),
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

  const openAddResource = () => {
    setEditingResourceIdx(null);
    setResourceForm({ ...EMPTY_RESOURCE, order: form.resources.length });
    setResourceErrors({});
    setResourceFormOpen(true);
  };

  const openEditResource = (idx) => {
    setEditingResourceIdx(idx);
    setResourceForm({ ...form.resources[idx] });
    setResourceErrors({});
    setResourceFormOpen(true);
  };

  const validateResource = () => {
    const errs = {};
    if (!resourceForm.title.trim()) errs.title = 'Title is required';
    if (!resourceForm.fileUrl && !resourceForm.externalUrl) errs.file = 'Upload a file or provide an external URL';
    setResourceErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveResource = () => {
    if (!validateResource()) return;
    const resources = [...form.resources];
    if (editingResourceIdx !== null) {
      resources[editingResourceIdx] = { ...resourceForm };
    } else {
      resources.push({ ...resourceForm, order: resources.length });
    }
    setForm(prev => ({ ...prev, resources }));
    setResourceFormOpen(false);
    setEditingResourceIdx(null);
  };

  const handleDeleteResource = (idx) => {
    const resources = form.resources.filter((_, i) => i !== idx).map((r, i) => ({ ...r, order: i }));
    setForm(prev => ({ ...prev, resources }));
  };

  const moveResource = (idx, dir) => {
    const resources = [...form.resources];
    const target = idx + dir;
    if (target < 0 || target >= resources.length) return;
    [resources[idx], resources[target]] = [resources[target], resources[idx]];
    setForm(prev => ({ ...prev, resources: resources.map((r, i) => ({ ...r, order: i })) }));
  };

  const handleFileUpload = async (file) => {
    setUploadingFile(true);
    try {
      const result = await uploadFile(file);
      setResourceForm(prev => ({ ...prev, fileUrl: result.fileUrl, type: result.fileType }));
    } catch (err) {
      setResourceErrors(prev => ({ ...prev, file: err.message || 'Upload failed' }));
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) handleFileUpload(file);
  };

  const getFileName = (url) => {
    if (!url) return '';
    const parts = url.split('/');
    return parts[parts.length - 1];
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      <span className="ml-3 theme-text-muted">Loading...</span>
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
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-indigo-600/20 to-transparent rounded-2xl p-6 lg:p-8 border theme-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold theme-text">Manage Courses</h1>
            <p className="theme-text-muted mt-1">Create, edit, and manage courses</p>
          </div>
          <button onClick={() => { setEditingCourse(null); setForm({ ...EMPTY_FORM }); setShowForm(true); setExpandedModules([]); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-400 transition-colors">
            <FiPlus size={16} /> Add Course
          </button>
        </div>
      </motion.div>

      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted" size={16} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses..."
          className="w-full theme-card border theme-border rounded-xl pl-10 pr-3 py-2.5 text-sm theme-text placeholder-slate-600 focus:outline-none focus:border-indigo-500/40 transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(course => (
          <div key={course._id} className="theme-card border theme-border rounded-2xl p-4 hover:border-indigo-500/20 transition-all">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                <FiBookOpen className="text-indigo-400" size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold theme-text">{course.title}</h3>
                    <p className="text-xs theme-text-muted">{course.instructor} · {course.duration}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(course)} className="p-1.5 rounded-lg hover:theme-hover theme-text-muted hover:theme-text">
                      <FiEdit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(course._id)} className="p-1.5 rounded-lg hover:bg-rose-500/10 theme-text-muted hover:text-rose-400">
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-xs px-2 py-0.5 rounded-lg theme-subtle theme-text-muted">{course.domain}</span>
                  <span className="text-xs px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-400">{course.difficulty}</span>
                  {course.creditPoints > 0 && <span className="text-xs px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400">{course.creditPoints} Credits</span>}
                  <span className={`text-xs px-2 py-0.5 rounded-lg ${course.status === 'published' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    {course.status}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2 text-xs theme-text-muted">
                  <span>{(course.resources || []).length} resources · {(course.modules || []).length} modules</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editingCourse ? 'Edit Course' : 'Add Course'} size="xl">
        <div className="flex gap-2 mb-5 border-b theme-border pb-3">
          {[
            { key: 'details', label: 'Details' },
            { key: 'content', label: 'Content' },
            { key: 'resources', label: `Resources (${form.resources.length})` },
          ].map(s => (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeSection === s.key
                  ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/25'
                  : 'theme-text-muted hover:theme-text'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {activeSection === 'details' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs theme-text-muted mb-1.5">Title</label>
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                className="w-full theme-subtle border border-white/[0.08] rounded-xl px-3 py-2 text-sm theme-text placeholder-slate-600 focus:outline-none focus:theme-border-light transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs theme-text-muted mb-1.5">Domain</label>
              <select value={form.domain} onChange={e => setForm({...form, domain: e.target.value})}
                className="w-full theme-subtle border border-white/[0.08] rounded-xl px-3 py-2 text-sm theme-text focus:outline-none focus:theme-border-light transition-colors">
                {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs theme-text-muted mb-1.5">Type</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                className="w-full theme-subtle border border-white/[0.08] rounded-xl px-3 py-2 text-sm theme-text focus:outline-none focus:theme-border-light transition-colors">
                <option value="elective">Elective</option>
                <option value="mandatory">Mandatory</option>
                <option value="co-curricular">Co-curricular</option>
              </select>
            </div>
            <div>
              <label className="block text-xs theme-text-muted mb-1.5">Credit Points</label>
              <input type="number" value={form.creditPoints} onChange={e => setForm({...form, creditPoints: +e.target.value})}
                className="w-full theme-subtle border border-white/[0.08] rounded-xl px-3 py-2 text-sm theme-text focus:outline-none focus:theme-border-light transition-colors" />
            </div>
            <div>
              <label className="block text-xs theme-text-muted mb-1.5">Difficulty</label>
              <select value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value})}
                className="w-full theme-subtle border border-white/[0.08] rounded-xl px-3 py-2 text-sm theme-text focus:outline-none focus:theme-border-light transition-colors">
                {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs theme-text-muted mb-1.5">Instructor</label>
              <input value={form.instructor} onChange={e => setForm({...form, instructor: e.target.value})}
                className="w-full theme-subtle border border-white/[0.08] rounded-xl px-3 py-2 text-sm theme-text placeholder-slate-600 focus:outline-none focus:theme-border-light transition-colors" />
            </div>
            <div>
              <label className="block text-xs theme-text-muted mb-1.5">Duration</label>
              <input value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} placeholder="e.g. 12 weeks"
                className="w-full theme-subtle border border-white/[0.08] rounded-xl px-3 py-2 text-sm theme-text placeholder-slate-600 focus:outline-none focus:theme-border-light transition-colors" />
            </div>
            <div>
              <label className="block text-xs theme-text-muted mb-1.5">Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
                className="w-full theme-subtle border border-white/[0.08] rounded-xl px-3 py-2 text-sm theme-text focus:outline-none focus:theme-border-light transition-colors">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
        )}

        {activeSection === 'content' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold theme-text">Modules & Lessons</h3>
              <button onClick={addModule}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-400 text-xs font-medium border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors">
                <FiPlus size={12} /> Add Module
              </button>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {form.modules.map((mod, mi) => (
                <div key={mi} className="theme-subtle rounded-xl p-3 border theme-border">
                  <div className="flex items-center gap-2">
                    <input value={mod.title} onChange={e => updateModule(mi, e.target.value)}
                      placeholder="Module title (e.g. Module 1: Algebra)"
                      className="flex-1 theme-subtle border border-white/[0.08] rounded-lg px-2 py-1.5 text-xs theme-text placeholder-slate-600 focus:outline-none focus:theme-border-light transition-colors"
                    />
                    <button onClick={() => setExpandedModules(prev => prev.includes(mi) ? prev.filter(i => i !== mi) : [...prev, mi])}
                      className="p-1 theme-text-muted hover:theme-text">
                      {expandedModules.includes(mi) ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                    </button>
                    <button onClick={() => removeModule(mi)} className="p-1 text-rose-400 hover:text-rose-300">
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                  {expandedModules.includes(mi) && (
                    <div className="mt-2 pl-3 space-y-1.5 border-l theme-border">
                      {mod.lessons.map((les, li) => (
                        <div key={li} className="flex items-center gap-1.5">
                          <input value={les.title} onChange={e => updateLesson(mi, li, 'title', e.target.value)}
                            placeholder="Lesson title"
                            className="flex-1 theme-subtle border border-white/[0.08] rounded-lg px-2 py-1 text-xs theme-text placeholder-slate-600 focus:outline-none focus:theme-border-light transition-colors"
                          />
                          <input value={les.videoUrl} onChange={e => updateLesson(mi, li, 'videoUrl', e.target.value)}
                            placeholder="YouTube URL"
                            className="w-40 theme-subtle border border-white/[0.08] rounded-lg px-2 py-1 text-xs theme-text placeholder-slate-600 focus:outline-none focus:theme-border-light transition-colors"
                          />
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
                <p className="text-xs theme-text-muted text-center py-6">No modules yet. Click "Add Module" to create course content.</p>
              )}
            </div>
          </div>
        )}

        {activeSection === 'resources' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold theme-text">Course Resources & Materials</h3>
              <button onClick={openAddResource}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-400 text-xs font-medium border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors">
                <FiPlus size={12} /> Add Resource
              </button>
            </div>

            {form.resources.length > 0 ? (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {form.resources.map((r, idx) => {
                  const Icon = resourceTypeIcons[r.type] || FiFile;
                  return (
                    <div key={idx} className="theme-subtle border theme-border rounded-xl p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                          <Icon className="text-indigo-400" size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium theme-text truncate">{r.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] px-1.5 py-0.5 rounded theme-subtle theme-text-muted uppercase">{r.type}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${visibilityColors[r.visibility] || visibilityColors.students}`}>
                              {r.visibility}
                            </span>
                            {r.fileUrl && <span className="text-[10px] theme-text-muted truncate max-w-[120px]">{getFileName(r.fileUrl)}</span>}
                            {r.externalUrl && <span className="text-[10px] theme-text-muted truncate max-w-[120px]">External link</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => moveResource(idx, -1)} disabled={idx === 0}
                            className="p-1 theme-text-muted hover:theme-text disabled:opacity-30">
                            <FiChevronUp size={14} />
                          </button>
                          <button onClick={() => moveResource(idx, 1)} disabled={idx === form.resources.length - 1}
                            className="p-1 theme-text-muted hover:theme-text disabled:opacity-30">
                            <FiChevronDown size={14} />
                          </button>
                          <button onClick={() => openEditResource(idx)}
                            className="p-1 theme-text-muted hover:text-indigo-400">
                            <FiEdit2 size={13} />
                          </button>
                          <button onClick={() => handleDeleteResource(idx)}
                            className="p-1 theme-text-muted hover:text-rose-400">
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-white/[0.08] rounded-xl">
                <div className="w-12 h-12 rounded-xl theme-subtle flex items-center justify-center mb-3">
                  <FiUpload className="theme-text-muted" size={20} />
                </div>
                <p className="text-sm theme-text-muted">No resources added yet</p>
                <p className="text-xs text-slate-500 mt-1">Upload files or add external links for students</p>
              </div>
            )}
          </div>
        )}

        <button onClick={handleSave} disabled={saveLoading}
          className="mt-5 w-full py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
          {saveLoading ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
          ) : (
            <><FiSave size={15} /> {editingCourse ? 'Update Course' : 'Create Course'}</>
          )}
        </button>
      </Modal>

      <Modal isOpen={resourceFormOpen} onClose={() => setResourceFormOpen(false)} title={editingResourceIdx !== null ? 'Edit Resource' : 'Add Resource'} size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-xs theme-text-muted mb-1.5">Resource Title</label>
            <input value={resourceForm.title} onChange={e => setResourceForm(prev => ({...prev, title: e.target.value}))}
              placeholder="e.g. Module 1 Notes"
              className="w-full theme-subtle border border-white/[0.08] rounded-xl px-3 py-2 text-sm theme-text placeholder-slate-600 focus:outline-none focus:theme-border-light transition-colors" />
            {resourceErrors.title && <p className="text-rose-400 text-xs mt-1">{resourceErrors.title}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs theme-text-muted mb-1.5">Resource Type</label>
              <select value={resourceForm.type} onChange={e => setResourceForm(prev => ({...prev, type: e.target.value}))}
                className="w-full theme-subtle border border-white/[0.08] rounded-xl px-3 py-2 text-sm theme-text focus:outline-none focus:theme-border-light transition-colors">
                {RESOURCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs theme-text-muted mb-1.5">Visibility</label>
              <select value={resourceForm.visibility} onChange={e => setResourceForm(prev => ({...prev, visibility: e.target.value}))}
                className="w-full theme-subtle border border-white/[0.08] rounded-xl px-3 py-2 text-sm theme-text focus:outline-none focus:theme-border-light transition-colors">
                {VISIBILITY_OPTIONS.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs theme-text-muted mb-1.5">Description (optional)</label>
            <textarea value={resourceForm.description} onChange={e => setResourceForm(prev => ({...prev, description: e.target.value}))}
              placeholder="Brief description of this resource..."
              rows={2}
              className="w-full theme-subtle border border-white/[0.08] rounded-xl px-3 py-2 text-sm theme-text placeholder-slate-600 focus:outline-none focus:theme-border-light transition-colors resize-none" />
          </div>

          <div>
            <label className="block text-xs theme-text-muted mb-1.5">File Upload</label>
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('resource-file-input').click()}
              className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                dragOver ? 'border-indigo-400 bg-indigo-500/5' : 'border-white/[0.08] hover:border-white/[0.15]'
              }`}
            >
              <input id="resource-file-input" type="file" className="hidden" onChange={handleFileInput} />
              {uploadingFile ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs theme-text-muted">Uploading...</p>
                </div>
              ) : resourceForm.fileUrl ? (
                <div className="flex flex-col items-center gap-1">
                  <FiFile className="text-indigo-400" size={20} />
                  <p className="text-xs text-indigo-400 font-medium">{getFileName(resourceForm.fileUrl)}</p>
                  <p className="text-[10px] theme-text-muted">Drag & drop or click to replace</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <FiUpload className="theme-text-muted" size={20} />
                  <p className="text-xs theme-text-muted">Drag & drop a file here, or click to browse</p>
                  <p className="text-[10px] text-slate-500">PDF, DOC, PPT, XLS, ZIP, Images, Video, Audio (max 100MB)</p>
                </div>
              )}
            </div>
            {resourceErrors.file && <p className="text-rose-400 text-xs mt-1">{resourceErrors.file}</p>}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px theme-hover" />
            <span className="text-xs theme-text-muted">OR</span>
            <div className="flex-1 h-px theme-hover" />
          </div>

          <div>
            <label className="block text-xs theme-text-muted mb-1.5">External URL</label>
            <div className="relative">
              <FiLink className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted" size={14} />
              <input value={resourceForm.externalUrl} onChange={e => setResourceForm(prev => ({...prev, externalUrl: e.target.value}))}
                placeholder="https://youtube.com/... or https://drive.google.com/..."
                className="w-full theme-subtle border border-white/[0.08] rounded-xl pl-9 pr-3 py-2 text-sm theme-text placeholder-slate-600 focus:outline-none focus:theme-border-light transition-colors" />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Supported: YouTube, Google Drive, OneDrive, GitHub, websites, research papers, docs</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => setResourceFormOpen(false)}
              className="flex-1 py-2 rounded-xl border border-white/[0.08] text-sm theme-text-muted hover:theme-text hover:theme-subtle transition-colors">
              Cancel
            </button>
            <button onClick={handleSaveResource}
              className="flex-1 py-2 rounded-xl bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-400 transition-colors">
              {editingResourceIdx !== null ? 'Update Resource' : 'Add Resource'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ManageCourses;
