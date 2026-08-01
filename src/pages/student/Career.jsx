import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import API from '../../api/client';
import { Briefcase, FileText, CheckCircle2, XCircle, AlertCircle, Send, User, Rocket, ArrowRight, MapPin, Building2, Clock, BadgeCheck } from 'lucide-react';
import { Card, Button, Input, Select, Badge, Tabs, EmptyState, Switch, ProgressBar, SkeletonCard } from '../../components/ui';

const typeColor = { job: 'indigo', internship: 'amber', research: 'emerald' };
const appStatusColor = { submitted: 'indigo', shortlisted: 'amber', selected: 'emerald', rejected: 'rose' };

function Eligibility({ eligibility }) {
  if (!eligibility) return null;
  return (
    <div className="space-y-2.5">
      {eligibility.rules.map((r) => (
        <div key={r.label} className="flex items-center gap-3">
          {r.ok ? <CheckCircle2 size={16} className="text-emerald-500 shrink-0" /> : <XCircle size={16} className="text-rose-500 shrink-0" />}
          <span className="text-small theme-text w-40 shrink-0">{r.label}</span>
          <span className="text-small theme-text font-medium flex-1">{r.actual}</span>
          <span className="text-small theme-text-muted">needs {r.requirement}</span>
        </div>
      ))}
      {eligibility.rules.length === 0 && <p className="text-small theme-text-muted">No minimum criteria set for this position.</p>}
      <p className={`text-caption mt-2 flex items-center gap-1.5 ${eligibility.eligible ? 'text-emerald-500' : 'text-amber-500'}`}>
        {eligibility.eligible ? <BadgeCheck size={14} /> : <AlertCircle size={14} />}
        {eligibility.eligible ? 'You are eligible for this position' : `Missing: ${eligibility.missing.join(', ')}`}
      </p>
    </div>
  );
}

function JobsTab() {
  const [jobs, setJobs] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [applying, setApplying] = useState(false);

  const load = useCallback(() => {
    API.get('/career/jobs')
      .then(({ data }) => setJobs(data.jobs))
      .catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (selected) {
      setEligibility(null);
      API.get(`/career/jobs/${selected.id}/eligibility`)
        .then(({ data }) => setEligibility(data.eligibility))
        .catch(() => {});
    }
  }, [selected]);

  if (!jobs) return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1, 2].map((i) => <SkeletonCard key={i} />)}</div>;

  const filtered = jobs.filter((j) => {
    if (filter !== 'all' && j.type !== filter) return false;
    const q = search.toLowerCase();
    return !q || j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q) || (j.location || '').toLowerCase().includes(q);
  });

  const apply = async () => {
    setApplying(true);
    try {
      await API.post(`/career/jobs/${selected.id}/apply`);
      toast.success('Application submitted');
      setSelected(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not apply');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Input placeholder="Search jobs..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 min-w-[200px]" icon={Briefcase} />
          <Select value={filter} onChange={(e) => setFilter(e.target.value)} options={[{ value: 'all', label: 'All types' }, { value: 'job', label: 'Jobs' }, { value: 'internship', label: 'Internships' }, { value: 'research', label: 'Research' }]} className="w-40" />
        </div>
        {filtered.length === 0 && <Card><EmptyState icon={Briefcase} title="No jobs found" description="Check back soon or adjust your filters." /></Card>}
        {filtered.map((j) => (
          <Card key={j.id} hover className={`p-4 cursor-pointer transition-colors ${selected?.id === j.id ? 'ring-2 ring-[var(--primary)]' : ''}`} onClick={() => setSelected(j)}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-card-subtitle theme-text">{j.title}</h3>
                <p className="text-small theme-text-muted mt-0.5 inline-flex items-center gap-1.5"><Building2 size={13} /> {j.company}</p>
              </div>
              <Badge color={typeColor[j.type] || 'indigo'}>{j.type}</Badge>
            </div>
            <div className="flex items-center gap-4 mt-2 text-small theme-text-muted flex-wrap">
              {j.location && <span className="inline-flex items-center gap-1"><MapPin size={13} /> {j.location}</span>}
              {j.stipend && <span>{j.stipend}</span>}
              {j.deadline && <span className="inline-flex items-center gap-1"><Clock size={13} /> {new Date(j.deadline).toLocaleDateString()}</span>}
            </div>
            {(j.requiredSkills || []).length > 0 && (
              <div className="flex gap-1.5 flex-wrap mt-2.5">{(j.requiredSkills || []).slice(0, 5).map((s) => <Badge key={s} color="indigo" size="sm">{s}</Badge>)}</div>
            )}
          </Card>
        ))}
      </div>

      <div>
        {selected ? (
          <Card className="p-5 sticky top-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-card-title theme-text">{selected.title}</h2>
                <p className="text-caption theme-text-muted inline-flex items-center gap-1.5 mt-1"><Building2 size={13} /> {selected.company}</p>
              </div>
              <Badge color={typeColor[selected.type] || 'indigo'}>{selected.type}</Badge>
            </div>
            <div className="flex items-center gap-4 mt-3 text-small theme-text-muted flex-wrap">
              {selected.location && <span className="inline-flex items-center gap-1"><MapPin size={13} /> {selected.location}</span>}
              {selected.stipend && <span className="inline-flex items-center gap-1"><Clock size={13} /> {selected.stipend}</span>}
              {selected.experienceLevel && <span>{selected.experienceLevel}</span>}
            </div>
            <p className="text-caption theme-text mt-4 leading-relaxed">{selected.description}</p>
            <div className="mt-4 pt-4 border-t border-[var(--border)]">
              <h3 className="text-card-subtitle theme-text mb-3">Your eligibility</h3>
              <Eligibility eligibility={eligibility} />
            </div>
            <div className="mt-5 flex gap-2">
              <Button onClick={apply} loading={applying} icon={Send} disabled={eligibility && !eligibility.eligible}>Apply Now</Button>
              <Button variant="secondary" onClick={() => setSelected(null)}>Close</Button>
            </div>
          </Card>
        ) : (
          <Card className="p-8 sticky top-4"><EmptyState icon={Briefcase} title="Select a job" description="Choose a position to see your eligibility and apply." /></Card>
        )}
      </div>
    </div>
  );
}

function ApplicationsTab() {
  const [apps, setApps] = useState(null);
  useEffect(() => {
    API.get('/career/applications').then(({ data }) => setApps(data.applications)).catch(() => {});
  }, []);
  if (!apps) return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1, 2].map((i) => <SkeletonCard key={i} />)}</div>;
  if (!apps.length) return <Card><EmptyState icon={FileText} title="No applications yet" description="Apply to a job from the Jobs tab." /></Card>;
  return (
    <div className="space-y-3">
      {apps.map((a) => (
        <Card key={a.id} className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-card-subtitle theme-text">{a.job.title} <span className="theme-text-muted font-normal">· {a.job.company}</span></h3>
              <p className="text-small theme-text-muted mt-0.5 inline-flex items-center gap-1.5"><Clock size={13} /> Applied {new Date(a.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge color={appStatusColor[a.status] || 'slate'} dot>{a.status}</Badge>
              {a.eligibility?.eligible ? <Badge color="emerald" size="sm"><CheckCircle2 size={11} /> Eligible</Badge> : <Badge color="amber" size="sm"><AlertCircle size={11} /> Below criteria</Badge>}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function ProfileTab() {
  const [profile, setProfile] = useState({ headline: '', summary: '', github: '', linkedin: '', portfolioUrl: '', resumeUrl: '', isPublic: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    API.get('/career/profile').then(({ data }) => { if (data.profile) setProfile(data.profile); }).catch(() => {});
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await API.put('/career/profile', profile);
      setProfile(data.profile);
      toast.success('Career profile saved');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-card-title theme-text">Career Profile</h3>
          <p className="text-caption theme-text-muted mt-1">Make your profile public so recruiters can find you</p>
        </div>
        <Switch checked={profile.isPublic} onChange={(v) => setProfile({ ...profile, isPublic: v })} label="Public" />
      </div>
      <Input label="Headline" value={profile.headline || ''} onChange={(e) => setProfile({ ...profile, headline: e.target.value })} placeholder="Full-stack developer focused on edtech" />
      <div>
        <label className="text-small theme-text-muted mb-1.5 block">Summary</label>
        <textarea rows={4} value={profile.summary || ''} onChange={(e) => setProfile({ ...profile, summary: e.target.value })} placeholder="A short summary of who you are..." className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-3.5 py-2.5 text-sm theme-text outline-none focus:border-[var(--primary)] transition-colors resize-none" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="GitHub" value={profile.github || ''} onChange={(e) => setProfile({ ...profile, github: e.target.value })} placeholder="https://github.com/..." />
        <Input label="LinkedIn" value={profile.linkedin || ''} onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })} placeholder="https://linkedin.com/in/..." />
        <Input label="Portfolio URL" value={profile.portfolioUrl || ''} onChange={(e) => setProfile({ ...profile, portfolioUrl: e.target.value })} placeholder="https://..." />
        <Input label="Resume URL" value={profile.resumeUrl || ''} onChange={(e) => setProfile({ ...profile, resumeUrl: e.target.value })} placeholder="https://drive.google.com/..." />
      </div>
      <div className="flex justify-end"><Button type="submit" loading={saving} icon={BadgeCheck}>Save Profile</Button></div>
    </form>
  );
}

function ReadinessTab() {
  const [roles, setRoles] = useState(null);
  useEffect(() => {
    API.get('/career/readiness').then(({ data }) => setRoles(data.roles)).catch(() => {});
  }, []);
  if (!roles) return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1, 2, 3].map((i) => <SkeletonCard key={i} />)}</div>;
  return (
    <div className="space-y-4">
      {roles.map((r) => (
        <Card key={r.key} className="p-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center"><Rocket size={18} className="text-[var(--primary)]" /></div>
              <div>
                <h3 className="text-card-subtitle theme-text">{r.label}</h3>
                <p className="text-caption theme-text-muted">{r.description}</p>
              </div>
            </div>
            <Badge color={r.readiness >= 70 ? 'emerald' : r.readiness >= 40 ? 'amber' : 'rose'}>{r.readiness}% ready</Badge>
          </div>
          <div className="mt-4"><ProgressBar value={r.readiness} color={r.readiness >= 70 ? 'emerald' : r.readiness >= 40 ? 'amber' : 'rose'} /></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div className="rounded-xl bg-[var(--hover)] p-3.5">
              <p className="text-micro theme-text-muted uppercase tracking-wide mb-1.5">Strong</p>
              <div className="flex gap-1.5 flex-wrap">
                {r.strong?.length ? r.strong.slice(0, 4).map((s) => <Badge key={s} color="emerald" size="sm">{s}</Badge>) : <span className="text-caption theme-text-muted">None</span>}
              </div>
            </div>
            <div className="rounded-xl bg-[var(--hover)] p-3.5">
              <p className="text-micro theme-text-muted uppercase tracking-wide mb-1.5">Needs work</p>
              <div className="flex gap-1.5 flex-wrap">
                {r.weak?.length ? r.weak.map((s) => <Badge key={s} color="rose" size="sm">{s}</Badge>) : <span className="text-caption theme-text-muted">None</span>}
              </div>
            </div>
            <div className="rounded-xl bg-[var(--hover)] p-3.5">
              <p className="text-micro theme-text-muted uppercase tracking-wide mb-1.5">Skill scores</p>
              <div className="space-y-1">
                {r.rows.slice(0, 3).map((row) => (
                  <div key={row.skill} className="flex items-center justify-between gap-2">
                    <span className="text-small theme-text-muted truncate">{row.skill}</span>
                    <span className="text-small theme-text font-medium">{row.current}/{row.target}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function ResumeTab() {
  const [resume, setResume] = useState(null);
  useEffect(() => {
    API.get('/career/resume/preview').then(({ data }) => setResume(data.resume)).catch(() => {});
  }, []);
  if (!resume) return <div className="space-y-4">{[1, 2, 3].map((i) => <SkeletonCard key={i} />)}</div>;
  return (
    <Card className="p-6 max-w-2xl">
      <h2 className="text-card-title theme-text">{resume.name}</h2>
      <p className="text-small theme-text-muted mt-0.5">{resume.email}</p>
      {resume.headline && <p className="text-caption theme-text mt-2 text-[var(--primary)]">{resume.headline}</p>}
      {resume.summary && <p className="text-caption theme-text-muted mt-3 leading-relaxed">{resume.summary}</p>}
      {resume.skills?.length > 0 && (
        <div className="mt-5">
          <h3 className="text-micro theme-text-muted uppercase tracking-wide mb-2">Skills</h3>
          <div className="flex gap-1.5 flex-wrap">{resume.skills.map((s) => <Badge key={s} color="indigo" size="sm">{s}</Badge>)}</div>
        </div>
      )}
      {resume.projects?.length > 0 && (
        <div className="mt-5">
          <h3 className="text-micro theme-text-muted uppercase tracking-wide mb-2">Projects</h3>
          <div className="space-y-3">
            {resume.projects.map((p, i) => (
              <div key={i}>
                <p className="text-small theme-text font-medium">{p.title}</p>
                <p className="text-caption theme-text-muted">{p.description}</p>
                {(p.techStack || []).length > 0 && <div className="flex gap-1.5 flex-wrap mt-1">{(p.techStack || []).map((t) => <Badge key={t} color="slate" size="sm">{t}</Badge>)}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
      {resume.educationDetails?.length > 0 && (
        <div className="mt-5">
          <h3 className="text-micro theme-text-muted uppercase tracking-wide mb-2">Completed Courses</h3>
          <div className="space-y-1">{resume.educationDetails.map((e, i) => <p key={i} className="text-small theme-text-muted">{e.title} <span className="theme-text">· {e.score}%</span></p>)}</div>
        </div>
      )}
      {resume.certificates?.length > 0 && (
        <div className="mt-5">
          <h3 className="text-micro theme-text-muted uppercase tracking-wide mb-2">Certificates</h3>
          <div className="space-y-1">{resume.certificates.map((c, i) => <p key={i} className="text-small theme-text-muted inline-flex items-center gap-1.5"><BadgeCheck size={13} className="text-emerald-500" /> {c.title}{c.organization ? ` · ${c.organization}` : ''}</p>)}</div>
        </div>
      )}
      <div className="mt-6 pt-4 border-t border-[var(--border)] flex items-center justify-between flex-wrap gap-2">
        <p className="text-small theme-text-muted">Recruiters see this when you apply or share your profile.</p>
        <Button variant="secondary" size="sm" icon={ArrowRight} onClick={() => { toast.success('Your public portfolio link is shared with recruiters'); }}>Share portfolio</Button>
      </div>
    </Card>
  );
}

export default function Career() {
  const [tab, setTab] = useState('jobs');
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center"><User size={20} className="text-[var(--primary)]" /></div>
        <div>
          <h1 className="text-page-title theme-text">Career Center</h1>
          <p className="text-caption theme-text-muted mt-0.5">Jobs, readiness, and your professional profile</p>
        </div>
      </div>
      <Tabs
        tabs={[{ id: 'jobs', label: 'Jobs' }, { id: 'applications', label: 'Applications' }, { id: 'profile', label: 'Profile' }, { id: 'readiness', label: 'Readiness' }, { id: 'resume', label: 'Resume' }]}
        active={tab}
        onChange={setTab}
      />
      {tab === 'jobs' && <JobsTab />}
      {tab === 'applications' && <ApplicationsTab />}
      {tab === 'profile' && <ProfileTab />}
      {tab === 'readiness' && <ReadinessTab />}
      {tab === 'resume' && <ResumeTab />}
    </motion.div>
  );
}
