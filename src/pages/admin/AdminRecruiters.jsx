import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import API from '../../api/client';
import { User, Mail, Briefcase, Building2, Search, Trash2 } from 'lucide-react';
import { Card, Badge, Input, EmptyState, Avatar, SkeletonList } from '../../components/ui';

export default function AdminRecruiters() {
  const [recruiters, setRecruiters] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    API.get('/admin/users', { params: { role: 'recruiter' } })
      .then(({ data }) => setRecruiters(Array.isArray(data) ? data : data.users || []))
      .catch((err) => toast.error(err.response?.data?.error || 'Could not load recruiters'));
  }, []);

  const remove = async (id) => {
    if (!window.confirm('Remove this recruiter?')) return;
    try {
      await API.delete(`/admin/users/${id}`);
      setRecruiters((list) => list.filter((u) => u.id !== id));
      toast.success('Recruiter removed');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not remove recruiter');
    }
  };

  if (!recruiters) return <div className="space-y-6"><h1 className="text-page-title theme-text">Recruiters</h1><SkeletonList count={4} /></div>;

  const filtered = recruiters.filter((u) => !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-page-title theme-text">Recruiters</h1>
          <p className="text-caption theme-text-muted mt-1">{recruiters.length} registered recruiting accounts</p>
        </div>
        <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} icon={Search} className="w-64" />
      </div>

      {filtered.length === 0 ? (
        <Card><EmptyState icon={User} title="No recruiters found" description="Recruiter accounts will appear here." /></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((u) => (
            <Card key={u.id} className="p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={u.name} src={u.profilePhoto} />
                  <div className="min-w-0">
                    <h3 className="text-card-subtitle theme-text truncate">{u.name}</h3>
                    <p className="text-caption theme-text-muted truncate inline-flex items-center gap-1"><Mail size={12} /> {u.email}</p>
                  </div>
                </div>
                <button onClick={() => remove(u.id)} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 size={15} /></button>
              </div>
              <div className="flex items-center gap-3 mt-4 text-small theme-text-muted flex-wrap">
                <Badge color="indigo" size="sm"><Briefcase size={11} /> Recruiter</Badge>
                {u.employeeId && <span className="inline-flex items-center gap-1"><Building2 size={13} /> {u.employeeId}</span>}
                <Badge color={u.isActive ? 'emerald' : 'rose'} size="sm" dot>{u.isActive ? 'Active' : 'Disabled'}</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );
}
