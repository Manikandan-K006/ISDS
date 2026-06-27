import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiAward, FiBookOpen, FiCalendar, FiTrendingUp,
  FiMail, FiEdit2, FiCheck, FiX, FiCamera,
  FiLock, FiEye, FiEyeOff, FiSave,
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { useStudentData } from '../../hooks/useStudentData';
import { getInitials, formatDate } from '../../utils/helpers';
import { Card, KpiCard, Button } from '../../components/ui';
import { PageSkeleton } from '../../components/shared/LoadingSkeleton';
import API from '../../api/client';
import toast from 'react-hot-toast';

const StudentProfile = () => {
  const { user } = useAuth();
  const { student, trophies, certificates, loading, error, refetch } = useStudentData();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  useEffect(() => {
    if (student) {
      setForm({
        name: student.name || '',
        email: student.email || '',
        class: student.class || '',
        rollNumber: student.rollNumber || '',
        department: student.department || '',
        parentContact: student.parentContact || '',
      });
      setAvatarUrl(student.profilePhoto || '');
    }
  }, [student]);

  const startEdit = (field) => {
    setEditing(field);
  };

  const cancelEdit = () => {
    if (student) {
      setForm({
        name: student.name || '',
        email: student.email || '',
        class: student.class || '',
        rollNumber: student.rollNumber || '',
        department: student.department || '',
        parentContact: student.parentContact || '',
      });
    }
    setEditing(null);
  };

  const saveField = async (field) => {
    if (!student) return;
    setSaving(true);
    try {
      await API.put(`/students/${student._id}`, { [field]: form[field] });
      toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} updated`);
      setEditing(null);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update');
    }
    setSaving(false);
  };

  const saveAvatar = async () => {
    if (!student) return;
    setSaving(true);
    try {
      await API.put(`/students/${student._id}`, { profilePhoto: avatarUrl });
      toast.success('Profile photo updated');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update photo');
    }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirm) {
      return toast.error('Fill all password fields');
    }
    if (pwForm.newPassword.length < 6) {
      return toast.error('New password must be at least 6 characters');
    }
    if (pwForm.newPassword !== pwForm.confirm) {
      return toast.error('Passwords do not match');
    }
    setChangingPw(true);
    try {
      await API.post('/auth/change-password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      toast.success('Password changed successfully');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    }
    setChangingPw(false);
  };

  if (loading) return <PageSkeleton />;

  if (error) return (
    <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-rose-400 text-sm">
      Failed to load data: {error}
    </div>
  );

  if (!student) return null;

  const stats = [
    { icon: FiBookOpen, label: 'Courses', value: student.enrolledCourses?.length || 0 },
    { icon: FiAward, label: 'Certificates', value: certificates?.length || 0 },
    { icon: FiCalendar, label: 'Attendance', value: student.attendance ? `${student.attendance}%` : 'N/A' },
    { icon: FiTrendingUp, label: 'GPA', value: student.gpa || '--' },
  ];

  const editableFields = [
    { key: 'name', label: 'Full Name' },
    { key: 'email', label: 'Email' },
    { key: 'class', label: 'Class' },
    { key: 'rollNumber', label: 'Roll Number' },
    { key: 'department', label: 'Department' },
    { key: 'parentContact', label: 'Parent Contact' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">
      <Card className="p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="relative group">
            <div className="w-20 h-20 rounded-full bg-indigo-500/10 border theme-border flex items-center justify-center shrink-0 overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl text-indigo-400 font-bold">{getInitials(student.name)}</span>
              )}
            </div>
            <label className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
              <FiCamera className="text-white" size={16} />
              <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                  setAvatarUrl(ev.target?.result || '');
                };
                reader.readAsDataURL(file);
              }} />
            </label>
          </div>
          {avatarUrl !== (student.profilePhoto || '') && (
            <div className="flex gap-2 mt-2">
              <Button size="sm" icon={FiCheck} onClick={saveAvatar} loading={saving}>Save Photo</Button>
              <Button size="sm" variant="ghost" icon={FiX} onClick={() => setAvatarUrl(student.profilePhoto || '')}>Cancel</Button>
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-xl font-bold theme-text">{student.name}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-sm theme-text-muted">
              <span className="flex items-center gap-1.5"><FiMail size={12} /> {student.email}</span>
              <span>Class {student.class}</span>
              <span className="text-xs theme-subtle px-2 py-0.5 rounded-md">{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Student'}</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <KpiCard key={i} icon={s.icon} label={s.label} value={String(s.value)} color={['indigo', 'emerald', 'amber', 'purple'][i]} />
        ))}
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold theme-text">Profile Information</h2>
          {editing && (
            <Button size="sm" variant="ghost" icon={FiX} onClick={cancelEdit}>Cancel</Button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {editableFields.map(f => (
            <div key={f.key}>
              <p className="text-xs theme-text-muted mb-1">{f.label}</p>
              {editing === f.key ? (
                <div className="flex gap-2">
                  <input
                    value={form[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="flex-1 px-3 py-1.5 rounded-lg border theme-border theme-bg theme-text text-sm outline-none focus:border-indigo-500/50 transition-colors"
                    autoFocus
                    onKeyDown={e => { if (e.key === 'Enter') saveField(f.key); if (e.key === 'Escape') cancelEdit(); }}
                  />
                  <button onClick={() => saveField(f.key)} className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors" disabled={saving}>
                    <FiCheck size={14} />
                  </button>
                  <button onClick={cancelEdit} className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors">
                    <FiX size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <p className="theme-text text-sm">{form[f.key] || '\u2014'}</p>
                  <button onClick={() => startEdit(f.key)} className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:theme-hover theme-text-muted hover:theme-text transition-all">
                    <FiEdit2 size={12} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="text-sm font-semibold theme-text mb-4 flex items-center gap-2">
          <FiLock size={14} /> Change Password
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <p className="text-xs theme-text-muted mb-1">Current Password</p>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={pwForm.currentPassword}
                onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border theme-border theme-bg theme-text text-sm outline-none focus:border-indigo-500/50 transition-colors pr-9"
                placeholder="Enter current password"
              />
              <button onClick={() => setShowPw(!showPw)} className="absolute right-2.5 top-1/2 -translate-y-1/2 theme-text-muted hover:theme-text">
                {showPw ? <FiEyeOff size={14} /> : <FiEye size={14} />}
              </button>
            </div>
          </div>
          <div>
            <p className="text-xs theme-text-muted mb-1">New Password</p>
            <input
              type={showPw ? 'text' : 'password'}
              value={pwForm.newPassword}
              onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border theme-border theme-bg theme-text text-sm outline-none focus:border-indigo-500/50 transition-colors"
              placeholder="Min 6 characters"
            />
          </div>
          <div>
            <p className="text-xs theme-text-muted mb-1">Confirm</p>
            <div className="flex gap-2">
              <input
                type={showPw ? 'text' : 'password'}
                value={pwForm.confirm}
                onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))}
                className="flex-1 px-3 py-2 rounded-lg border theme-border theme-bg theme-text text-sm outline-none focus:border-indigo-500/50 transition-colors"
                placeholder="Re-enter new password"
              />
              <Button size="sm" icon={FiSave} onClick={handleChangePassword} loading={changingPw}>Save</Button>
            </div>
          </div>
        </div>
      </Card>

      {(student.subjects && student.subjects.length > 0) && (
        <Card className="p-5">
          <h2 className="text-sm font-semibold theme-text mb-4">Subjects</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {student.subjects.map((s, i) => (
              <div key={s.name || i}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm theme-text">{s.name}</span>
                  <span className="text-xs theme-text-muted">{s.score}%</span>
                </div>
                <div className="w-full theme-hover rounded-full h-1.5">
                  <div className="h-1.5 rounded-full bg-indigo-500 transition-all" style={{ width: `${s.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h2 className="text-sm font-semibold theme-text mb-4 flex items-center gap-2">
            <FiAward className="text-indigo-400" size={14} /> Achievements
          </h2>
          <div className="flex flex-wrap gap-3">
            {(trophies || []).map(t => (
              <div key={t._id} className="flex items-center gap-2 theme-subtle rounded-xl px-3 py-2 theme-border">
                <span className="text-lg">{t.icon}</span>
                <div>
                  <p className="text-xs font-medium theme-text">{t.title}</p>
                  <p className="text-[10px] theme-text-muted">{formatDate(t.earnedAt)}</p>
                </div>
              </div>
            ))}
            {(!trophies || trophies.length === 0) && (
              <p className="text-xs theme-text-muted">No achievements yet</p>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-semibold theme-text mb-4 flex items-center gap-2">
            <FiBookOpen className="text-indigo-400" size={14} /> Certificates
          </h2>
          <div className="space-y-2">
            {(certificates || []).slice(0, 5).map(c => (
              <div key={c._id} className="flex items-center gap-3 theme-subtle rounded-xl p-3 theme-border">
                <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                  <FiAward className="text-indigo-400" size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium theme-text truncate">{c.courseName}</p>
                  <p className="text-xs theme-text-muted">Grade {c.grade} &middot; {formatDate(c.issuedAt)}</p>
                </div>
              </div>
            ))}
            {(!certificates || certificates.length === 0) && (
              <p className="text-xs theme-text-muted">No certificates yet</p>
            )}
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

export default StudentProfile;
