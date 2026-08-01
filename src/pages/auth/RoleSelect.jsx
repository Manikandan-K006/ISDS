import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, BookOpen, Shield, Briefcase, Users, LogIn } from 'lucide-react';
import API from '../../api/client';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const ROLES = [
  { key: 'student', label: 'Student', description: 'Dashboard, courses, quizzes, projects, career center', icon: GraduationCap, accent: 'from-indigo-500 to-indigo-600', shadow: 'shadow-indigo-500/20', demo: 'arjun@school.com' },
  { key: 'teacher', label: 'Teacher', description: 'Courses, assignments, quizzes, gradebook, attendance', icon: BookOpen, accent: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-500/20', demo: 'verma@school.com' },
  { key: 'admin', label: 'Admin', description: 'Users, jobs, certificates, departments, analytics', icon: Shield, accent: 'from-purple-500 to-purple-600', shadow: 'shadow-purple-500/20', demo: 'admin@school.com' },
];

const EXTRA_ROLES = [
  { key: 'recruiter', label: 'Recruiter', icon: Briefcase, demo: 'recruiter@school.com' },
  { key: 'parent', label: 'Parent', icon: Users, demo: 'parent-arjun@school.com' },
];

const ROLE_ROUTES = {
  student: '/dashboard',
  teacher: '/teacher/dashboard',
  admin: '/admin/dashboard',
  recruiter: '/recruiter/dashboard',
  parent: '/parent/dashboard',
};

const DEMO_PASSWORD = 'password123';

export default function RoleSelect() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [loading, setLoading] = useState(null);

  const signInAs = async (role) => {
    setLoading(role.key);
    try {
      const { data } = await API.post('/auth/login', {
        email: role.demo,
        password: DEMO_PASSWORD,
      });
      login(data.user, data.token);
      if (data.refreshToken) {
        localStorage.setItem('sidts_refresh_token', data.refreshToken);
      }
      toast.success(`Signed in as ${role.label}`);
      navigate(ROLE_ROUTES[data.user.role] || '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Sign in failed');
      setLoading(null);
    }
  };

  return (
    <motion.div className="relative z-10 w-full h-full flex items-center justify-center px-4 py-8" variants={containerVariants} initial="hidden" animate="visible">
      <div className="w-full max-w-[900px]">
        <motion.div className="text-center mb-10" variants={cardVariants}>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-500/25">
            <span className="text-white font-bold text-xl">IS</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold theme-text font-heading">ISDS</h1>
          <p className="theme-text-muted text-sm md:text-base mt-2 max-w-md mx-auto">
            Intelligent Student Development System
          </p>
          <p className="text-xs theme-text-muted mt-3 inline-flex items-center gap-1.5">
            <LogIn size={13} /> Demo mode — pick a role to sign in instantly
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-[720px] mx-auto">
          {ROLES.map((role, i) => (
            <motion.button
              key={role.key}
              variants={cardVariants}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => signInAs(role)}
              disabled={loading !== null}
              className="group relative overflow-hidden rounded-2xl p-6 text-left cursor-pointer
                bg-[var(--card-bg)] border border-[var(--border)] hover:border-[var(--border-light)]
                shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-black/10
                transition-all duration-300 disabled:opacity-60 disabled:cursor-wait"
            >
              <span className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[var(--hover)] text-theme-text-muted text-xs font-semibold flex items-center justify-center">{i + 1}</span>
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${role.accent} flex items-center justify-center mb-4 shadow-lg ${role.shadow}`}>
                <role.icon className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-lg font-semibold theme-text mb-1">{role.label}</h2>
              <p className="text-xs theme-text-muted leading-relaxed">{role.description}</p>
              <p className="text-xs text-indigo-500 mt-3 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                {loading === role.key ? 'Signing in...' : 'Click to enter →'}
              </p>
            </motion.button>
          ))}
        </div>

        <motion.div variants={cardVariants} className="flex items-center justify-center gap-3 mt-8 flex-wrap">
          <span className="text-xs theme-text-muted">Other demo accounts:</span>
          {EXTRA_ROLES.map((role) => (
            <button
              key={role.key}
              onClick={() => signInAs(role)}
              disabled={loading !== null}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs theme-text-muted hover:theme-text border border-[var(--border)] hover:border-[var(--border-light)] transition-colors disabled:opacity-60"
            >
              <role.icon size={14} /> {role.label}
            </button>
          ))}
        </motion.div>

        <motion.p variants={cardVariants} className="text-center text-xs theme-text-muted mt-8">
          Powered by ISDS Learning Platform v2.0
        </motion.p>
      </div>
    </motion.div>
  );
}
