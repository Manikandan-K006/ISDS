import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { login as loginApi } from '../../api/auth';
import toast from 'react-hot-toast';

const roles = [
  { id: 'student', label: 'Student', icon: '🎓' },
  { id: 'teacher', label: 'Teacher', icon: '👨‍🏫' },
  { id: 'admin', label: 'Admin', icon: '⚙️' },
];

const Login = () => {
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="w-full">
      <h2 className="text-xl font-semibold text-white font-heading mb-6">Sign In</h2>

      <div className="flex gap-2 mb-6">
        {roles.map(r => (
          <button
            key={r.id}
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
              type="email" value={email} onChange={e => setEmail(e.target.value)}
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
              type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-10 pr-10 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </div>
        </div>
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Forgot password?</Link>
        </div>
        <motion.button
          whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-medium text-sm hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </motion.button>
      </form>

      <div className="mt-6 pt-6 border-t border-white/[0.06]">
        <p className="text-center text-xs text-slate-500 mb-3">Don't have an account?</p>
        <Link to="/register">
          <motion.button
            whileTap={{ scale: 0.98 }}
            className="w-full py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white font-medium text-sm hover:bg-white/[0.06] transition-all"
          >
            Create Account
          </motion.button>
        </Link>
      </div>
    </div>
  );
};

export default Login;
