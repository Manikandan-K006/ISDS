import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import API from '../../api/client';
import toast from 'react-hot-toast';
import { User, Mail, Phone, BookOpen } from 'lucide-react';

export default function StudentProfile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '', bio: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) setForm({ name: user.name || '', phone: user.phone || '', bio: user.bio || '' });
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await API.put('/students/profile', form);
      updateUser(data.user);
      toast.success('Profile updated');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-page-title theme-text">Profile</h1>
      <div className="theme-card rounded-2xl p-6 card-shadow">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full gradient-accent flex items-center justify-center text-2xl font-bold text-white">
            {user?.name?.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-semibold theme-text">{user?.name}</h2>
            <p className="text-sm theme-text-muted capitalize">{user?.role} • {user?.class}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium theme-text mb-1 block">Name</label>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              className="w-full px-4 py-2.5 rounded-xl theme-input border theme-border theme-text text-sm focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="text-sm font-medium theme-text mb-1 block">Phone</label>
            <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
              className="w-full px-4 py-2.5 rounded-xl theme-input border theme-border theme-text text-sm focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="text-sm font-medium theme-text mb-1 block">Bio</label>
            <textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} rows={3}
              className="w-full px-4 py-2.5 rounded-xl theme-input border theme-border theme-text text-sm focus:outline-none focus:border-indigo-500" />
          </div>
          <button onClick={handleSave} disabled={saving}
            className="px-6 py-2.5 rounded-xl gradient-accent text-white text-sm font-medium hover:opacity-90 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}