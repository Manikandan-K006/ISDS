import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiCheck } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { login as loginApi } from '../../api/auth';
import toast from 'react-hot-toast';

const roles = [
  { id: 'student', label: 'Student', icon: '🎓' },
  { id: 'teacher', label: 'Teacher', icon: '👨‍🏫' },
  { id: 'admin', label: 'Admin', icon: '⚙️' },
];

const features = [
  'Learning Analytics',
  'AI-Powered Recommendations',
  'Attendance Tracking',
  'Skill Development',
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
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
    <div className="fixed inset-0 flex min-h-screen overflow-hidden bg-[#0B1120]">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex lg:w-[60%] relative bg-gradient-to-br from-[#0B1120] via-[#0F172A] to-[#1E293B] overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-20 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 left-1/4 w-[30rem] h-[30rem] bg-indigo-600/10 rounded-full blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative z-10 flex flex-col justify-between p-12 w-full"
        >
          {/* Logo */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/25">
            <span className="text-white font-bold text-lg">IS</span>
          </div>

          {/* Center content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-lg mx-auto"
          >
            <motion.h1 variants={itemVariants} className="text-4xl lg:text-5xl font-bold text-white font-heading leading-tight">
              Intelligent Student Development System
            </motion.h1>
            <motion.p variants={itemVariants} className="text-lg text-slate-400 mt-4 font-light tracking-wide">
              Learn. Track. Grow. Achieve.
            </motion.p>
            <motion.div variants={itemVariants} className="w-16 h-0.5 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full mt-6 mb-8" />
            <motion.div variants={itemVariants} className="space-y-4">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                    <FiCheck className="text-indigo-400" size={14} />
                  </div>
                  <span className="text-slate-300 text-sm">{f}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="flex gap-8 justify-center border-t border-white/[0.06] pt-6"
          >
            {[
              { value: '500+', label: 'Students' },
              { value: '50+', label: 'Courses' },
              { value: '1000+', label: 'Certificates' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-white font-bold text-lg">{s.value}</p>
                <p className="text-slate-500 text-xs">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 lg:w-[40%] min-h-screen flex items-center justify-center p-4 bg-[#0B1120] relative overflow-y-auto">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/10 via-transparent to-purple-900/10 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative w-full max-w-md"
        >
          {/* Glass card */}
          <div className="bg-[#0F172A]/80 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-8 shadow-2xl">
            {/* Mobile logo */}
            <div className="lg:hidden flex flex-col items-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/25 mb-3">
                <span className="text-white font-bold text-xl">IS</span>
              </div>
              <h2 className="text-xl font-semibold text-white font-heading">ISDS</h2>
              <p className="text-slate-500 text-xs mt-1">Intelligent Student Development System</p>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white font-heading">Welcome Back</h2>
              <p className="text-slate-400 text-sm mt-1">Sign in to continue your learning journey</p>
            </div>

            {/* Role selection */}
            <div className="flex gap-2 mb-6">
              {roles.map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    role === r.id
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-sm shadow-indigo-500/10'
                      : 'bg-white/[0.04] text-slate-400 border border-white/[0.06] hover:bg-white/[0.06]'
                  }`}
                >
                  <span className="mr-1">{r.icon}</span> {r.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Email</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@school.com"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-10 pr-3 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
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
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-medium text-sm hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </motion.button>
            </form>

            <div className="mt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-xs text-slate-500">or continue with</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>

              <button
                type="button"
                className="w-full py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-medium hover:bg-white/[0.06] transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </button>
            </div>

            <p className="text-center text-xs text-slate-500 mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
                Create Account
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
