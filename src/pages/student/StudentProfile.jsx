import { motion } from 'framer-motion';
import { FiAward, FiBookOpen, FiCalendar, FiTrendingUp, FiMail } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { useStudentData } from '../../hooks/useStudentData';
import { getInitials, formatDate } from '../../utils/helpers';
import { Card, KpiCard } from '../../components/ui';
import { PageSkeleton } from '../../components/shared/LoadingSkeleton';

const StudentProfile = () => {
  const { user } = useAuth();
  const { student, trophies, certificates, loading, error } = useStudentData();

  if (loading) return <PageSkeleton />;

  if (error) return (
    <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-rose-400 text-sm">
      Failed to load data: {error}
    </div>
  );

  if (!student) return null;

  const stats = [
    { icon: FiBookOpen, label: 'Courses', value: student.enrolledCourses?.length || 0 },
    { icon: FiAward, label: 'Certificates', value: certificates?.length || 0 },
    { icon: FiCalendar, label: 'Attendance', value: student.attendance ? `${student.attendance}%` : 'N/A' },
    { icon: FiTrendingUp, label: 'GPA', value: student.gpa || '--' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">
      <Card className="p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="w-20 h-20 rounded-full bg-indigo-500/10 border theme-border flex items-center justify-center shrink-0">
            <span className="text-2xl text-indigo-400 font-bold">{getInitials(student.name)}</span>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold theme-text">{student.name}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-sm theme-text-muted">
              <span className="flex items-center gap-1.5"><FiMail size={12} /> {student.email}</span>
              <span>Class {student.class}</span>
              <span className="text-xs theme-subtle px-2 py-0.5 rounded-md">{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Student'}</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <KpiCard key={i} icon={s.icon} label={s.label} value={String(s.value)} color={['indigo', 'emerald', 'amber', 'purple'][i]} />
        ))}
      </div>

      {(student.subjects && student.subjects.length > 0) && (
        <Card className="p-5">
          <h2 className="text-sm font-semibold theme-text mb-4">Subjects</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {student.subjects.map((s, i) => (
              <div key={s.name || i}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm theme-text">{s.name}</span>
                  <span className="text-xs theme-text-muted">{s.score}%</span>
                </div>
                <div className="w-full theme-hover rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full bg-indigo-500 transition-all"
                    style={{ width: `${s.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h2 className="text-sm font-semibold theme-text mb-4 flex items-center gap-2">
            <FiAward className="text-indigo-400" size={14} /> Achievements
          </h2>
          <div className="flex flex-wrap gap-3">
            {(trophies || []).map(t => (
              <div key={t._id} className="flex items-center gap-2 theme-subtle rounded-xl px-3 py-2 theme-border">
                <span className="text-lg">{t.icon}</span>
                <div>
                  <p className="text-xs font-medium theme-text">{t.title}</p>
                  <p className="text-[10px] theme-text-muted">{formatDate(t.earnedAt)}</p>
                </div>
              </div>
            ))}
            {(!trophies || trophies.length === 0) && (
              <p className="text-xs theme-text-muted">No achievements yet</p>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-semibold theme-text mb-4 flex items-center gap-2">
            <FiBookOpen className="text-indigo-400" size={14} /> Certificates
          </h2>
          <div className="space-y-2">
            {(certificates || []).slice(0, 5).map(c => (
              <div key={c._id} className="flex items-center gap-3 theme-subtle rounded-xl p-3 theme-border">
                <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                  <FiAward className="text-indigo-400" size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium theme-text truncate">{c.courseName}</p>
                  <p className="text-xs theme-text-muted">Grade {c.grade} &middot; {formatDate(c.issuedAt)}</p>
                </div>
              </div>
            ))}
            {(!certificates || certificates.length === 0) && (
              <p className="text-xs theme-text-muted">No certificates yet</p>
            )}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="text-sm font-semibold theme-text mb-3">Profile Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-xs theme-text-muted mb-0.5">Email</p>
            <p className="theme-text">{student.email}</p>
          </div>
          <div>
            <p className="text-xs theme-text-muted mb-0.5">Parent Contact</p>
            <p className="theme-text">{student.parentContact || '—'}</p>
          </div>
          <div>
            <p className="text-xs theme-text-muted mb-0.5">Credits</p>
            <p className="theme-text">{student.credits || 0} / {student.graduationCredits || 0}</p>
          </div>
          <div>
            <p className="text-xs theme-text-muted mb-0.5">Roll Number</p>
            <p className="theme-text">{student.rollNumber || '—'}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default StudentProfile;
