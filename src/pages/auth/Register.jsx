import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock } from 'react-icons/fi';
import { register as registerApi, getFirebaseErrorMessage } from '../../api/auth';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { Button, Input } from '../../components/ui';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', class: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    if (!form.password.trim()) newErrors.password = 'Password is required';
    if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const data = await registerApi(form);
      login({ id: data.user._id, ...data.user }, data.token);
      toast.success(`Welcome, ${data.user.name}!`);
      const redirect = data.user.role === 'admin' ? '/admin' : data.user.role === 'teacher' ? '/admin' : '/dashboard';
      navigate(redirect);
    } catch (err) {
      const firebaseCode = err.code;
      const message = firebaseCode
        ? getFirebaseErrorMessage(firebaseCode)
        : err.response?.data?.error || 'Registration failed';
      console.error('Register error:', { code: err.code, message: err.message, response: err.response?.data });
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen theme-bg flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-[420px]"
      >
        <div className="theme-card border theme-border rounded-2xl p-8">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center mb-5">
              <span className="theme-text font-bold text-sm">IS</span>
            </div>
            <h1 className="text-xl font-semibold theme-text">Create account</h1>
            <p className="text-sm theme-text-muted mt-1">Sign up for a new account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              icon={FiUser}
              label="Full Name"
              type="text"
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              placeholder="Your full name"
              error={errors.name}
            />
            <Input
              icon={FiMail}
              label="Email"
              type="email"
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
              placeholder="you@school.com"
              error={errors.email}
            />
            <Input
              icon={FiLock}
              label="Password"
              type="password"
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              placeholder="At least 6 characters"
              error={errors.password}
            />

            <div>
              <label className="block text-sm theme-text-muted mb-1.5">Role</label>
              <select
                value={form.role}
                onChange={e => setForm({...form, role: e.target.value})}
                className="w-full theme-subtle border border-white/[0.08] rounded-xl px-3 py-2.5 theme-text text-sm focus:outline-none focus:theme-border-light transition-colors"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>

            {form.role === 'student' && (
              <div>
                <label className="block text-sm theme-text-muted mb-1.5">Class</label>
                <select
                  value={form.class}
                  onChange={e => setForm({...form, class: e.target.value})}
                  className="w-full theme-subtle border border-white/[0.08] rounded-xl px-3 py-2.5 theme-text text-sm focus:outline-none focus:theme-border-light transition-colors"
                >
                  <option value="">Select class</option>
                  {['9A','9B','10A','10B','11A','11B','12A','12B'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}

            <Button type="submit" variant="primary" className="w-full" loading={loading}>
              Create account
            </Button>
          </form>

          <p className="text-center text-xs theme-text-muted mt-6">
            Already have an account?{' '}
            <Link to="/login" className="theme-text hover:text-indigo-400 transition-colors font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
