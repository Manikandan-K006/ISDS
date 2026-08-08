import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import API from '../../api/client';
import { FileText, ArrowRight, User } from 'lucide-react';
import { Card, Badge, EmptyState, Select, SkeletonCard } from '../../components/ui';

const appStatusColor = { submitted: 'indigo', shortlisted: 'amber', selected: 'emerald', rejected: 'rose' };

export default function RecruiterApplications() {
  const [applications, setApplications] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    API.get('/recruiter/applications').then(({ data }) => setApplications(data.applications)).catch(() => {});
  }, []);

  if (!applications) return <div className="space-y-6"><h1 className="text-page-title theme-text">Applications</h1><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1, 2, 3].map((i) => <SkeletonCard key={i} />)}</div></div>;

  const filtered = filter === 'all' ? applications : applications.filter((a) => a.status === filter);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-page-title theme-text">Applications</h1>
          <p className="text-caption theme-text-muted mt-1">Review candidates who applied to your jobs</p>
        </div>
        <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="w-44" options={[{ value: 'all', label: 'All statuses' }, { value: 'submitted', label: 'Submitted' }, { value: 'shortlisted', label: 'Shortlisted' }, { value: 'selected', label: 'Selected' }, { value: 'rejected', label: 'Rejected' }]} />
      </div>

      {filtered.length === 0 ? (
        <Card><EmptyState icon={FileText} title="No applications" description="Applications from students will appear here." /></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => (
            <Link key={a.id} to={`/recruiter/applications/${a.id}`}>
              <Card hover className="p-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center shrink-0"><User size={18} className="text-[var(--primary)]" /></div>
                    <div className="min-w-0">
                      <h3 className="text-card-subtitle theme-text truncate">{a.student?.name}</h3>
                      <p className="text-small theme-text-muted truncate">{a.job?.title} · {a.job?.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {a.eligibility?.eligible && <Badge color="emerald" size="sm">Eligible</Badge>}
                    <Badge color={appStatusColor[a.status] || 'slate'} size="sm" dot>{a.status}</Badge>
                    <span className="text-small theme-text-muted">{new Date(a.createdAt).toLocaleDateString()}</span>
                    <ArrowRight size={16} className="theme-text-muted" />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </motion.div>
  );
}
