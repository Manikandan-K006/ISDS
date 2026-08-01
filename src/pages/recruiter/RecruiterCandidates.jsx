import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import API from '../../api/client';
import { User, Search, GitBranch, Link2, Globe, Mail, FolderGit2, BadgeCheck } from 'lucide-react';
import { Card, Input, Badge, EmptyState, SkeletonCard } from '../../components/ui';

export default function RecruiterCandidates() {
  const [candidates, setCandidates] = useState(null);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(null);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    API.get('/portfolio')
      .then(({ data }) => setCandidates(data.candidates))
      .catch((err) => toast.error(err.response?.data?.error || 'Could not load candidates'));
  }, []);

  const openProfile = async (id) => {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    setLoadingDetail(id);
    setDetail(null);
    try {
      const { data } = await API.get(`/portfolio/${id}`);
      setDetail(data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not load profile');
    } finally {
      setLoadingDetail(null);
    }
  };

  if (!candidates) return <div className="space-y-6"><h1 className="text-page-title theme-text">Candidates</h1><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1, 2, 3].map((i) => <SkeletonCard key={i} />)}</div></div>;

  const filtered = candidates.filter((c) => {
    const q = search.toLowerCase();
    return !q || c.student?.name?.toLowerCase().includes(q) || (c.headline || '').toLowerCase().includes(q) || (c.student?.email || '').toLowerCase().includes(q);
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-page-title theme-text">Candidate Directory</h1>
          <p className="text-caption theme-text-muted mt-1">Browse students who made their career profiles public</p>
        </div>
        <Input placeholder="Search by name or skill..." value={search} onChange={(e) => setSearch(e.target.value)} icon={Search} className="w-72" />
      </div>

      {filtered.length === 0 ? (
        <Card><EmptyState icon={User} title="No public profiles yet" description="Students who enable public career profiles will appear here." /></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <Card key={c.studentId} hover className="p-4 cursor-pointer" onClick={() => openProfile(c.studentId)}>
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-[var(--primary)]/10 flex items-center justify-center shrink-0"><User size={20} className="text-[var(--primary)]" /></div>
                  <div className="min-w-0">
                    <h3 className="text-card-subtitle theme-text">{c.student?.name}</h3>
                    {c.headline && <p className="text-small theme-text-muted truncate">{c.headline}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge color="emerald" size="sm"><BadgeCheck size={11} /> Verified</Badge>
                  <span className="text-small theme-text-muted">{expanded === c.studentId ? 'Close' : 'View profile'}</span>
                </div>
              </div>
              {c.summary && <p className="text-caption theme-text-muted mt-2 line-clamp-2">{c.summary}</p>}

              {expanded === c.studentId && (
                <div className="mt-4 pt-4 border-t border-[var(--border)]">
                  {loadingDetail === c.studentId ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{[1, 2, 3].map((i) => <SkeletonCard key={i} />)}</div>
                  ) : detail?.portfolio ? (
                    <div className="space-y-5">
                      <div className="flex items-center gap-3 flex-wrap text-small theme-text-muted">
                        <span className="inline-flex items-center gap-1.5"><Mail size={13} /> {detail.portfolio.student?.email}</span>
                        {detail.portfolio.links?.GitBranch && <a href={detail.portfolio.links.GitBranch} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-[var(--primary)]"><GitBranch size={13} /> GitBranch</a>}
                        {detail.portfolio.links?.Link2 && <a href={detail.portfolio.links.Link2} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-[var(--primary)]"><Link2 size={13} /> Link2</a>}
                        {detail.portfolio.links?.portfolioUrl && <a href={detail.portfolio.links.portfolioUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-[var(--primary)]"><Globe size={13} /> Portfolio</a>}
                      </div>
                      {detail.portfolio.summary && <p className="text-caption theme-text-muted leading-relaxed">{detail.portfolio.summary}</p>}
                      {detail.portfolio.academics && <p className="text-small theme-text-muted">Completed {detail.portfolio.academics.courses} courses · Avg score {detail.portfolio.academics.averageScore}%</p>}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {detail.portfolio.topSkills?.length > 0 && (
                          <div>
                            <h4 className="text-micro theme-text-muted uppercase tracking-wide mb-2">Top skills</h4>
                            <div className="flex gap-1.5 flex-wrap">{detail.portfolio.topSkills.slice(0, 8).map((s) => <Badge key={s.name} color="indigo" size="sm">{s.name} {s.score}%</Badge>)}</div>
                          </div>
                        )}
                        {detail.portfolio.projects?.length > 0 && (
                          <div>
                            <h4 className="text-micro theme-text-muted uppercase tracking-wide mb-2">Projects</h4>
                            <div className="space-y-1.5">{detail.portfolio.projects.slice(0, 3).map((p) => <p key={p.id} className="text-small theme-text-muted inline-flex items-center gap-1.5"><FolderGit2 size={13} /> {p.title}</p>)}</div>
                          </div>
                        )}
                        {detail.portfolio.certificates?.length > 0 && (
                          <div>
                            <h4 className="text-micro theme-text-muted uppercase tracking-wide mb-2">Certificates</h4>
                            <div className="space-y-1.5">{detail.portfolio.certificates.slice(0, 3).map((c2, i) => <p key={i} className="text-small theme-text-muted inline-flex items-center gap-1.5"><BadgeCheck size={13} className="text-emerald-500" /> {c2.title}</p>)}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-caption theme-text-muted">No profile details available.</p>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );
}
