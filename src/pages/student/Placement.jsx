import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import API from '../../api/client';
import {
  Briefcase, CheckCircle2, ChevronDown, Clock, MapPin, Rocket, TrendingUp,
  Target, Users, XCircle,
} from 'lucide-react';
import { SkeletonCard } from '../../components/ui';

const statusStyles = {
  submitted: 'bg-sky-500/10 text-sky-400',
  shortlisted: 'bg-amber-500/10 text-amber-400',
  selected: 'bg-emerald-500/10 text-emerald-400',
  rejected: 'bg-rose-500/10 text-rose-400',
};

const formatDate = (d) => {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return '—'; }
};

export default function Placement() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/career/placement/summary');
      setData(data);
    } catch {
      toast.error('Could not load placement data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const apply = async (drive) => {
    try {
      await API.post(`/career/jobs/${drive.id}/apply`);
      toast.success(`Applied to ${drive.title}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not apply');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-page-title theme-text">Placement Cell</h1>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </div>
        <SkeletonCard />
      </div>
    );
  }

  const stats = data?.stats || {};

  const statCards = [
    { icon: Rocket, label: 'Open Drives', value: stats.openDrives ?? 0, color: 'text-sky-400', bg: 'bg-sky-500/10' },
    { icon: Users, label: 'Applications', value: stats.applied ?? 0, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { icon: TrendingUp, label: 'Shortlisted', value: stats.shortlisted ?? 0, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { icon: CheckCircle2, label: 'Selected', value: stats.selected ?? 0, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-page-title theme-text">Placement Cell</h1>
          <p className="text-sm theme-text-muted mt-1">Track drives, eligibility and your application pipeline.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl theme-card border theme-border">
          <Target size={15} className="text-indigo-400" />
          <span className="text-sm theme-text font-medium">Readiness {stats.readiness}%</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="theme-card border theme-border rounded-2xl p-5 card-shadow-premium">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={s.color} size={20} />
            </div>
            <div className="text-2xl font-extrabold theme-text">{s.value}</div>
            <div className="text-xs theme-text-muted mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="theme-card border theme-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-card-subtitle theme-text">Upcoming Drives</h3>
          <span className="text-xs theme-text-muted">CGPA {stats.cgpa ?? '—'} · Attendance {stats.attendance ?? '—'}%</span>
        </div>
        <p className="text-xs theme-text-muted mb-5">Eligibility is computed live from your profile — apply to drives you qualify for.</p>

        {(!data?.drives || data.drives.length === 0) ? (
          <div className="py-10 text-center">
            <Briefcase size={40} className="mx-auto theme-text-muted mb-3" />
            <p className="theme-text-muted text-sm">No open placement drives right now. Check back soon.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.drives.map((drive) => {
              const isOpen = expanded === drive.id;
              const eligible = drive.eligibility?.eligible;
              const app = drive.application;
              const missing = drive.eligibility?.missing || [];
              return (
                <div key={drive.id} className="theme-input border theme-border rounded-2xl overflow-hidden">
                  <button onClick={() => setExpanded(isOpen ? null : drive.id)} className="w-full flex flex-wrap items-center justify-between gap-3 p-4 text-left hover:bg-[var(--hover)] transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${eligible ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                        {eligible ? <CheckCircle2 className="text-emerald-400" size={20} /> : <XCircle className="text-rose-400" size={20} />}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold theme-text truncate">{drive.title} · {drive.company}</div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs theme-text-muted">
                          {drive.location && <span className="flex items-center gap-1"><MapPin size={11} /> {drive.location}</span>}
                          {drive.stipend && <span>{drive.stipend}</span>}
                          {drive.minCGPA != null && <span>CGPA {drive.minCGPA}+</span>}
                          <span className="flex items-center gap-1"><Clock size={11} /> closes {formatDate(drive.deadline)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {app ? (
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusStyles[app.status] || 'bg-[var(--hover)] theme-text-muted'}`}>
                          {app.status}
                        </span>
                      ) : (
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${eligible ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                          {eligible ? 'Eligible' : `${missing.length} requirement${missing.length === 1 ? '' : 's'} missing`}
                        </span>
                      )}
                      <ChevronDown className={`theme-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} size={16} />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 border-t theme-border">
                      <div className="mt-3 space-y-2">
                        {drive.eligibility?.rules?.map((r) => (
                          <div key={r.label} className="flex items-center justify-between text-xs">
                            <span className="theme-text-secondary">{r.label}</span>
                            <span className={`font-medium ${r.ok ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {r.ok ? `✓ ${r.actual ?? 0}` : `✕ ${r.actual ?? 0} (need ${r.requirement})`}
                            </span>
                          </div>
                        ))}
                        {!drive.eligibility?.rules?.length && <p className="text-xs theme-text-muted">No eligibility criteria set.</p>}
                      </div>
                      <div className="flex flex-wrap gap-3 mt-4">
                        {app ? (
                          <span className="text-xs theme-text-muted">You applied on {formatDate(app.appliedAt)}.</span>
                        ) : (
                          <button
                            onClick={() => apply(drive)}
                            disabled={!eligible}
                            className="px-4 py-2 rounded-xl gradient-accent text-white text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                          >
                            Apply Now
                          </button>
                        )}
                        {missing.length > 0 && (
                          <span className="text-xs theme-text-muted self-center">Missing: {missing.join(', ')}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
