import { useState, useEffect } from 'react';
import { getHours } from 'date-fns';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { FiCalendar, FiBookOpen, FiClipboard, FiAward, FiActivity, FiClock, FiChevronRight, FiTrendingUp, FiTarget, FiArrowRight, FiGrid } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { Card, KpiCard, Button, SectionHeader, PageTransition, Avatar, Badge, ProgressBar } from '../../components/ui';
import { PageSkeleton } from '../../components/shared/LoadingSkeleton';
import { useStudentData } from '../../hooks/useStudentData';
import { useAuth } from '../../hooks/useAuth';
import { getDeadlineStatus } from '../../utils/helpers';

const getGreeting = () => {
  const hour = getHours(new Date());
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } },
};

const AnimatedKpi = ({ value, ...props }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, v => Math.round(v));
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    const numeric = parseInt(String(value)) || 0;
    const controls = animate(count, numeric, { duration: 0.8, ease: 'easeOut' });
    const unsubscribe = rounded.on('change', v => setDisplay(String(v)));
    return () => { controls.stop(); unsubscribe(); };
  }, [value, count, rounded]);

  return <KpiCard value={display} {...props} />;
};

const StudentDashboard = () => {
  const { user } = useAuth();
  const { student, attendance, assignments, certificates, courses, loading, error, refetch } = useStudentData();

  const enrolledCourses = courses?.filter?.(c => student?.enrolledCourses?.includes?.(c._id)) || [];
  const enrolledCount = student?.enrolledCourses?.length || 0;
  const attendanceRate = student?.attendance || 0;
  const certCount = Array.isArray(certificates) ? certificates.length : 0;
  const pendingCount = Array.isArray(assignments) ? assignments.filter(a => a.status !== 'submitted').length : 0;

  const deadlineItems = Array.isArray(assignments) && assignments.length > 0
    ? assignments.filter(a => a.dueDate).slice(0, 4)
    : [];

  const firstName = student?.name?.split(' ')[0] || user?.name?.split(' ')[0] || 'Student';

  if (loading) return <PageSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[var(--danger-subtle)] flex items-center justify-center border border-[var(--danger)]/10">
          <FiActivity className="text-[var(--danger)]" size={28} />
        </div>
        <p className="theme-text-muted text-body">Failed to load dashboard data</p>
        <p className="text-small theme-text-muted">{error}</p>
        <Button variant="secondary" onClick={refetch}>Try Again</Button>
      </div>
    );
  }

  return (
    <PageTransition className="space-y-8 pb-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-2xl"
      >
        <div className="gradient-hero p-6 lg:p-8 relative">
          <div className="orb orb-primary w-[500px] h-[500px] -top-40 -right-20" />
          <div className="orb orb-violet w-[400px] h-[400px] -bottom-40 -left-20" />
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 dark:bg-black/20 backdrop-blur-sm flex items-center justify-center border border-white/10">
                    <FiTrendingUp className="text-[var(--primary)]" size={18} />
                  </div>
                  <span className="text-micro theme-text-muted tracking-wider uppercase">Student Dashboard</span>
                </div>
                <h1 className="text-hero text-3xl lg:text-[40px] font-bold theme-text mb-2 tracking-tight">
                  {getGreeting()}, {firstName}
                </h1>
                <p className="text-body theme-text-secondary max-w-xl">
                  Welcome back to your learning journey.
                </p>
                <div className="flex flex-wrap gap-3 mt-5">
                  <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--card-bg)]/60 backdrop-blur-sm border border-[var(--border)] shadow-sm">
                    <FiBookOpen size={14} className="text-[var(--primary)]" />
                    <span className="text-caption font-medium theme-text">{enrolledCount} Active</span>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--card-bg)]/60 backdrop-blur-sm border border-[var(--border)] shadow-sm">
                    <FiAward size={14} className="text-[var(--success)]" />
                    <span className="text-caption font-medium theme-text">{certCount} Certificates</span>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--card-bg)]/60 backdrop-blur-sm border border-[var(--border)] shadow-sm">
                    <FiTarget size={14} className="text-[var(--warning)]" />
                    <span className="text-caption font-medium theme-text">{attendanceRate}% Attendance</span>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">
                <Link to="/courses">
                  <Button variant="primary" size="lg" icon={FiGrid} className="shadow-lg shadow-[var(--primary)]/20">
                    Browse Courses
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div variants={item}>
          <AnimatedKpi icon={FiCalendar} label="Attendance Rate" value={`${attendanceRate}%`} color="emerald" subtitle="Overall attendance" />
        </motion.div>
        <motion.div variants={item}>
          <AnimatedKpi icon={FiBookOpen} label="Enrolled Courses" value={String(enrolledCount)} color="indigo" subtitle="Active enrollments" />
        </motion.div>
        <motion.div variants={item}>
          <AnimatedKpi icon={FiClipboard} label="Pending Work" value={String(pendingCount)} color="amber" subtitle="Assignments to submit" />
        </motion.div>
        <motion.div variants={item}>
          <AnimatedKpi icon={FiAward} label="Certificates" value={String(certCount)} color="violet" subtitle="Earned credentials" />
        </motion.div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="p-5 lg:col-span-2">
          <SectionHeader
            title="Recent Activity"
            action={
              <Button variant="ghost" size="sm" icon={FiArrowRight} iconRight={FiArrowRight}>View All</Button>
            }
          />
          {false ? (
            <div className="space-y-0.5">
              {[].map((a, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-[var(--hover)] transition-colors group cursor-pointer"
                >
                  <div className="w-2 h-2 rounded-full bg-[var(--primary)] mt-1.5 shrink-0 group-hover:scale-125 transition-transform" />
                  <div className="flex-1 min-w-0">
                    <p className="text-body theme-text">{a.action}</p>
                    <p className="text-small theme-text-muted">{a.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-14">
              <div className="w-16 h-16 rounded-2xl bg-[var(--subtle)] flex items-center justify-center mb-4 border border-[var(--border)]">
                <FiActivity size={24} className="theme-text-muted" />
              </div>
              <p className="text-caption theme-text font-medium mb-1">No activity yet</p>
              <p className="text-small theme-text-muted">Start learning to see your activity here</p>
            </div>
          )}
        </Card>

        {/* Upcoming Deadlines */}
        <Card className="p-5">
          <SectionHeader
            title="Deadlines"
            action={
              <Button variant="ghost" size="sm" icon={FiArrowRight}>All</Button>
            }
          />
          {deadlineItems.length > 0 ? (
            <div className="space-y-2">
              {deadlineItems.map((d, i) => {
                const status = getDeadlineStatus(d.dueDate);
                const dotColor = status.color === 'text-rose' ? 'bg-[var(--danger)]' : status.color === 'text-amber' ? 'bg-[var(--warning)]' : 'bg-[var(--success)]';
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-[var(--subtle)] hover:bg-[var(--hover)] transition-colors group cursor-pointer"
                  >
                    <div className={`w-2 h-2 rounded-full ${dotColor} mt-1.5 shrink-0`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-caption theme-text font-medium truncate group-hover:text-[var(--primary)] transition-colors">{d.title}</p>
                      <p className="text-small theme-text-muted truncate">{d.course || d.courseName}</p>
                    </div>
                    <span className={`text-[11px] font-semibold px-2 py-1 rounded-lg whitespace-nowrap ${
                      status.color === 'text-rose' ? 'bg-[var(--danger-subtle)] text-[var(--danger)]' :
                      status.color === 'text-amber' ? 'bg-[var(--warning-subtle)] text-[var(--warning)]' :
                      'bg-[var(--success-subtle)] text-[var(--success)]'
                    }`}>
                      {status.label}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-14">
              <div className="w-16 h-16 rounded-2xl bg-[var(--subtle)] flex items-center justify-center mb-4 border border-[var(--border)]">
                <FiClock size={24} className="theme-text-muted" />
              </div>
              <p className="text-caption theme-text font-medium mb-1">All caught up</p>
              <p className="text-small theme-text-muted">No upcoming deadlines</p>
            </div>
          )}
        </Card>
      </div>

      {/* My Courses */}
      <div>
        <SectionHeader
          title="My Courses"
          description={enrolledCount > 0 ? `${enrolledCount} course${enrolledCount !== 1 ? 's' : ''} enrolled` : 'Enroll in courses to start learning'}
          action={
            <Link to="/courses">
              <Button variant="ghost" size="sm" icon={FiArrowRight} iconRight={FiArrowRight}>Browse All</Button>
            </Link>
          }
        />
        {enrolledCourses.length > 0 ? (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {enrolledCourses.map(c => {
              const course = typeof c === 'object' ? c : { _id: c, title: 'Course', progress: 0 };
              return (
                <motion.div key={course._id} variants={item}>
                  <Link to={`/learning/${course._id}`} className="block group">
                    <Card hover className="p-5 h-full">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary-muted)] to-[var(--primary-subtle)] flex items-center justify-center shrink-0">
                          <FiBookOpen className="text-[var(--primary)]" size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-caption theme-text font-semibold group-hover:text-[var(--primary)] transition-colors truncate">{course.title}</p>
                          {course.instructor && <p className="text-small theme-text-muted">{course.instructor}</p>}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-small">
                          <span className="theme-text-muted">Progress</span>
                          <span className="font-semibold theme-text">{course.progress || 0}%</span>
                        </div>
                        <ProgressBar value={course.progress || 0} size="sm" />
                      </div>
                      <div className="mt-4 flex items-center justify-end">
                        <span className="text-small text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1 font-medium translate-x-2 group-hover:translate-x-0">
                          Continue <FiChevronRight size={12} />
                        </span>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-16 text-center">
              <div className="w-20 h-20 rounded-2xl bg-[var(--subtle)] flex items-center justify-center mx-auto mb-5 border border-[var(--border)]">
                <FiBookOpen size={32} className="theme-text-muted" />
              </div>
              <h3 className="text-card-subtitle theme-text mb-2">No courses yet</h3>
              <p className="text-caption theme-text-muted mb-8 max-w-sm mx-auto">Start your learning journey by enrolling in a course that interests you.</p>
              <Link to="/courses">
                <Button variant="primary" size="lg" icon={FiBookOpen} className="shadow-lg shadow-[var(--primary)]/20">Browse Courses</Button>
              </Link>
            </Card>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
};

export default StudentDashboard;
