import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { login as loginApi } from '../../api/auth';
import toast from 'react-hot-toast';

const roles = [
  { id: 'student', label: 'Student', icon: '🎓' },
  { id: 'teacher', label: 'Teacher', icon: '👨‍🏫' },
  { id: 'admin', label: 'Admin', icon: '⚙️' },
];

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const Login = () => {
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await loginApi({ email, password });
      login({ id: data.user._id, ...data.user }, data.token);
      toast.success(`Welcome back, ${data.user.name}!`);
      const redirect = data.user.role === 'admin' ? '/admin' : data.user.role === 'teacher' ? '/admin' : '/dashboard';
      navigate(redirect);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed. Try demo accounts: arjun@school.com / password123');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex min-h-screen bg-[#0B1120]">
      {/* LEFT: Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0B1120] items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 border border-white/[0.03] rounded-full" />
          <div className="absolute top-1/3 left-1/3 w-96 h-96 border border-white/[0.02] rounded-full" />
          <div className="absolute top-1/2 right-1/4 w-48 h-48 border border-white/[0.03] rounded-full" />
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-12"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/20 mb-8">
            <span className="text-white font-bold text-xl">IS</span>
          </div>
          <h2 className="text-2xl font-semibold text-white font-heading mb-3">ISDS Platform</h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
            Intelligent Student Development System — track courses, attendance, assignments, and growth in one place.
          </p>

          <div className="mt-12 space-y-4 text-left max-w-xs mx-auto">
            {[
              { label: 'Learning Analytics', desc: 'Track progress across all courses' },
              { label: 'Attendance Tracking', desc: 'Monitor daily attendance patterns' },
              { label: 'Skill Development', desc: 'Build and measure competencies' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.15 }}
                className="flex items-start gap-3"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 flex-shrink-0" />
                <div>
                  <p className="text-white text-sm font-medium">{item.label}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* RIGHT: Login panel */}
      <div className="flex-1 lg:w-1/2 min-h-screen flex flex-col bg-[#0B1120]">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 lg:px-10 lg:py-6">
          <div className="flex items-center gap-3 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">IS</span>
            </div>
            <span className="text-white text-sm font-semibold">ISDS</span>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <span className="text-slate-400 text-xs hidden sm:block">New to ISDS?</span>
            <Link
              to="/register"
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium flex items-center gap-1"
            >
              Create Account <FiArrowRight size={12} />
            </Link>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center px-6 pb-16 lg:pb-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full max-w-[460px]"
          >
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-white font-heading">Sign in</h1>
              <p className="text-slate-400 text-sm mt-1.5">Enter your credentials to access your account</p>
            </div>

            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="space-y-5"
            >
              {/* Role selection */}
              <motion.div variants={fadeUp} className="flex gap-2">
                {roles.map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      role === r.id
                        ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/25'
                        : 'bg-white/[0.04] text-slate-400 border border-transparent hover:bg-white/[0.06]'
                    }`}
                  >
                    <span className="mr-1">{r.icon}</span> {r.label}
                  </button>
                ))}
              </motion.div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <motion.div variants={fadeUp}>
                  <label className="block text-sm text-slate-400 mb-1.5">Email</label>
                  <div className="relative">
                    <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@school.com"
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-10 pr-3.5 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                    />
                  </div>
                </motion.div>

                <motion.div variants={fadeUp}>
                  <label className="block text-sm text-slate-400 mb-1.5">Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-10 pr-10 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                </motion.div>

                <motion.div variants={fadeUp} className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={e => setRemember(e.target.checked)}
                      className="w-4 h-4 rounded border-white/[0.08] bg-white/[0.04] text-indigo-500 focus:ring-indigo-500/50 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="text-xs text-slate-400">Remember me</span>
                  </label>
                  <Link to="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                    Forgot password?
                  </Link>
                </motion.div>

                <motion.div variants={fadeUp}>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-indigo-500 text-white font-medium text-sm hover:bg-indigo-400 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Signing in...' : 'Sign in'}
                  </motion.button>
                </motion.div>
              </form>

              <motion.div variants={fadeUp}>
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-white/[0.06]" />
                  <span className="text-xs text-slate-500">or</span>
                  <div className="flex-1 h-px bg-white/[0.06]" />
                </div>

                <button
                  type="button"
                  className="w-full py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-300 text-sm font-medium hover:bg-white/[0.06] transition-all flex items-center justify-center gap-2.5"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
