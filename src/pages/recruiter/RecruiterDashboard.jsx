import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import API from '../../api/client';
import { Briefcase, FileText, Star, CheckCircle2, ArrowRight, User } from 'lucide-react';
import { KpiCard, Card, Badge, EmptyState, SkeletonCard } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';

const appStatusColor = { submitted: 'indigo', shortlisted: 'amber', selected: 'emerald', rejected: 'rose' };

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    API.get('/recruiter/stats').then(({ data }) => setStats(data.stats)).catch(() => {});
    API.get('/recruiter/applications').then(({ data }) => setApplications(data.applications.slice(0, 6))).catch(() => {});
    API.get('/recruiter/jobs').then(({ data }) => setJobs(data.jobs)).catch(() => {});
  }, []);

  if (!stats) {
    return (
      <div className="space-y-6">
        <h1 className="text-page-title theme-text">Recruiter Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}</div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-page-title theme-text">Welcome, {user?.name?.split(' ')[0]}</h1>
          <p className="text-caption theme-text-muted mt-1">Manage your job postings and candidate pipeline</p>
        </div>
        <Link to="/recruiter/jobs"><Badge color="indigo" size="lg"><Briefcase size={14} /> Post a job</Badge></Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Job postings" value={stats.jobs} icon={Briefcase} color="indigo" />
        <KpiCard label="Total applications" value={stats.applications} icon={FileText} color="indigo" />
        <KpiCard label="Shortlisted" value={stats.shortlisted} icon={Star} color="amber" />
        <KpiCard label="Selected" value={stats.selected} icon={CheckCircle2} color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-card-subtitle theme-text">Recent applications</h3>
            <Link to="/recruiter/applications" className="text-small text-[var(--primary)] inline-flex items-center gap-1">View all <ArrowRight size={13} /></Link>
          </div>
          {applications.length === 0 ? (
            <EmptyState icon={FileText} title="No applications yet" description="Applications will appear here when students apply to your jobs." />
          ) : (
            <div className="space-y-3">
              {applications.map((a) => (
                <Link key={a.id} to={`/recruiter/applications/${a.id}`} className="block">
                  <div className="flex items-center justify-between gap-2 rounded-xl hover:bg-[var(--hover)] p-2.5 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-[var(--primary)]/10 flex items-center justify-center shrink-0"><User size={16} className="text-[var(--primary)]" /></div>
                      <div className="min-w-0">
                        <p className="text-small theme-text font-medium truncate">{a.student?.name}</p>
                        <p className="text-caption theme-text-muted truncate">{a.job?.title} · {a.job?.company}</p>
                      </div>
                    </div>
                    <Badge color={appStatusColor[a.status] || 'slate'} size="sm">{a.status}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-card-subtitle theme-text">Your jobs</h3>
            <Link to="/recruiter/jobs" className="text-small text-[var(--primary)] inline-flex items-center gap-1">Manage <ArrowRight size={13} /></Link>
          </div>
          {jobs.length === 0 ? (
            <EmptyState icon={Briefcase} title="No jobs posted" description="Create your first job posting to start receiving applications." />
          ) : (
            <div className="space-y-3">
              {jobs.slice(0, 5).map((j) => (
                <div key={j.id} className="flex items-center justify-between gap-2 rounded-xl hover:bg-[var(--hover)] p-2.5 transition-colors">
                  <div className="min-w-0">
                    <p className="text-small theme-text font-medium truncate">{j.title}</p>
                    <p className="text-caption theme-text-muted truncate">{j.company} · {j.location || 'Remote'}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge color={j.status === 'open' ? 'emerald' : 'slate'} size="sm">{j.status}</Badge>
                    <span className="text-caption theme-text-muted">{j._count?.applications} apps</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </motion.div>
  );
}
