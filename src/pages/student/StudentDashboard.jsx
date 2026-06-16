import { getHours } from 'date-fns';
import { motion } from 'framer-motion';
import { FiCalendar, FiBookOpen, FiClipboard, FiAward, FiActivity, FiClock, FiChevronRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { Card, KpiCard, Button } from '../../components/ui';
import { PageSkeleton } from '../../components/shared/LoadingSkeleton';
import { useStudentData } from '../../hooks/useStudentData';
import { useAuth } from '../../hooks/useAuth';
import { getDeadlineStatus } from '../../utils/helpers';

const getGreeting = () => {
  const hour = getHours(new Date());
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const deadlineColorMap = {
  'text-rose': 'text-rose-400',
  'text-amber': 'text-amber-400',
  'text-emerald': 'text-emerald-400',
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

  const recentActivity = student?.recentActivity || [];

  if (loading) return <PageSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center">
          <FiActivity className="text-rose-400" size={28} />
        </div>
        <p className="theme-text-muted text-sm">Failed to load dashboard data</p>
        <p className="theme-text-muted text-xs">{error}</p>
        <Button variant="secondary" onClick={refetch}>Try Again</Button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6 pb-8">
      <div>
        <h1 className="text-lg font-semibold theme-text">Dashboard</h1>
        <p className="text-sm theme-text-muted">{getGreeting()}, {student?.name?.split(' ')[0] || user?.name?.split(' ')[0] || 'Student'}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={FiCalendar} label="Attendance" value={`${attendanceRate}%`} color="emerald" />
        <KpiCard icon={FiBookOpen} label="Enrolled Courses" value={String(enrolledCount)} color="indigo" />
        <KpiCard icon={FiClipboard} label="Pending Assignments" value={String(pendingCount)} color="amber" />
        <KpiCard icon={FiAward} label="Certificates" value={String(certCount)} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-sm font-semibold theme-text mb-4 flex items-center gap-2">
            <FiActivity className="text-indigo-400" size={16} /> Recent Activity
          </h2>
          <div className="space-y-0.5 max-h-80 overflow-y-auto">
            {recentActivity.length > 0 ? recentActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg hover:theme-subtle transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm theme-text">{a.action}</p>
                  <p className="text-xs theme-text-muted">{a.time}</p>
                </div>
              </div>
            )) : (
              <p className="text-sm theme-text-muted text-center py-8">No recent activity.</p>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold theme-text flex items-center gap-2">
              <FiClock className="text-indigo-400" size={16} /> Upcoming
            </h2>
            <Link to="/assignments" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">View All</Link>
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {deadlineItems.length > 0 ? deadlineItems.map((d, i) => {
              const status = getDeadlineStatus(d.dueDate);
              return (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg theme-subtle">
                  <div>
                    <p className="text-sm theme-text">{d.title}</p>
                    <p className="text-xs theme-text-muted">{d.course || d.courseName}</p>
                  </div>
                  <span className={`text-xs font-medium ${deadlineColorMap[status.color] || 'theme-text-muted'}`}>{status.label}</span>
                </div>
              );
            }) : (
              <p className="text-sm theme-text-muted text-center py-8">No upcoming deadlines.</p>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold theme-text">My Courses</h2>
          <Link to="/courses" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">View All</Link>
        </div>
        {enrolledCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrolledCourses.map(c => {
              const course = typeof c === 'object' ? c : { _id: c, title: 'Course', progress: 0 };
              return (
                <Link key={course._id} to={`/learning/${course._id}`}>
                  <Card hover className="p-4 group cursor-pointer">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                        <FiBookOpen className="text-indigo-400" size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm theme-text group-hover:text-indigo-300 transition-colors truncate">{course.title}</p>
                        <p className="text-xs theme-text-muted">{course.instructor || ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="theme-text-muted">{course.progress || 0}%</span>
                      <span className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">Continue <FiChevronRight size={12} /></span>
                    </div>
                    <div className="mt-2 w-full h-1 theme-hover rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-400 rounded-full transition-all" style={{ width: `${course.progress || 0}%` }} />
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-sm theme-text-muted text-center py-12">
            <FiBookOpen className="mx-auto mb-2 theme-text-muted" size={24} />
            <p>No courses enrolled yet.</p>
            <Link to="/courses" className="text-indigo-400 hover:text-indigo-300 transition-colors">Browse Courses</Link>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default StudentDashboard;
