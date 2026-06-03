import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiCpu } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
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
    await new Promise(r => setTimeout(r, 1000));
    const mockUser = {
      _id: '1', name: role === 'student' ? email.split('@')[0] : role === 'teacher' ? email.split('@')[0] : 'Admin',
      email: email || `${role}@school.com`, role, class: role === 'student' ? '10A' : undefined,
      profilePhoto: '',
    };
    login(mockUser, 'mock-jwt-token');
    toast.success(`Welcome back, ${mockUser.name}!`);
    const redirect = role === 'admin' ? '/admin' : role === 'teacher' ? '/admin' : '/dashboard';
    navigate(redirect);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl gradient-accent flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/25">
          <FiCpu className="text-white" size={32} />
        </div>
        <h1 className="text-2xl font-bold text-white font-heading">Welcome to ISDS</h1>
        <p className="text-slate-400 text-sm mt-1">Sign in to your account</p>
      </div>

      <div className="flex gap-2 mb-6">
        {roles.map(r => (
          <button
            key={r.id}
            onClick={() => setRole(r.id)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              role === r.id
                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
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
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-3 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
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
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-10 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </div>
        </div>
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300">Forgot password?</Link>
        </div>
        <motion.button
          whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
          className="w-full py-2.5 rounded-lg gradient-accent text-white font-medium text-sm hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </motion.button>
      </form>

      <p className="text-center text-xs text-slate-500 mt-6">
        Don't have an account? <Link to="/register" className="text-indigo-400 hover:text-indigo-300">Contact Admin</Link>
      </p>
    </motion.div>
  );
};

export default Login;
