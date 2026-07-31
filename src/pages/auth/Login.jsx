import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import API from '../../api/client';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock, GraduationCap, Loader2 } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({ email: '', password: '', rememberMe: false });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', {
        email: form.email,
        password: form.password,
      });
      login(data.user, data.token);
      if (data.refreshToken) {
        localStorage.setItem('sidts_refresh_token', data.refreshToken);
      }
      toast.success(`Welcome back, ${data.user.name}!`);

      // Redirect based on role
      const routes = {
        student: '/dashboard',
        teacher: '/teacher/dashboard',
        parent: '/parent/dashboard',
        admin: '/admin/dashboard',
        recruiter: '/recruiter/dashboard',
      };
      navigate(routes[data.user.role] || '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-auto">
      <div className="theme-card rounded-2xl p-8 card-shadow-lg border-gradient">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl gradient-accent flex items-center justify-center mx-auto mb-4">
            <GraduationCap size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold theme-text">Welcome back</h1>
          <p className="text-sm theme-text-muted mt-1">Sign in to your SIDTS account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium theme-text mb-1.5 block">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 theme-text-muted" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl theme-input border theme-border theme-text placeholder-theme-muted focus:outline-none focus:border-indigo-500 transition-colors text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium theme-text mb-1.5 block">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 theme-text-muted" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Enter your password"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl theme-input border theme-border theme-text placeholder-theme-muted focus:outline-none focus:border-indigo-500 transition-colors text-sm"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 theme-text-muted hover:theme-text">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.rememberMe}
                onChange={(e) => setForm({ ...form, rememberMe: e.target.checked })}
                className="w-4 h-4 rounded border-theme-border text-indigo-500 focus:ring-indigo-500"
              />
              <span className="text-sm theme-text-muted">Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-sm text-indigo-500 hover:underline">Forgot password?</Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl gradient-accent text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm theme-text-muted mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-500 hover:underline font-medium">Create one</Link>
        </p>
      </div>
    </motion.div>
  );
}