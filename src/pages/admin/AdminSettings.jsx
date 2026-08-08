import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiSettings } from 'react-icons/fi';
import API from '../../api/client';
import { PageSkeleton } from '../../components/shared/LoadingSkeleton';
import { Modal, Button, Input } from '../../components/ui';

const EMPTY_FORM = { key: '', value: '', category: 'General' };

const parseValue = (v) => {
  const trimmed = v.trim();
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (trimmed === 'null') return null;
  if (trimmed !== '' && !isNaN(trimmed)) return Number(trimmed);
  return v;
};

const displayValue = (v) => {
  if (v === null || v === undefined) return '\u2014';
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  return String(v);
};

const AdminSettings = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    API.get('/admin/settings')
      .then(res => setSettings(res.data?.settings || []))
      .catch(() => setSettings([]))
      .finally(() => setLoading(false));
  }, []);

  const grouped = {};
  settings.forEach(s => {
    const cat = s.category || 'General';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(s);
  });

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setModalOpen(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    setForm({ key: s.key || '', value: displayValue(s.value), category: s.category || 'General' });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        key: form.key.trim(),
        value: parseValue(form.value),
        category: form.category.trim() || 'General',
      };
      const { data } = await API.put('/admin/settings', payload);
      if (data?.setting) {
        const updated = data.setting;
        setSettings(prev => {
          const idx = prev.findIndex(s => s.key === updated.key);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = { ...next[idx], ...updated };
            return next;
          }
          return [...prev, updated];
        });
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

  if (loading) return <PageSkeleton />;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="gradient-hero rounded-2xl p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 theme-input rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 theme-input rounded-full translate-y-24 -translate-x-24" />
        <div className="relative">
          <h1 className="text-2xl lg:text-3xl font-bold theme-text font-heading">Settings</h1>
          <p className="theme-text mt-1">Configure system-wide settings and preferences</p>
        </div>
      </motion.div>

      <div className="flex items-center justify-between">
        <p className="text-sm theme-text-muted">{settings.length} setting{settings.length === 1 ? '' : 's'}</p>
        <button onClick={openAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl gradient-accent theme-text text-sm font-medium transition-all">
          <FiPlus size={16} /> Add Setting
        </button>
      </div>

      {settings.length === 0 ? (
        <div className="theme-card border theme-border rounded-2xl p-12 text-center">
          <FiSettings className="mx-auto theme-text-muted mb-3" size={40} />
          <p className="theme-text-muted text-lg">No settings found</p>
          <p className="theme-text-muted text-sm mt-1">System settings will appear here.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([category, items]) => (
          <div key={category}>
            <h2 className="text-card-subtitle theme-text mb-3">{category}</h2>
            <div className="space-y-3">
              {items.map((s, i) => (
                <motion.div key={s.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="theme-card border theme-border rounded-xl p-4 flex items-center justify-between gap-3 hover:theme-border-light transition-all"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium theme-text font-mono">{s.key}</p>
                    <p className="text-xs theme-text-muted mt-0.5 break-all">Value: {displayValue(s.value)}</p>
                    {s.updatedAt && (
                      <p className="text-[10px] theme-text-muted mt-0.5">Updated {new Date(s.updatedAt).toLocaleString()}</p>
                    )}
                  </div>
                  <button onClick={() => openEdit(s)}
                    className="flex items-center justify-center w-9 h-9 rounded-lg theme-subtle theme-text-muted hover:text-indigo-400 hover:bg-[var(--hover)] transition-colors flex-shrink-0">
                    <FiEdit2 size={15} />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        ))
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} size="md">
        <div className="p-6">
          <h2 className="text-lg font-semibold theme-text mb-4">{editing ? 'Edit Setting' : 'Add Setting'}</h2>
          <div className="space-y-4">
            <Input label="Key" value={form.key} disabled={!!editing}
              onChange={e => setForm({ ...form, key: e.target.value })} placeholder="e.g. maxUploadSize" />
            <Input label="Value" value={form.value}
              onChange={e => setForm({ ...form, value: e.target.value })}
              placeholder="String, number, or true/false" hint="Stored as JSON. Type true/false for booleans, a number for numbers." />
            <Input label="Category" value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })} placeholder="e.g. General" />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="ghost" onClick={() => { setModalOpen(false); setEditing(null); }}>Cancel</Button>
            <Button loading={saving} onClick={handleSave}>{editing ? 'Save Changes' : 'Add Setting'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminSettings;
