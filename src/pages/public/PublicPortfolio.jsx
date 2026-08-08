import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../../api/client';
import {
  ArrowLeft, BadgeCheck, Briefcase, Code2, ExternalLink, FileText, GitBranch, GraduationCap,
  Share2, MapPin, Medal, BookOpen, ShieldX, Sparkles,
} from 'lucide-react';

const statusBadge = (status) => {
  const map = {
    placed: { label: 'Placed', className: 'bg-emerald-500/10 text-emerald-400' },
    offered: { label: 'Offer Received', className: 'bg-emerald-500/10 text-emerald-400' },
    shortlisted: { label: 'Shortlisted', className: 'bg-sky-500/10 text-sky-400' },
    eligible: { label: 'Eligible', className: 'bg-amber-500/10 text-amber-400' },
  };
  return map[status] || { label: 'Not updated', className: 'bg-[var(--hover)] theme-text-muted' };
};

const skillColor = (score) => (score >= 75 ? 'bg-emerald-500/10 text-emerald-400' : score >= 50 ? 'bg-indigo-500/10 text-indigo-400' : score >= 30 ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400');

const Reveal = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-40px' }}
    transition={{ duration: 0.5, delay }}
  >
    {children}
  </motion.div>
);

const SectionTitle = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2 mb-4">
    <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
      <Icon className="text-white" size={15} />
    </div>
    <h3 className="text-card-subtitle theme-text">{title}</h3>
  </div>
);

export default function PublicPortfolio() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    API.get(`/portfolio/by-register/${slug}`)
      .then(({ data }) => { if (!cancelled) { setData(data); setStatus('ok'); } })
      .catch((err) => { if (!cancelled) { setStatus(err.response?.status === 404 ? 'not-found' : err.response?.status === 403 ? 'private' : 'error'); } });
    return () => { cancelled = true; };
  }, [slug]);

  const p = data?.portfolio;

  if (status === 'loading') {
    return (
      <div className="min-h-screen theme-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === 'private' || status === 'not-found' || status === 'error') {
    return (
      <div className="min-h-screen theme-bg flex items-center justify-center p-6">
        <div className="theme-card border theme-border rounded-2xl p-10 max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto mb-4">
            <ShieldX className="text-rose-400" size={26} />
          </div>
          <h1 className="text-lg font-semibold theme-text mb-2">
            {status === 'private' ? 'This portfolio is private' : status === 'not-found' ? 'Student not found' : 'Something went wrong'}
          </h1>
          <p className="text-sm theme-text-muted mb-6">
            {status === 'private'
              ? 'The student has not made their portfolio public yet.'
              : status === 'not-found'
                ? 'No student exists with this register number.'
                : 'Please try again later.'}
          </p>
          <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-accent text-white text-sm font-semibold hover:opacity-90 transition-opacity">
            <ArrowLeft size={15} /> Back to ISDS
          </Link>
        </div>
      </div>
    );
  }

  const badge = statusBadge(p.student.placementStatus);

  return (
    <div className="min-h-screen theme-bg ambient-bg">
      {/* Cover */}
      <div className="relative h-52 overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 grid-pattern" />
        <div className="absolute -top-10 -right-10 w-64 h-64 orb orb-primary" />
        <div className="absolute bottom-0 left-0 w-0 h-0" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-20">
        {/* Identity */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="relative -mt-24"
        >
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            {p.student.profilePhoto ? (
              <img src={p.student.profilePhoto} alt={p.student.name} className="w-28 h-28 rounded-3xl border-4 theme-border object-cover card-shadow-lg" />
            ) : (
              <div className="w-28 h-28 rounded-3xl border-4 theme-border gradient-accent flex items-center justify-center card-shadow-lg">
                <GraduationCap className="text-white" size={44} />
              </div>
            )}
            <div className="flex-1 sm:pb-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-page-title theme-text">{p.student.name}</h1>
                {p.student.cgpa != null && <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400">CGPA {p.student.cgpa}</span>}
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badge.className}`}>{badge.label}</span>
              </div>
              {p.headline && <p className="text-base theme-text-secondary mt-0.5">{p.headline}</p>}
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm theme-text-muted">
                <span className="flex items-center gap-1.5"><MapPin size={13} /> {p.student.registerNumber} · {p.student.department || 'Student'}</span>
                <span className="flex items-center gap-1.5"><BookOpen size={13} /> {p.student.program || 'Program'} · Sem {p.student.semester || '—'} · {p.student.batch || ''}</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-2 mt-5">
            {p.links.github && <a href={p.links.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl theme-input border theme-border text-xs theme-text-secondary hover:bg-[var(--hover)] transition-colors"><GitBranch size={13} /> GitHub</a>}
            {p.links.linkedin && <a href={p.links.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl theme-input border theme-border text-xs theme-text-secondary hover:bg-[var(--hover)] transition-colors"><Share2 size={13} /> LinkedIn</a>}
            {p.links.portfolioUrl && <a href={p.links.portfolioUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl theme-input border theme-border text-xs theme-text-secondary hover:bg-[var(--hover)] transition-colors"><ExternalLink size={13} /> Personal Site</a>}
            {p.links.leetcode && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl theme-input border theme-border text-xs theme-text-secondary"><Code2 size={13} /> LeetCode: {p.links.leetcode}</span>}
            {p.student.careerGoal && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl theme-input border theme-border text-xs theme-text-secondary"><Sparkles size={13} /> Goal: {p.student.careerGoal}</span>}
          </div>
        </motion.div>

        {/* Stats */}
        <Reveal>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
            {[
              { value: p.academics.courses, label: 'Courses completed', icon: BookOpen },
              { value: p.topSkills.length, label: 'Skills', icon: Medal },
              { value: p.projects.length, label: 'Projects', icon: Briefcase },
              { value: p.student.codingProblemsSolved ?? '—', label: 'Problems solved', icon: Code2 },
            ].map((s) => (
              <div key={s.label} className="theme-card border theme-border rounded-2xl p-4 text-center card-shadow-premium">
                <s.icon className="mx-auto mb-2 text-[var(--primary)]" size={18} />
                <div className="text-2xl font-extrabold theme-text">{s.value}</div>
                <div className="text-[11px] uppercase tracking-wide theme-text-muted mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* About */}
        {p.summary && (
          <Reveal>
            <div className="theme-card border theme-border rounded-2xl p-6 mt-8">
              <SectionTitle icon={FileText} title="About" />
              <p className="text-sm theme-text-secondary leading-relaxed">{p.summary}</p>
            </div>
          </Reveal>
        )}

        {/* Skills */}
        <Reveal>
          <div className="theme-card border theme-border rounded-2xl p-6 mt-8">
            <SectionTitle icon={Medal} title="Top Skills" />
            <div className="flex flex-wrap gap-2">
              {p.topSkills.map((s) => (
                <span key={s.name} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${skillColor(s.score)}`}>
                  {s.name} <span className="opacity-70 font-bold">{s.score}%</span>
                </span>
              ))}
              {!p.topSkills.length && <p className="text-sm theme-text-muted">No skills captured yet.</p>}
            </div>
          </div>
        </Reveal>

        {/* Projects */}
        <Reveal>
          <div className="theme-card border theme-border rounded-2xl p-6 mt-8">
            <SectionTitle icon={Briefcase} title="Projects" />
            {p.projects.length === 0 ? (
              <p className="text-sm theme-text-muted">No public projects yet.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {p.projects.map((pr) => (
                  <div key={pr.id} className="theme-input border theme-border rounded-xl p-4 card-hover">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold theme-text">{pr.title}</h4>
                      <span className="shrink-0 text-[10px] uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400">{pr.status}</span>
                    </div>
                    {pr.description && <p className="text-xs theme-text-muted mt-1.5 line-clamp-2">{pr.description}</p>}
                    {pr.techStack?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {pr.techStack.slice(0, 5).map((t) => <span key={t} className="text-[10px] px-2 py-0.5 rounded-full theme-subtle theme-text-muted">{t}</span>)}
                      </div>
                    )}
                    <div className="flex gap-3 mt-3">
                      {pr.githubUrl && <a href={pr.githubUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-[var(--primary)] hover:underline"><GitBranch size={12} /> Code</a>}
                      {pr.demoUrl && <a href={pr.demoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-[var(--primary)] hover:underline"><ExternalLink size={12} /> Demo</a>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Reveal>

        {/* Internships & Research */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <Reveal>
            <div className="theme-card border theme-border rounded-2xl p-6 h-full">
              <SectionTitle icon={BadgeCheck} title="Internships" />
              {p.internships.length === 0 ? (
                <p className="text-sm theme-text-muted">No internships yet.</p>
              ) : (
                <div className="space-y-3">
                  {p.internships.map((i) => (
                    <div key={i.id} className="rounded-xl p-3.5 theme-input border theme-border">
                      <div className="text-sm font-semibold theme-text">{i.role}</div>
                      <div className="text-xs theme-text-secondary">{i.company}</div>
                      <div className="text-[11px] theme-text-muted mt-1 flex items-center justify-between">
                        <span>{i.status}</span>
                        {i.startDate && <span>{new Date(i.startDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="theme-card border theme-border rounded-2xl p-6 h-full">
              <SectionTitle icon={FileText} title="Research & Publications" />
              {p.research.length === 0 ? (
                <p className="text-sm theme-text-muted">No publications yet.</p>
              ) : (
                <div className="space-y-3">
                  {p.research.map((r) => (
                    <div key={r.id} className="rounded-xl p-3.5 theme-input border theme-border">
                      <div className="text-sm font-semibold theme-text">{r.title}</div>
                      <div className="text-xs theme-text-secondary capitalize">{r.type}{r.venue ? ` · ${r.venue}` : ''}</div>
                      {r.link && <a href={r.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-[var(--primary)] hover:underline mt-1"><ExternalLink size={11} /> View</a>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Reveal>
        </div>

        {/* Certificates */}
        {p.certificates.length > 0 && (
          <Reveal>
            <div className="theme-card border theme-border rounded-2xl p-6 mt-8">
              <SectionTitle icon={Medal} title="Certifications" />
              <div className="flex flex-wrap gap-2">
                {p.certificates.map((c) => (
                  <span key={c.title} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full theme-input border theme-border text-xs theme-text-secondary">
                    <BadgeCheck size={13} className="text-emerald-400" /> {c.title}{c.organization ? ` · ${c.organization}` : ''}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        )}

        {/* Footer */}
        <div className="text-center mt-12">
          <Link to="/" className="inline-flex items-center gap-2 text-sm theme-text-muted hover:theme-text transition-colors">
            <GraduationCap size={15} /> Powered by ISDS — Intelligent Student Development System
          </Link>
        </div>
      </div>
    </div>
  );
}
