import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../../api/client';
import { ChevronLeft, Building2, Mail, GitBranch, Link2, Globe, FileText, FolderGit2, Award, CheckCircle2, XCircle, Star } from 'lucide-react';
import { Card, Button, Badge, ProgressBar, SkeletonCard, EmptyState } from '../../components/ui';

const appStatusColor = { submitted: 'indigo', shortlisted: 'amber', selected: 'emerald', rejected: 'rose' };

export default function RecruiterApplicationDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    API.get(`/recruiter/applications/${id}`).then(({ data }) => setData(data)).catch((err) => toast.error(err.response?.data?.error || 'Could not load application'));
  }, [id]);

  const updateStatus = async (status) => {
    setUpdating(true);
    try {
      const { data: res } = await API.patch(`/recruiter/applications/${id}/status`, { status });
      setData((prev) => ({ ...prev, application: { ...prev.application, status: res.application.status } }));
      toast.success(`Application ${status}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  if (!data) return <div className="space-y-6"><div className="grid grid-cols-1 lg:grid-cols-3 gap-6">{[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}</div></div>;

  const { application, candidate } = data;
  const resume = application.resumeSnapshot;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/recruiter/applications" className="p-2 rounded-xl theme-text-muted hover:bg-[var(--hover)]"><ChevronLeft size={18} /></Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-page-title theme-text truncate">{application.student?.name}</h1>
          <p className="text-caption theme-text-muted inline-flex items-center gap-1.5"><Building2 size={13} /> {application.job?.title} · {application.job?.company}</p>
        </div>
        <Badge color={appStatusColor[application.status] || 'slate'} dot>{application.status}</Badge>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-card-subtitle theme-text mb-1">Decision</h3>
            <p className="text-caption theme-text-muted">Applied {new Date(application.createdAt).toLocaleDateString()}</p>
          </div>
          <div className="flex gap-2">
            {['shortlisted', 'selected', 'rejected'].map((s) => (
              <Button key={s} size="sm" variant={application.status === s ? 'primary' : 'secondary'} disabled={application.status === s} onClick={() => updateStatus(s)} loading={updating && application.status !== s}>{s}</Button>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {candidate.profile && (
            <Card className="p-5">
              <h3 className="text-card-subtitle theme-text mb-1">Profile</h3>
              {candidate.profile.headline && <p className="text-caption theme-text text-[var(--primary)]">{candidate.profile.headline}</p>}
              {candidate.profile.summary && <p className="text-caption theme-text-muted mt-2 leading-relaxed">{candidate.profile.summary}</p>}
              <div className="flex items-center gap-3 mt-3 flex-wrap text-small theme-text-muted">
                <span className="inline-flex items-center gap-1.5"><Mail size={13} /> {application.student?.email}</span>
                {candidate.profile.GitBranch && <a href={candidate.profile.GitBranch} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-[var(--primary)]"><GitBranch size={13} /> GitBranch</a>}
                {candidate.profile.Link2 && <a href={candidate.profile.Link2} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-[var(--primary)]"><Link2 size={13} /> Link2</a>}
                {candidate.profile.portfolioUrl && <a href={candidate.profile.portfolioUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-[var(--primary)]"><Globe size={13} /> Portfolio</a>}
              </div>
            </Card>
          )}

          {candidate.topSkills?.length > 0 && (
            <Card className="p-5">
              <h3 className="text-card-subtitle theme-text mb-3">Top skills</h3>
              <div className="space-y-3">
                {candidate.topSkills.map((s) => (
                  <div key={s.name}>
                    <div className="flex items-center justify-between text-small mb-1">
                      <span className="theme-text">{s.name}</span>
                      <span className="theme-text-muted">{s.score}%</span>
                    </div>
                    <ProgressBar value={s.score} size="sm" color={s.score >= 70 ? 'emerald' : s.score >= 40 ? 'amber' : 'rose'} />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {candidate.projects?.length > 0 && (
            <Card className="p-5">
              <h3 className="text-card-subtitle theme-text mb-3 flex items-center gap-2"><FolderGit2 size={15} /> Projects</h3>
              <div className="space-y-3">
                {candidate.projects.map((p) => (
                  <div key={p.id} className="rounded-xl bg-[var(--hover)] p-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-small theme-text font-medium">{p.title}</p>
                      {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noreferrer" className="text-[var(--primary)]"><GitBranch size={15} /></a>}
                    </div>
                    {(p.techStack || []).length > 0 && <div className="flex gap-1.5 flex-wrap mt-2">{(p.techStack || []).slice(0, 5).map((t) => <Badge key={t} color="indigo" size="sm">{t}</Badge>)}</div>}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {candidate.certificates?.length > 0 && (
            <Card className="p-5">
              <h3 className="text-card-subtitle theme-text mb-3 flex items-center gap-2"><Award size={15} /> Certificates</h3>
              <div className="space-y-2">
                {candidate.certificates.map((c, i) => (
                  <p key={i} className="text-small theme-text-muted inline-flex items-center gap-1.5"><Award size={13} className="text-amber-400" /> {c.title}{c.organization ? ` · ${c.organization}` : ''}</p>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {application.eligibility && (
            <Card className="p-5">
              <h3 className="text-card-subtitle theme-text mb-3 flex items-center gap-2">{application.eligibility.eligible ? <CheckCircle2 size={15} className="text-emerald-500" /> : <XCircle size={15} className="text-rose-500" />} Eligibility</h3>
              <div className="space-y-2.5">
                {application.eligibility.rules.map((r) => (
                  <div key={r.label} className="flex items-center gap-2">
                    {r.ok ? <CheckCircle2 size={14} className="text-emerald-500 shrink-0" /> : <XCircle size={14} className="text-rose-500 shrink-0" />}
                    <span className="text-small theme-text-muted flex-1 truncate">{r.label}</span>
                    <span className="text-small theme-text">{r.actual}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card className="p-5">
            <h3 className="text-card-subtitle theme-text mb-3 flex items-center gap-2"><FileText size={15} /> Resume snapshot</h3>
            {resume?.resumeUrl ? (
              <a href={resume.resumeUrl} target="_blank" rel="noreferrer"><Button size="sm" icon={FileText} className="w-full">Open resume</Button></a>
            ) : (
              <EmptyState icon={FileText} title="No resume uploaded" description="The candidate did not attach a resume URL." />
            )}
            {resume?.headline && <p className="text-caption theme-text mt-3">{resume.headline}</p>}
            {resume?.summary && <p className="text-caption theme-text-muted mt-1 leading-relaxed">{resume.summary}</p>}
            {(resume?.GitBranch || resume?.Link2 || resume?.portfolioUrl) && (
              <div className="flex items-center gap-3 mt-3 text-small theme-text-muted flex-wrap">
                {resume.GitBranch && <a href={resume.GitBranch} target="_blank" rel="noreferrer" className="hover:text-[var(--primary)]"><GitBranch size={14} /></a>}
                {resume.Link2 && <a href={resume.Link2} target="_blank" rel="noreferrer" className="hover:text-[var(--primary)]"><Link2 size={14} /></a>}
                {resume.portfolioUrl && <a href={resume.portfolioUrl} target="_blank" rel="noreferrer" className="hover:text-[var(--primary)]"><Globe size={14} /></a>}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <h3 className="text-card-subtitle theme-text mb-2 flex items-center gap-2"><Star size={15} className="text-amber-400" /> Assessment</h3>
            <p className="text-caption theme-text-muted">Eligibility is computed automatically from the candidate's CGPA, attendance, projects, and skill scores against your requirements.</p>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
