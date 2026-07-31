import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiUsers, FiBookOpen, FiShield } from 'react-icons/fi';
import API from '../../api/client';
import { PageSkeleton } from '../../components/shared/LoadingSkeleton';
import { Modal, Button, Input } from '../../components/ui';

const EMPTY_FORM = { name: '', code: '', description: '' };

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    API.get('/admin/departments')
      .then(res => setDepartments(res.data?.departments || []))
      .catch(() => setDepartments([]))
      .finally(() => setLoading(false));
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setModalOpen(true);
  };

  const openEdit = (d) => {
    setEditing(d);
    setForm({ name: d.name || '', code: d.code || '', description: d.description || '' });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        const { data } = await API.put(`/admin/departments/${editing.id}`, form);
        if (data?.department) {
          setDepartments(prev => prev.map(d => d.id === data.department.id ? { ...d, ...data.department } : d));
        }
      } else {
        const { data } = await API.post('/admin/departments', form);
        if (data?.department) {
          setDepartments(prev => [...prev, data.department]);
        }
      }
      setModalOpen(false);
      setEditing(null);
      setForm({ ...EMPTY_FORM });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (d) => {
    if (!window.confirm(`Delete department "${d.name}"?`)) return;
    API.delete(`/admin/departments/${d.id}`)
      .then(() => setDepartments(prev => prev.filter(x => x.id !== d.id)))
      .catch(console.error);
  };

  if (loading) return <PageSkeleton />;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="gradient-hero rounded-2xl p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 theme-input rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 theme-input rounded-full translate-y-24 -translate-x-24" />
        <div className="relative">
          <h1 className="text-2xl lg:text-3xl font-bold theme-text font-heading">Departments</h1>
          <p className="theme-text mt-1">Manage academic departments and their members</p>
        </div>
      </motion.div>

      <div className="flex items-center justify-between">
        <p className="text-sm theme-text-muted">{departments.length} department{departments.length === 1 ? '' : 's'}</p>
        <button onClick={openAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl gradient-accent theme-text text-sm font-medium transition-all">
          <FiPlus size={16} /> Add Department
        </button>
      </div>

      {departments.length === 0 ? (
        <div className="theme-card border theme-border rounded-2xl p-12 text-center">
          <FiShield className="mx-auto theme-text-muted mb-3" size={40} />
          <p className="theme-text-muted text-lg">No departments found</p>
          <p className="theme-text-muted text-sm mt-1">Create your first department to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {departments.map((d, i) => (
            <motion.div key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="theme-card border theme-border rounded-2xl p-5 card-shadow-premium hover:border-indigo-500/30 transition-all"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                    <FiShield className="text-indigo-400" size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold theme-text">{d.name}</h3>
                    <span className="inline-block mt-0.5 text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                      {d.code}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(d)}
                    className="flex items-center justify-center w-8 h-8 rounded-lg theme-text-muted hover:text-indigo-400 hover:theme-hover transition-colors">
                    <FiEdit2 size={15} />
                  </button>
                  <button onClick={() => handleDelete(d)}
                    className="flex items-center justify-center w-8 h-8 rounded-lg theme-text-muted hover:text-rose-400 hover:theme-hover transition-colors">
                    <FiTrash2 size={15} />
                  </button>
                </div>
              </div>
              <p className="text-sm theme-text-muted line-clamp-3 mb-4">{d.description || 'No description'}</p>
              <div className="flex items-center justify-between pt-3 border-t theme-border text-xs theme-text-muted">
                <span className="flex items-center gap-1"><FiUsers size={12} /> {d._count?.users || 0} users</span>
                <span className="flex items-center gap-1"><FiBookOpen size={12} /> {d._count?.courses || 0} courses</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} size="md">
        <div className="p-6">
          <h2 className="text-lg font-semibold theme-text mb-4">{editing ? 'Edit Department' : 'Add Department'}</h2>
          <div className="space-y-4">
            <Input label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Computer Science" />
            <Input label="Code" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="e.g. CS" />
            <Input label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Brief description of the department" />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="ghost" onClick={() => { setModalOpen(false); setEditing(null); }}>Cancel</Button>
            <Button loading={saving} onClick={handleSave}>{editing ? 'Save Changes' : 'Add Department'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DepartmentManagement;
