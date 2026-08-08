import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, animate } from 'framer-motion';
import {
  ArrowRight, BarChart3, Briefcase, Brain, CalendarCheck, CheckCircle2, ChevronDown,
  Code2, FileText, GraduationCap, Menu, Moon, Play, Quote, Rocket, ShieldCheck, Sparkles,
  Star, Sun, Target, Users, X, Zap,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Platform', href: '#platform' },
  { label: 'Impact', href: '#impact' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'FAQ', href: '#faq' },
];

const FEATURES = [
  { icon: Brain, title: 'AI Academic Advisor', description: 'A data-grounded advisor that answers from your real record — CGPA, attendance, pending assignments and quiz gaps, instantly.', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  { icon: CalendarCheck, title: 'Smart Study Planner', description: 'Auto-generates a deadline-first weekly schedule from your actual workload and weak areas. Explainable, editable, deadline-aware.', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { icon: Code2, title: 'Coding Lab', description: 'Practice problems with a Monaco editor and live execution. Code is graded in an isolated sandbox — never on the app server.', color: 'text-violet-400', bg: 'bg-violet-500/10' },
  { icon: Target, title: 'Skill Gap Analyzer', description: 'Pick any career role and see exactly which skills to close, with a step-by-step learning path and recommended certifications.', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { icon: Briefcase, title: 'Placement Cell', description: 'Drives, eligibility checks, applications and shortlists — a single command centre for the campus placement season.', color: 'text-sky-400', bg: 'bg-sky-500/10' },
  { icon: FileText, title: 'Resume & Portfolio', description: 'An ATS-ready resume plus a shareable public portfolio page that recruiters can open with a single link.', color: 'text-rose-400', bg: 'bg-rose-500/10' },
  { icon: Users, title: 'Mock Interviews', description: 'Role-specific interview drills with instant scoring, feedback and improvement tracking across every session.', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { icon: BarChart3, title: 'Analytics Center', description: 'Attendance trends, quiz performance, course progress and career readiness — visualized for students, teachers and admins.', color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10' },
];

const STATS = [
  { value: 12, suffix: 'K+', label: 'Students guided' },
  { value: 480, suffix: '+', label: 'Courses & labs' },
  { value: 350, suffix: '+', label: 'Companies partnered' },
  { value: 94, suffix: '%', label: 'Placement support' },
];

const TESTIMONIALS = [
  { quote: 'The skill gap analyzer told me exactly what to learn for my target role. I went from not knowing to shortlisted in one placement season.', name: 'Ananya R.', role: 'Final year, CSE', initials: 'AR' },
  { quote: 'As a placement officer, having one dashboard for drives, eligibility and shortlists changed how our TPO team works.', name: 'Dr. Suresh Menon', role: 'Placement Officer', initials: 'SM' },
  { quote: 'The AI advisor reads my real data — it tells me my pending assignments and attendance without me digging through three portals.', name: 'Kabir Singh', role: 'Third year, IT', initials: 'KS' },
];

const FAQS = [
  { q: 'Who is ISDS built for?', a: 'Students, teachers, placement officers, recruiters and parents. Every role gets its own workspace — academic tracking for faculty, placements for the TPO, talent search for recruiters, and a growth cockpit for students.' },
  { q: 'How does the AI advisor get my data?', a: 'It reads your verified college record — CGPA, attendance, assignments, quizzes and skills — from the platform. Every answer links back to the numbers behind it, so nothing is guessed.' },
  { q: 'Is my portfolio private?', a: 'Yes. Your public portfolio is opt-in. Projects, certificates, internships and research only appear if you mark them public or verified; everything else stays behind login.' },
  { q: 'Does the coding lab run code on the platform server?', a: 'No. Submissions are dispatched to an isolated execution sandbox and results are returned for grading. Arbitrary code is never executed on the application server.' },
  { q: 'Can parents track progress?', a: 'Parents get a read-only dashboard with attendance, performance and assignment status for their linked children.' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] } }),
};

const Reveal = ({ children, className, delay = 0 }) => (
  <motion.div
    className={className}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: '-60px' }}
    variants={fadeUp}
    custom={delay}
  >
    {children}
  </motion.div>
);

const CountUp = ({ value, suffix }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return undefined;
    const controls = animate(0, value, { duration: 1.6, ease: 'easeOut', onUpdate: (v) => setDisplay(Math.round(v)) });
    return () => controls.stop();
  }, [inView, value]);

  return <span ref={ref}>{display}{suffix}</span>;
};

const FAQItem = ({ q, a, open, onToggle }) => (
  <div className="theme-card border theme-border rounded-2xl overflow-hidden">
    <button onClick={onToggle} className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-[var(--hover)] transition-colors">
      <span className="font-medium theme-text">{q}</span>
      <ChevronDown className={`shrink-0 theme-text-muted transition-transform duration-300 ${open ? 'rotate-180' : ''}`} size={18} />
    </button>
    <motion.div initial={false} animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
      <p className="px-5 pb-5 text-sm theme-text-secondary leading-relaxed">{a}</p>
    </motion.div>
  </div>
);

const HeroMock = () => (
  <div className="relative">
    <div className="absolute -inset-6 rounded-3xl bg-gradient-to-tr from-indigo-500/20 via-transparent to-violet-500/20 blur-2xl" />
    <div className="relative glass rounded-2xl border theme-border shadow-2xl p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
        </div>
        <span className="ml-2 text-xs theme-text-muted font-mono">isds / dashboard</span>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { label: 'CGPA', value: '8.60', color: 'text-indigo-400' },
          { label: 'Readiness', value: '86%', color: 'text-emerald-400' },
          { label: 'Attendance', value: '94%', color: 'text-amber-400' },
        ].map((s) => (
          <div key={s.label} className="theme-card border theme-border rounded-xl p-3 text-center">
            <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
            <div className="text-[10px] uppercase tracking-wider theme-text-muted">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between p-3 rounded-xl theme-input border theme-border">
          <div className="flex items-center gap-2">
            <Sparkles className="text-indigo-400" size={14} />
            <span className="text-xs theme-text">AI Advisor</span>
          </div>
          <span className="text-xs text-emerald-400">● Online</span>
        </div>
        <div className="rounded-xl p-3 border theme-border theme-input">
          <div className="h-2 w-3/4 rounded bg-[var(--hover)] mb-2" />
          <div className="h-2 w-1/2 rounded bg-[var(--hover)]" />
        </div>
        <div className="rounded-xl p-3 border theme-border theme-input">
          <div className="flex justify-between mb-2">
            <span className="text-xs theme-text">Skill Gap · Full Stack</span>
            <span className="text-xs text-indigo-400 font-semibold">68%</span>
          </div>
          <div className="h-2 rounded bg-[var(--hover)] overflow-hidden">
            <div className="h-full w-[68%] gradient-accent rounded" />
          </div>
        </div>
      </div>
    </div>

    <div className="absolute -top-5 -right-3 sm:-right-6 animate-float">
      <div className="glass rounded-2xl px-4 py-3 border theme-border shadow-xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full gradient-success flex items-center justify-center">
            <CheckCircle2 className="text-white" size={16} />
          </div>
          <div>
            <div className="text-xs font-semibold theme-text">Assignment graded</div>
            <div className="text-[10px] theme-text-muted">DSA · 92%</div>
          </div>
        </div>
      </div>
    </div>

    <div className="absolute -bottom-5 -left-3 sm:-left-6 animate-float" style={{ animationDelay: '1.5s' }}>
      <div className="glass rounded-2xl px-4 py-3 border theme-border shadow-xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full gradient-accent flex items-center justify-center">
            <Rocket className="text-white" size={16} />
          </div>
          <div>
            <div className="text-xs font-semibold theme-text">Shortlisted</div>
            <div className="text-[10px] theme-text-muted">TechNova Campus Drive</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Landing = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [demoOpen, setDemoOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const dashboardPath = user?.role
    ? user.role === 'student' ? '/dashboard'
      : user.role === 'teacher' ? '/teacher/dashboard'
        : user.role === 'parent' ? '/parent/dashboard'
          : user.role === 'recruiter' ? '/recruiter/dashboard'
            : '/admin/dashboard'
    : '/auth';

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) setSubscribed(true);
  };

  return (
    <div className="min-h-screen theme-bg ambient-bg">
      {/* Navbar */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-6xl">
        <nav className="glass-nav rounded-2xl px-4 sm:px-6 py-3 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl gradient-accent flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <GraduationCap className="text-white" size={20} />
            </div>
            <div className="leading-tight">
              <div className="font-bold theme-text text-sm">ISDS</div>
              <div className="text-[10px] theme-text-muted -mt-0.5">Campus Growth Platform</div>
            </div>
          </a>

          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="text-sm theme-text-secondary hover:theme-text transition-colors">
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-[var(--hover)] theme-text-muted transition-colors" aria-label="Toggle theme">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {isAuthenticated ? (
              <Link to={dashboardPath} className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl gradient-accent text-white text-sm font-medium shadow-lg shadow-indigo-500/30 hover:opacity-90 transition-opacity">
                Open Dashboard <ArrowRight size={14} />
              </Link>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 rounded-xl text-sm font-medium theme-text-secondary hover:bg-[var(--hover)] transition-colors">Log in</Link>
                <Link to="/register" className="px-4 py-2 rounded-xl gradient-accent text-white text-sm font-medium shadow-lg shadow-indigo-500/30 hover:opacity-90 transition-opacity">Get Started</Link>
              </div>
            )}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg hover:bg-[var(--hover)] theme-text" aria-label="Menu">
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
        {menuOpen && (
          <div className="mt-2 glass-nav rounded-2xl p-4 md:hidden">
            <div className="flex flex-col gap-2">
              {NAV_LINKS.map((l) => (
                <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-[var(--hover)] theme-text text-sm">
                  {l.label}
                </a>
              ))}
              <Link to="/auth" onClick={() => setMenuOpen(false)} className="px-3 py-2 rounded-lg gradient-accent text-white text-sm font-medium text-center">
                Get Started
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section id="top" className="relative overflow-hidden pt-36 sm:pt-40 pb-20">
        <div className="absolute inset-0 grid-pattern" />
        <div className="absolute top-0 left-1/4 w-96 h-96 orb orb-primary" />
        <div className="absolute top-40 right-0 w-80 h-80 orb orb-violet" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full theme-input border theme-border text-xs font-medium theme-text-secondary mb-6">
                <span className="status-dot status-dot-active" />
                AI-powered campus career readiness
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
              className="text-hero theme-text mb-5"
            >
              Turn every student into{' '}
              <span className="text-gradient">job-ready</span> before graduation.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg theme-text-secondary mb-8 max-w-xl leading-relaxed"
            >
              ISDS unifies academics, skills, coding practice, mock interviews and placements in one
              intelligent platform — with an AI advisor that understands each student&apos;s real record.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-3 mb-10"
            >
              <Link to={isAuthenticated ? dashboardPath : '/register'} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-accent text-white font-semibold shadow-xl shadow-indigo-500/30 hover:opacity-90 hover:-translate-y-0.5 transition-all">
                {isAuthenticated ? 'Open Dashboard' : 'Start Free'} <ArrowRight size={16} />
              </Link>
              <button
                onClick={() => setDemoOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl theme-input border theme-border font-semibold theme-text hover:bg-[var(--hover)] hover:-translate-y-0.5 transition-all"
              >
                <span className="w-6 h-6 rounded-full gradient-accent flex items-center justify-center"><Play className="text-white" size={12} /></span>
                Watch Demo
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap items-center gap-4 text-sm theme-text-muted"
            >
              <div className="flex -space-x-2">
                {['AR', 'SM', 'KS', 'VP'].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full gradient-accent border-2 theme-border flex items-center justify-center text-[10px] text-white font-semibold">{i}</div>
                ))}
              </div>
              <span>Trusted by 12,000+ students across 40+ colleges</span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.25 }}
            className="relative pt-8 lg:pt-0"
          >
            <HeroMock />
          </motion.div>
        </div>
      </section>

      {/* Stats band */}
      <section id="impact" className="py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <Reveal>
            <div className="glass rounded-3xl border theme-border px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
              {STATS.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-3xl sm:text-4xl font-extrabold text-gradient">
                    <CountUp value={s.value} suffix={s.suffix} />
                  </div>
                  <div className="text-xs uppercase tracking-wider theme-text-muted mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <Reveal className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-micro theme-text-muted">Everything in one platform</span>
            <h2 className="text-section theme-text mt-2 mb-3">Built for the full college journey</h2>
            <p className="theme-text-secondary">
              From the first semester to the final offer letter — academics, skills and career readiness
              live in one connected system.
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i % 4}>
                <div className="group h-full theme-card border theme-border rounded-2xl p-6 card-shadow-premium card-glow hover:border-indigo-500/30 transition-colors">
                  <div className={`w-11 h-11 rounded-xl ${f.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <f.icon className={f.color} size={22} />
                  </div>
                  <h3 className="font-semibold theme-text mb-2">{f.title}</h3>
                  <p className="text-sm theme-text-muted leading-relaxed">{f.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Platform / how it works */}
      <section id="platform" className="py-20 theme-bg-alt">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <Reveal className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-micro theme-text-muted">How it works</span>
            <h2 className="text-section theme-text mt-2 mb-3">From campus to career in three steps</h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: '01', icon: GraduationCap, title: 'Learn & track', desc: 'Courses, assignments, quizzes and attendance are tracked automatically for every student.' },
              { step: '02', icon: Target, title: 'Build skills', desc: 'Coding lab, mock interviews, projects and the AI skill-gap analyzer close the distance to your target role.' },
              { step: '03', icon: Briefcase, title: 'Get placed', desc: 'Placement drives, eligibility checks, resumes and shortlists flow through one command centre.' },
            ].map((s, i) => (
              <Reveal key={s.step} delay={i}>
                <div className="relative theme-card border theme-border rounded-2xl p-7 card-hover h-full">
                  <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-indigo-500/20 to-violet-500/20 absolute top-4 right-5">
                    {s.step}
                  </div>
                  <div className="w-12 h-12 rounded-2xl gradient-accent flex items-center justify-center mb-5">
                    <s.icon className="text-white" size={22} />
                  </div>
                  <h3 className="font-semibold theme-text text-lg mb-2">{s.title}</h3>
                  <p className="text-sm theme-text-muted leading-relaxed">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-14">
            <div className="glass rounded-3xl border theme-border p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl gradient-violet flex items-center justify-center shrink-0">
                  <ShieldCheck className="text-white" size={26} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold theme-text">Safe by design</h3>
                  <p className="text-sm theme-text-secondary">Role-based access, verified certificates and opt-in public portfolios keep student data protected.</p>
                </div>
              </div>
              <Link to="/register" className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-accent text-white font-semibold hover:opacity-90 transition-opacity">
                Create a free account <ArrowRight size={16} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <Reveal className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-micro theme-text-muted">Loved across campuses</span>
            <h2 className="text-section theme-text mt-2 mb-3">What people say</h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i}>
                <div className="theme-card border theme-border rounded-2xl p-7 card-shadow-premium h-full flex flex-col">
                  <Quote className="theme-text-muted/40 mb-4" size={28} />
                  <p className="text-sm theme-text-secondary leading-relaxed flex-1">“{t.quote}”</p>
                  <div className="flex items-center gap-1 mt-5 text-amber-400">
                    {Array.from({ length: 5 }).map((_, j) => <Star key={j} size={14} fill="currentColor" />)}
                  </div>
                  <div className="flex items-center gap-3 mt-4">
                    <div className="w-10 h-10 rounded-full gradient-accent flex items-center justify-center text-white text-xs font-bold">{t.initials}</div>
                    <div>
                      <div className="text-sm font-semibold theme-text">{t.name}</div>
                      <div className="text-xs theme-text-muted">{t.role}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 theme-bg-alt">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Reveal className="text-center mb-10">
            <span className="text-micro theme-text-muted">Questions</span>
            <h2 className="text-section theme-text mt-2">Frequently asked</h2>
          </Reveal>
          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <Reveal key={f.q} delay={i * 0.05}>
                <FAQItem q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? -1 : i)} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA + newsletter */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl gradient-hero border theme-border p-10 sm:p-16 text-center">
              <div className="absolute inset-0 grid-pattern" />
              <div className="relative">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full theme-input border theme-border text-xs font-medium theme-text-secondary mb-6">
                  <Zap className="text-amber-400" size={14} /> Ready when you are
                </span>
                <h2 className="text-section theme-text mb-3">Start your journey today</h2>
                <p className="theme-text-secondary mb-8 max-w-xl mx-auto">
                  Join the campus growth platform that connects academics with careers — free for students and institutions.
                </p>
                <div className="flex flex-wrap justify-center gap-3 mb-10">
                  <Link to="/register" className="px-7 py-3 rounded-xl gradient-accent text-white font-semibold shadow-xl shadow-indigo-500/30 hover:opacity-90 hover:-translate-y-0.5 transition-all">
                    Get Started Free
                  </Link>
                  <Link to="/auth" className="px-7 py-3 rounded-xl theme-input border theme-border font-semibold theme-text hover:bg-[var(--hover)] transition-colors">
                    Explore Roles
                  </Link>
                </div>

                <div className="max-w-md mx-auto">
                  {subscribed ? (
                    <div className="flex items-center justify-center gap-2 text-emerald-400 font-medium">
                      <CheckCircle2 size={18} /> You&apos;re on the list — watch your inbox.
                    </div>
                  ) : (
                    <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@college.edu"
                        className="flex-1 theme-input border theme-border rounded-xl px-4 py-3 text-sm theme-text placeholder-theme-muted focus:outline-none focus:border-indigo-500/50"
                      />
                      <button type="submit" className="px-5 py-3 rounded-xl theme-card border theme-border font-semibold theme-text hover:bg-[var(--hover)] transition-colors">
                        Get product updates
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t theme-border py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
              <GraduationCap className="text-white" size={16} />
            </div>
            <span className="font-semibold theme-text text-sm">ISDS — Intelligent Student Development System</span>
          </div>
          <div className="text-xs theme-text-muted">
            © {new Date().getFullYear()} ISDS. Built for students, colleges & recruiters.
          </div>
        </div>
      </footer>

      {/* Demo modal */}
      {demoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDemoOpen(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
            className="relative glass-strong rounded-2xl w-full max-w-lg p-6"
          >
            <button onClick={() => setDemoOpen(false)} className="absolute top-3 right-3 p-2 rounded-lg hover:bg-[var(--hover)] theme-text-muted transition-colors" aria-label="Close">
              <X size={18} />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center">
                <Sparkles className="text-white" size={18} />
              </div>
              <div>
                <h3 className="font-semibold theme-text">Product demo</h3>
                <p className="text-xs theme-text-muted">See how ISDS guides a student from semester one to placement.</p>
              </div>
            </div>
            <div className="theme-card border theme-border rounded-xl p-3 mb-4">
              <HeroMock />
            </div>
            <Link
              to="/register"
              onClick={() => setDemoOpen(false)}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl gradient-accent text-white font-semibold hover:opacity-90 transition-opacity"
            >
              Try the live app <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Landing;
