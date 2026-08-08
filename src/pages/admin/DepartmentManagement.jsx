import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiUsers, FiBookOpen, FiShield, FiCalendar } from 'react-icons/fi';
import API from '../../api/client';
import { PageSkeleton } from '../../components/shared/LoadingSkeleton';
import { Modal, Button, Input } from '../../components/ui';

const TABS = [
  { key: 'departments', label: 'Departments', icon: FiShield },
  { key: 'programs', label: 'Programs', icon: FiBookOpen },
  { key: 'semesters', label: 'Semesters', icon: FiCalendar },
];

const EMPTY_DEPT = { name: '', code: '', description: '' };
const EMPTY_PROGRAM = { name: '', code: '', departmentId: '', level: 'UG', durationYears: '4', creditsRequired: '' };
const EMPTY_SEMESTER = { programId: '', number: '', name: '', startDate: '', endDate: '', isActive: true };

const DepartmentManagement = () => {
  const [tab, setTab] = useState('departments');
  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);

  const [deptModal, setDeptModal] = useState(false);
  const [deptEditing, setDeptEditing] = useState(null);
  const [deptForm, setDeptForm] = useState({ ...EMPTY_DEPT });
  const [saving, setSaving] = useState(false);

  const [progModal, setProgModal] = useState(false);
  const [progEditing, setProgEditing] = useState(null);
  const [progForm, setProgForm] = useState({ ...EMPTY_PROGRAM });
  const [progSaving, setProgSaving] = useState(false);

  const [semModal, setSemModal] = useState(false);
  const [semEditing, setSemEditing] = useState(null);
  const [semForm, setSemForm] = useState({ ...EMPTY_SEMESTER });
  const [semSaving, setSemSaving] = useState(false);

  const loadAll = () => {
    setLoading(true);
    Promise.all([
      API.get('/admin/departments').then(r => r.data?.departments || []).catch(() => []),
      API.get('/admin/programs').then(r => r.data?.programs || []).catch(() => []),
      API.get('/admin/semesters').then(r => r.data?.semesters || []).catch(() => []),
    ])
      .then(([d, p, s]) => { setDepartments(d); setPrograms(p); setSemesters(s); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadAll(); }, []);

  if (loading) return <PageSkeleton />;

  const saveDept = async () => {
    setSaving(true);
    try {
      if (deptEditing) {
        const { data } = await API.put(`/admin/departments/${deptEditing.id}`, deptForm);
        setDepartments(prev => prev.map(d => d.id === data.department.id ? { ...d, ...data.department } : d));
      } else {
        const { data } = await API.post('/admin/departments', deptForm);
        setDepartments(prev => [...prev, data.department]);
      }
      setDeptModal(false); setDeptEditing(null); setDeptForm({ ...EMPTY_DEPT });
    } catch (err) { console.error(err); } finally { setSaving(false); }
  };

  const deleteDept = (d) => {
    if (!window.confirm(`Delete department "${d.name}"?`)) return;
    API.delete(`/admin/departments/${d.id}`).then(() => setDepartments(prev => prev.filter(x => x.id !== d.id))).catch(console.error);
  };

  const saveProgram = async () => {
    setProgSaving(true);
    try {
      if (progEditing) {
        const { data } = await API.put(`/admin/programs/${progEditing.id}`, progForm);
        setPrograms(prev => prev.map(p => p.id === data.program.id ? { ...p, ...data.program } : p));
      } else {
        const { data } = await API.post('/admin/programs', progForm);
        setPrograms(prev => [...prev, data.program]);
      }
      setProgModal(false); setProgEditing(null); setProgForm({ ...EMPTY_PROGRAM });
    } catch (err) { console.error(err); } finally { setProgSaving(false); }
  };

  const deleteProgram = (p) => {
    if (!window.confirm(`Delete program "${p.name}"?`)) return;
    API.delete(`/admin/programs/${p.id}`).then(() => setPrograms(prev => prev.filter(x => x.id !== p.id))).catch(console.error);
  };

  const saveSemester = async () => {
    setSemSaving(true);
    try {
      const payload = { ...semForm, isActive: semForm.isActive };
      if (semEditing) {
        const { data } = await API.put(`/admin/semesters/${semEditing.id}`, payload);
        setSemesters(prev => prev.map(s => s.id === data.semester.id ? { ...s, ...data.semester } : s));
      } else {
        const { data } = await API.post('/admin/semesters', payload);
        setSemesters(prev => [...prev, data.semester]);
      }
      setSemModal(false); setSemEditing(null); setSemForm({ ...EMPTY_SEMESTER });
    } catch (err) { console.error(err); } finally { setSemSaving(false); }
  };

  const deleteSemester = (s) => {
    if (!window.confirm(`Delete semester ${s.number} of ${s.program?.name}?`)) return;
    API.delete(`/admin/semesters/${s.id}`).then(() => setSemesters(prev => prev.filter(x => x.id !== s.id))).catch(console.error);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="gradient-hero rounded-2xl p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 theme-input rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 theme-input rounded-full translate-y-24 -translate-x-24" />
        <div className="relative">
          <h1 className="text-2xl lg:text-3xl font-bold theme-text font-heading">Departments & Programs</h1>
          <p className="theme-text mt-1">Manage departments, degree programs, and semester schedules</p>
        </div>
      </motion.div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-1 theme-card border theme-border rounded-xl p-1">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors ${tab === t.key ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/20' : 'theme-text-muted hover:theme-text'}`}>
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>
        {tab === 'departments' && (
          <button onClick={() => { setDeptEditing(null); setDeptForm({ ...EMPTY_DEPT }); setDeptModal(true); }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl gradient-accent theme-text text-sm font-medium transition-all">
            <FiPlus size={16} /> Add Department
          </button>
        )}
        {tab === 'programs' && (
          <button onClick={() => { setProgEditing(null); setProgForm({ ...EMPTY_PROGRAM }); setProgModal(true); }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl gradient-accent theme-text text-sm font-medium transition-all">
            <FiPlus size={16} /> Add Program
          </button>
        )}
        {tab === 'semesters' && (
          <button onClick={() => { setSemEditing(null); setSemForm({ ...EMPTY_SEMESTER }); setSemModal(true); }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl gradient-accent theme-text text-sm font-medium transition-all">
            <FiPlus size={16} /> Add Semester
          </button>
        )}
      </div>

      {tab === 'departments' && (
        departments.length === 0 ? (
          <div className="theme-card border theme-border rounded-2xl p-12 text-center">
            <FiShield className="mx-auto theme-text-muted mb-3" size={40} />
            <p className="theme-text-muted text-lg">No departments found</p>
            <p className="theme-text-muted text-sm mt-1">Create your first department to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {departments.map((d, i) => (
              <motion.div key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="theme-card border theme-border rounded-2xl p-5 card-shadow-premium hover:border-indigo-500/30 transition-all">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                      <FiShield className="text-indigo-400" size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold theme-text">{d.name}</h3>
                      <span className="inline-block mt-0.5 text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">{d.code}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setDeptEditing(d); setDeptForm({ name: d.name || '', code: d.code || '', description: d.description || '' }); setDeptModal(true); }}
                      className="flex items-center justify-center w-8 h-8 rounded-lg theme-text-muted hover:text-indigo-400 hover:theme-hover transition-colors"><FiEdit2 size={15} /></button>
                    <button onClick={() => deleteDept(d)}
                      className="flex items-center justify-center w-8 h-8 rounded-lg theme-text-muted hover:text-rose-400 hover:theme-hover transition-colors"><FiTrash2 size={15} /></button>
                  </div>
                </div>
                <p className="text-sm theme-text-muted line-clamp-3 mb-4">{d.description || 'No description'}</p>
                <div className="flex items-center justify-between pt-3 border-t theme-border text-xs theme-text-muted">
                  <span className="flex items-center gap-1"><FiUsers size={12} /> {d._count?.users || 0} users</span>
                  <span className="flex items-center gap-1"><FiBookOpen size={12} /> {d._count?.programs || 0} programs</span>
                </div>
              </motion.div>
            ))}
          </div>
        )
      )}

      {tab === 'programs' && (
        programs.length === 0 ? (
          <div className="theme-card border theme-border rounded-2xl p-12 text-center">
            <FiBookOpen className="mx-auto theme-text-muted mb-3" size={40} />
            <p className="theme-text-muted text-lg">No programs found</p>
            <p className="theme-text-muted text-sm mt-1">Add degree programs to departments.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {programs.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="theme-card border theme-border rounded-2xl p-5 card-shadow-premium hover:border-indigo-500/30 transition-all">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                      <FiBookOpen className="text-purple-400" size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold theme-text">{p.name}</h3>
                      <span className="inline-block mt-0.5 text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">{p.code}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setProgEditing(p); setProgForm({ name: p.name || '', code: p.code || '', departmentId: p.departmentId || '', level: p.level || 'UG', durationYears: p.durationYears || '', creditsRequired: p.creditsRequired != null ? p.creditsRequired : '' }); setProgModal(true); }}
                      className="flex items-center justify-center w-8 h-8 rounded-lg theme-text-muted hover:text-indigo-400 hover:theme-hover transition-colors"><FiEdit2 size={15} /></button>
                    <button onClick={() => deleteProgram(p)}
                      className="flex items-center justify-center w-8 h-8 rounded-lg theme-text-muted hover:text-rose-400 hover:theme-hover transition-colors"><FiTrash2 size={15} /></button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs theme-text-muted mb-4">
                  <span className="px-2 py-0.5 rounded-full bg-[var(--hover)]">{p.department?.name || '—'}</span>
                  <span className="px-2 py-0.5 rounded-full bg-[var(--hover)]">{p.level}</span>
                  {p.durationYears && <span className="px-2 py-0.5 rounded-full bg-[var(--hover)]">{p.durationYears} years</span>}
                  {p.creditsRequired && <span className="px-2 py-0.5 rounded-full bg-[var(--hover)]">{p.creditsRequired} credits</span>}
                </div>
                <div className="flex items-center justify-between pt-3 border-t theme-border text-xs theme-text-muted">
                  <span className="flex items-center gap-1"><FiUsers size={12} /> {p._count?.users || 0} students</span>
                  <span className="flex items-center gap-1"><FiCalendar size={12} /> {p._count?.semesters || 0} semesters</span>
                </div>
              </motion.div>
            ))}
          </div>
        )
      )}

      {tab === 'semesters' && (
        semesters.length === 0 ? (
          <div className="theme-card border theme-border rounded-2xl p-12 text-center">
            <FiCalendar className="mx-auto theme-text-muted mb-3" size={40} />
            <p className="theme-text-muted text-lg">No semesters found</p>
            <p className="theme-text-muted text-sm mt-1">Add semester schedules for each program.</p>
          </div>
        ) : (
          <div className="theme-card border theme-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b theme-border">
                    <th className="p-3 pl-5 text-left text-xs theme-text-muted font-medium uppercase tracking-wider">Program</th>
                    <th className="p-3 text-left text-xs theme-text-muted font-medium uppercase tracking-wider">Semester</th>
                    <th className="p-3 text-left text-xs theme-text-muted font-medium uppercase tracking-wider">Dates</th>
                    <th className="p-3 text-left text-xs theme-text-muted font-medium uppercase tracking-wider">Status</th>
                    <th className="p-3 w-24" />
                  </tr>
                </thead>
                <tbody>
                  {semesters.map((s, i) => (
                    <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                      className="border-b theme-border hover:theme-subtle transition-colors">
                      <td className="p-3 pl-5">
                        <span className="text-sm theme-text font-medium">{s.program?.name || '—'}</span>
                        {s.program?.code && <span className="text-xs theme-text-muted ml-2 font-mono">{s.program.code}</span>}
                      </td>
                      <td className="p-3">
                        <span className="text-sm theme-text">Semester {s.number}</span>
                        {s.name && <span className="text-xs theme-text-muted ml-2">{s.name}</span>}
                      </td>
                      <td className="p-3">
                        <span className="text-xs theme-text-muted">
                          {s.startDate ? new Date(s.startDate).toLocaleDateString() : '—'} → {s.endDate ? new Date(s.endDate).toLocaleDateString() : '—'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${s.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-[var(--hover)] theme-text-muted'}`}>
                          {s.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => { setSemEditing(s); setSemForm({ programId: s.programId || '', number: s.number != null ? s.number : '', name: s.name || '', startDate: s.startDate ? s.startDate.slice(0, 10) : '', endDate: s.endDate ? s.endDate.slice(0, 10) : '', isActive: !!s.isActive }); setSemModal(true); }}
                            className="flex items-center justify-center w-8 h-8 rounded-lg theme-text-muted hover:text-indigo-400 hover:theme-hover transition-colors"><FiEdit2 size={15} /></button>
                          <button onClick={() => deleteSemester(s)}
                            className="flex items-center justify-center w-8 h-8 rounded-lg theme-text-muted hover:text-rose-400 hover:theme-hover transition-colors"><FiTrash2 size={15} /></button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      <Modal open={deptModal} onClose={() => { setDeptModal(false); setDeptEditing(null); }} size="md">
        <div className="p-6">
          <h2 className="text-lg font-semibold theme-text mb-4">{deptEditing ? 'Edit Department' : 'Add Department'}</h2>
          <div className="space-y-4">
            <Input label="Name" value={deptForm.name} onChange={e => setDeptForm({ ...deptForm, name: e.target.value })} placeholder="e.g. Computer Science" />
            <Input label="Code" value={deptForm.code} onChange={e => setDeptForm({ ...deptForm, code: e.target.value })} placeholder="e.g. CS" />
            <Input label="Description" value={deptForm.description} onChange={e => setDeptForm({ ...deptForm, description: e.target.value })} placeholder="Brief description of the department" />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="ghost" onClick={() => { setDeptModal(false); setDeptEditing(null); }}>Cancel</Button>
            <Button loading={saving} onClick={saveDept}>{deptEditing ? 'Save Changes' : 'Add Department'}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={progModal} onClose={() => { setProgModal(false); setProgEditing(null); }} size="md">
        <div className="p-6">
          <h2 className="text-lg font-semibold theme-text mb-4">{progEditing ? 'Edit Program' : 'Add Program'}</h2>
          <div className="space-y-4">
            <Input label="Name" value={progForm.name} onChange={e => setProgForm({ ...progForm, name: e.target.value })} placeholder="e.g. B.Tech in Computer Science" />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Code" value={progForm.code} onChange={e => setProgForm({ ...progForm, code: e.target.value })} placeholder="e.g. CSE" />
              <div>
                <label className="text-sm font-medium theme-text mb-1 block">Department</label>
                <select value={progForm.departmentId} onChange={e => setProgForm({ ...progForm, departmentId: e.target.value })}
                  className="w-full theme-input border theme-border rounded-xl px-4 py-2.5 text-sm theme-text focus:outline-none focus:border-indigo-500">
                  <option value="">Select department</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium theme-text mb-1 block">Level</label>
                <select value={progForm.level} onChange={e => setProgForm({ ...progForm, level: e.target.value })}
                  className="w-full theme-input border theme-border rounded-xl px-4 py-2.5 text-sm theme-text focus:outline-none focus:border-indigo-500">
                  <option value="UG">UG</option>
                  <option value="PG">PG</option>
                  <option value="Doctoral">Doctoral</option>
                  <option value="Diploma">Diploma</option>
                </select>
              </div>
              <Input label="Duration (years)" type="number" value={progForm.durationYears} onChange={e => setProgForm({ ...progForm, durationYears: e.target.value })} />
              <Input label="Credits Required" type="number" value={progForm.creditsRequired} onChange={e => setProgForm({ ...progForm, creditsRequired: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="ghost" onClick={() => { setProgModal(false); setProgEditing(null); }}>Cancel</Button>
            <Button loading={progSaving} onClick={saveProgram}>{progEditing ? 'Save Changes' : 'Add Program'}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={semModal} onClose={() => { setSemModal(false); setSemEditing(null); }} size="md">
        <div className="p-6">
          <h2 className="text-lg font-semibold theme-text mb-4">{semEditing ? 'Edit Semester' : 'Add Semester'}</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium theme-text mb-1 block">Program</label>
              <select value={semForm.programId} onChange={e => setSemForm({ ...semForm, programId: e.target.value })}
                className="w-full theme-input border theme-border rounded-xl px-4 py-2.5 text-sm theme-text focus:outline-none focus:border-indigo-500">
                <option value="">Select program</option>
                {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Semester Number" type="number" value={semForm.number} onChange={e => setSemForm({ ...semForm, number: e.target.value })} />
              <Input label="Name (optional)" value={semForm.name} onChange={e => setSemForm({ ...semForm, name: e.target.value })} placeholder="e.g. Odd Semester" />
              <Input label="Start Date" type="date" value={semForm.startDate} onChange={e => setSemForm({ ...semForm, startDate: e.target.value })} />
              <Input label="End Date" type="date" value={semForm.endDate} onChange={e => setSemForm({ ...semForm, endDate: e.target.value })} />
            </div>
            <label className="flex items-center gap-2 text-sm theme-text">
              <input type="checkbox" checked={semForm.isActive} onChange={e => setSemForm({ ...semForm, isActive: e.target.checked })} className="rounded theme-border-light theme-input text-indigo-500 focus:ring-indigo-500/30" />
              Active semester
            </label>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="ghost" onClick={() => { setSemModal(false); setSemEditing(null); }}>Cancel</Button>
            <Button loading={semSaving} onClick={saveSemester}>{semEditing ? 'Save Changes' : 'Add Semester'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DepartmentManagement;
