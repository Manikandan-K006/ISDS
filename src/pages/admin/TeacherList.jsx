import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiX, FiEdit2, FiTrash2, FiChevronRight, FiUsers } from 'react-icons/fi';
import API from '../../api/client';
import { PageSkeleton } from '../../components/shared/LoadingSkeleton';
import { Modal, Button, Input } from '../../components/ui';

const getStatusStyle = (isActive) => {
  if (isActive) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
};

const TeacherList = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', subject: '', employeeId: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setLoading(true);
    API.get('/admin/users', { params: { role: 'teacher', page, limit: 20, search: search || undefined } })
      .then(res => {
        setTeachers(res.data?.users || []);
        setTotal(res.data?.total || 0);
        setTotalPages(res.data?.totalPages || 1);
      })
      .catch(() => setTeachers([]))
      .finally(() => setLoading(false));
  }, [search, page]);

  const openEdit = (t) => {
    setEditing(t);
    setForm({ name: t.name || '', email: t.email || '', subject: t.subject || '', employeeId: t.employeeId || '' });
    setEditOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await API.put(`/admin/users/${editing.id}`, form);
      if (data?.user) {
        setTeachers(prev => prev.map(t => t.id === data.user.id ? { ...t, ...data.user } : t));
      }
      setEditOpen(false);
      setEditing(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = (t) => {
    if (!window.confirm(`Deactivate ${t.name}?`)) return;
    API.delete(`/admin/users/${t.id}`)
      .then(() => setTeachers(prev => prev.filter(x => x.id !== t.id)))
      .catch(console.error);
  };

  if (loading) return <PageSkeleton />;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="gradient-hero rounded-2xl p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 theme-input rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 theme-input rounded-full translate-y-24 -translate-x-24" />
        <div className="relative">
          <h1 className="text-2xl lg:text-3xl font-bold theme-text font-heading">Teachers</h1>
          <p className="theme-text mt-1">Manage teaching staff accounts and details</p>
        </div>
      </motion.div>

      <div className="relative">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 theme-text-muted" size={16} />
        <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
          placeholder="Search by name, email, or employee ID..."
          className="w-full theme-card border theme-border rounded-xl pl-10 pr-10 py-2.5 text-sm theme-text placeholder-theme-muted focus:outline-none focus:border-indigo-500/50 transition-colors"
        />
        {searchInput && (
          <button onClick={() => setSearchInput('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 theme-text-muted hover:theme-text">
            <FiX size={16} />
          </button>
        )}
      </div>

      {teachers.length === 0 ? (
        <div className="theme-card border theme-border rounded-2xl p-12 text-center">
          <FiUsers className="mx-auto theme-text-muted mb-3" size={40} />
          <p className="theme-text-muted text-lg">No teachers found</p>
          <p className="theme-text-muted text-sm mt-1">Teachers will appear here once they register.</p>
        </div>
      ) : (
        <>
          <div className="hidden lg:block theme-card border theme-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b theme-border">
                    <th className="p-3 pl-5 text-left text-xs theme-text-muted font-medium uppercase tracking-wider">Teacher</th>
                    <th className="p-3 text-left text-xs theme-text-muted font-medium uppercase tracking-wider">Subject</th>
                    <th className="p-3 text-left text-xs theme-text-muted font-medium uppercase tracking-wider">Employee ID</th>
                    <th className="p-3 text-left text-xs theme-text-muted font-medium uppercase tracking-wider">Status</th>
                    <th className="p-3 text-left text-xs theme-text-muted font-medium uppercase tracking-wider">Joined</th>
                    <th className="p-3 w-24" />
                  </tr>
                </thead>
                <tbody>
                  {teachers.map((t, i) => (
                    <motion.tr key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                      className="border-b theme-border hover:theme-subtle transition-colors"
                    >
                      <td className="p-3 pl-5">
                        <div className="flex items-center gap-3">
                          {t.profilePhoto ? (
                            <img src={t.profilePhoto} alt={t.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center shrink-0">
                              <span className="text-xs font-bold text-indigo-400">{t.name?.split(' ').map(n => n[0]).join('')}</span>
                            </div>
                          )}
                          <div>
                            <p className="text-sm theme-text font-medium">{t.name}</p>
                            <p className="text-xs theme-text-muted">{t.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-sm theme-text">{t.subject || 'N/A'}</span>
                      </td>
                      <td className="p-3">
                        <span className="text-sm theme-text font-mono">{t.employeeId || 'N/A'}</span>
                      </td>
                      <td className="p-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${getStatusStyle(t.isActive)}`}>
                          {t.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-xs theme-text-muted">{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'N/A'}</span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(t)}
                            className="flex items-center justify-center w-8 h-8 rounded-lg theme-text-muted hover:text-indigo-400 hover:theme-hover transition-colors">
                            <FiEdit2 size={15} />
                          </button>
                          <button onClick={() => handleDeactivate(t)}
                            className="flex items-center justify-center w-8 h-8 rounded-lg theme-text-muted hover:text-rose-400 hover:theme-hover transition-colors">
                            <FiTrash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:hidden space-y-3">
            {teachers.map((t, i) => (
              <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="theme-card border theme-border rounded-2xl p-4 hover:theme-border-light transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {t.profilePhoto ? (
                      <img src={t.profilePhoto} alt={t.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-indigo-400">{t.name?.split(' ').map(n => n[0]).join('')}</span>
                      </div>
                    )}
                    <div>
                      <p className="text-sm theme-text font-medium">{t.name}</p>
                      <p className="text-xs theme-text-muted">{t.email}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getStatusStyle(t.isActive)}`}>
                    {t.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-3 text-center">
                  <div className="theme-subtle rounded-xl p-2">
                    <p className="text-[10px] theme-text-muted mb-0.5">Subject</p>
                    <p className="text-sm theme-text font-medium">{t.subject || 'N/A'}</p>
                  </div>
                  <div className="theme-subtle rounded-xl p-2">
                    <p className="text-[10px] theme-text-muted mb-0.5">Employee ID</p>
                    <p className="text-sm theme-text font-medium font-mono">{t.employeeId || 'N/A'}</p>
                  </div>
                  <div className="theme-subtle rounded-xl p-2">
                    <p className="text-[10px] theme-text-muted mb-0.5">Joined</p>
                    <p className="text-sm theme-text font-medium">{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => openEdit(t)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg theme-subtle theme-text text-xs font-medium hover:bg-[var(--hover)] transition-colors">
                    <FiEdit2 size={13} /> Edit
                  </button>
                  <button onClick={() => handleDeactivate(t)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 text-xs font-medium hover:bg-rose-500/20 transition-colors">
                    <FiTrash2 size={13} /> Deactivate
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs theme-text-muted">
            <span>Showing {teachers.length} of {total} teachers</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg theme-card border theme-border hover:bg-[var(--hover)] disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                <FiChevronRight size={14} className="rotate-180" /> Prev
              </button>
              <span>Page {page} of {Math.max(1, totalPages)}</span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= totalPages}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg theme-card border theme-border hover:bg-[var(--hover)] disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                Next <FiChevronRight size={14} />
              </button>
            </div>
          </div>
        </>
      )}

      <Modal open={editOpen} onClose={() => { setEditOpen(false); setEditing(null); }} size="md">
        <div className="p-6">
          <h2 className="text-lg font-semibold theme-text mb-4">Edit Teacher</h2>
          <div className="space-y-4">
            <Input label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <Input label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <Input label="Subject" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
            <Input label="Employee ID" value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="ghost" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button loading={saving} onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TeacherList;
