import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import API from '../../api/client';
import toast from 'react-hot-toast';
import { DashboardSkeleton } from '../../components/ui/Skeleton';
import { BookOpen, CalendarCheck, BarChart3, TrendingUp, Clock, ArrowRight, GraduationCap, Briefcase, Share2, Copy, Check, Rocket, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [placement, setPlacement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    API.get('/students/dashboard')
      .then(({ data }) => setData(data))
      .catch(console.error)
      .finally(() => setLoading(false));
    API.get('/career/placement/summary')
      .then(({ data }) => setPlacement(data))
      .catch(() => {});
  }, []);

  const portfolioUrl = user?.registerNumber ? `/student/${user.registerNumber}` : null;

  const copyPortfolioLink = async () => {
    if (!portfolioUrl) return;
    const url = `${window.location.origin}${portfolioUrl}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Portfolio link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy link');
    }
  };

  if (loading) return <DashboardSkeleton />;

  const stats = data?.stats || {};
  const enrollments = data?.enrollments || [];
  const upcomingAssignments = data?.upcomingAssignments || [];
  const notifications = data?.notifications || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="gradient-hero rounded-2xl p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 theme-input rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 theme-input rounded-full translate-y-24 -translate-x-24" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold theme-text font-heading">Welcome back, {user?.name}</h1>
            <p className="theme-text mt-1">
              {user?.program || 'Program'} · {user?.department || 'Department'}
              {user?.registerNumber && <span className="ml-2 text-xs theme-text-muted">Reg: {user.registerNumber}</span>}
            </p>
            <p className="text-xs theme-text-muted mt-1">
              {user?.semester && <span className="mr-3">Semester {user.semester}</span>}
              {user?.batch && <span className="mr-3">Batch {user.batch}</span>}
              {user?.section && <span className="mr-3">Section {user.section}</span>}
              {user?.facultyAdvisor && <span>Faculty Advisor: {user.facultyAdvisor}</span>}
            </p>
          </div>
          {user?.cgpa != null && (
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold theme-text">{user.cgpa}</p>
                <p className="text-xs theme-text-muted">CGPA</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold theme-text">{user.creditsEarned ?? '—'}<span className="text-base theme-text-muted">/{user.creditsRequired || '—'}</span></p>
                <p className="text-xs theme-text-muted">Credits</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Enrolled Courses', value: stats.totalCourses, icon: BookOpen, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
          { label: 'Avg Progress', value: `${stats.avgProgress}%`, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Attendance', value: `${stats.attendanceRate}%`, icon: CalendarCheck, color: 'text-violet-500', bg: 'bg-violet-500/10' },
          { label: 'Avg Quiz Score', value: `${stats.avgQuizScore}%`, icon: BarChart3, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="theme-card rounded-2xl p-5 card-shadow-premium"
          >
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon size={20} className={stat.color} />
            </div>
            <p className="text-2xl font-bold theme-text">{stat.value}</p>
            <p className="text-xs theme-text-muted mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Placement Readiness */}
        <div className="theme-card rounded-2xl p-5 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-card-subtitle theme-text flex items-center gap-2"><Rocket size={16} className="text-emerald-500" /> Placement Readiness</h2>
            <Link to="/placement" className="text-xs text-indigo-500 hover:underline inline-flex items-center gap-1">Open Placement Cell <ArrowRight size={12} /></Link>
          </div>
          {placement ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs theme-text-muted">Career readiness score</span>
                  <span className="text-sm font-semibold theme-text">{placement.stats?.readiness ?? 0}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${placement.stats?.readiness >= 70 ? 'bg-emerald-500' : placement.stats?.readiness >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${placement.stats?.readiness ?? 0}%` }} />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { label: 'Open drives', value: placement.stats?.openDrives ?? 0, cls: 'text-indigo-500' },
                  { label: 'Applied', value: placement.stats?.applied ?? 0, cls: 'text-amber-500' },
                  { label: 'Shortlisted', value: placement.stats?.shortlisted ?? 0, cls: 'text-violet-500' },
                  { label: 'Selected', value: placement.stats?.selected ?? 0, cls: 'text-emerald-500' },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl bg-white/5 py-3">
                    <p className={`text-lg font-bold ${s.cls}`}>{s.value}</p>
                    <p className="text-[11px] theme-text-muted mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
              {(placement.stats?.openDrives ?? 0) > 0 && (
                <Link to="/placement" className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-500 hover:underline"><UserCheck size={13} /> View open drives & eligibility</Link>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 text-sm theme-text-muted">Loading readiness…</div>
          )}
        </div>

        {/* Shareable Career Portfolio */}
        <div className="theme-card rounded-2xl p-5 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-card-subtitle theme-text flex items-center gap-2"><Share2 size={16} className="text-indigo-500" /> Career Portfolio</h2>
            <Link to="/portfolio" className="text-xs text-indigo-500 hover:underline">Edit profile</Link>
          </div>
          {portfolioUrl ? (
            <div className="space-y-3">
              <p className="text-xs theme-text-muted leading-relaxed">
                Share your public portfolio with recruiters and placement officers. Recruiters discover you through the candidate directory once your profile is public.
              </p>
              <div className="flex items-center gap-2">
                <Link to={portfolioUrl} className="flex-1 min-w-0 inline-flex items-center gap-2 rounded-xl bg-white/5 px-3.5 py-2.5 text-sm theme-text truncate hover:bg-white/10 transition-colors">
                  <Briefcase size={15} className="text-[var(--primary)] shrink-0" />
                  <span className="truncate">{portfolioUrl}</span>
                </Link>
                <button onClick={copyPortfolioLink} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-theme-text-muted hover:text-[var(--primary)]" title="Copy link">
                  {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 text-sm theme-text-muted">Complete your profile to generate a shareable link</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrolled Courses */}
        <div className="theme-card rounded-2xl p-5 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-card-subtitle theme-text">My Courses</h2>
            <Link to="/courses" className="text-xs text-indigo-500 hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {enrollments.slice(0, 5).map((enrollment) => (
              <Link key={enrollment.id} to={`/learning/${enrollment.course.id}`}
                className="flex items-center gap-3 p-3 rounded-xl hover:theme-hover transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <BookOpen size={18} className="text-indigo-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium theme-text truncate">{enrollment.course.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${enrollment.progress}%` }} />
                    </div>
                    <span className="text-xs theme-text-muted">{Math.round(enrollment.progress)}%</span>
                  </div>
                </div>
                <ArrowRight size={16} className="theme-text-muted" />
              </Link>
            ))}
            {enrollments.length === 0 && (
              <div className="text-center py-6">
                <GraduationCap size={32} className="mx-auto theme-text-muted mb-2" />
                <p className="text-sm theme-text-muted">No courses enrolled yet</p>
                <Link to="/courses" className="text-sm text-indigo-500 hover:underline mt-2 inline-block">Browse Courses</Link>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="theme-card rounded-2xl p-5 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-card-subtitle theme-text">Upcoming Deadlines</h2>
            <Link to="/assignments" className="text-xs text-indigo-500 hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {upcomingAssignments.map((assignment) => (
              <div key={assignment.id} className="flex items-center gap-3 p-3 rounded-xl hover:theme-hover transition-colors">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Clock size={18} className="text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium theme-text truncate">{assignment.title}</p>
                  <p className="text-xs theme-text-muted">{assignment.course?.title} • Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-amber-500/10 text-amber-500">
                  {Math.ceil((new Date(assignment.dueDate) - new Date()) / (1000 * 60 * 60 * 24))}d
                </span>
              </div>
            ))}
            {upcomingAssignments.length === 0 && (
              <p className="text-sm theme-text-muted text-center py-6">No upcoming deadlines</p>
            )}
          </div>
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="theme-card rounded-2xl p-5 card-shadow">
          <h2 className="text-card-subtitle theme-text mb-4">Recent Notifications</h2>
          <div className="space-y-2">
            {notifications.slice(0, 5).map((n) => (
              <div key={n.id} className="flex items-center gap-3 p-3 rounded-xl hover:theme-hover transition-colors">
                <div className={`w-2 h-2 rounded-full ${n.isRead ? 'bg-transparent' : 'bg-indigo-500'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm theme-text">{n.title}</p>
                  <p className="text-xs theme-text-muted">{n.message}</p>
                </div>
                <span className="text-xs theme-text-muted">{new Date(n.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}