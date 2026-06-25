import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiShield } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import {
  login as loginApi,
  googleLogin as googleLoginApi,
  getFirebaseErrorMessage,
} from '../../api/auth';
import { hasFirebaseConfig } from '../../config/firebase';
import toast from 'react-hot-toast';
import { Button, Input, Divider } from '../../components/ui';

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
  const [errors, setErrors] = useState({});
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleRole, setGoogleRole] = useState('student');
  const [adminAuthPassword, setAdminAuthPassword] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectAfter = (userData) => {
    const r = userData.role === 'admin' || userData.role === 'teacher' ? '/admin' : '/dashboard';
    navigate(r);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    if (!password.trim()) newErrors.password = 'Password is required';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const data = await loginApi({ email, password });
      login({ id: data.user._id, ...data.user }, data.token);
      toast.success(`Welcome back, ${data.user.name}!`);
      redirectAfter(data.user);
    } catch (err) {
      const code = err.code;
      const message = code
        ? getFirebaseErrorMessage(code)
        : err.response?.data?.error || 'Login failed. Check your credentials.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const openGoogleModal = async () => {
    setGoogleRole('student');
    setAdminAuthPassword('');
    setGoogleError('');
    setShowGoogleModal(true);
  };

  const handleGoogleConfirm = async () => {
    if (googleRole === 'admin' && !adminAuthPassword.trim()) {
      setGoogleError('Administrator authorization password is required.');
      return;
    }
    setGoogleLoading(true);
    setGoogleError('');
    try {
      const data = await googleLoginApi({
        role: googleRole,
        adminAuthorizationPassword: googleRole === 'admin' ? adminAuthPassword : undefined,
      });
      setShowGoogleModal(false);
      login({ id: data.user._id, ...data.user }, data.token);
      toast.success(`Welcome, ${data.user.name}!`);
      redirectAfter(data.user);
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Google sign-in failed.';
      setGoogleError(message);
      toast.error(message);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="relative z-10 w-full h-full flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[420px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative"
        >
          <div className="absolute -inset-1 bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent rounded-2xl blur-xl" />

          <div className="relative theme-card border theme-border rounded-2xl p-6 md:p-8 shadow-2xl shadow-black/10 backdrop-blur-xl bg-[var(--card-bg)]/90">
            <div className="flex flex-col items-center text-center mb-7">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20">
                <span className="text-white font-bold text-base">IS</span>
              </div>
              <h1 className="text-xl font-semibold theme-text font-heading">Welcome Back</h1>
              <p className="text-sm theme-text-muted mt-1">Sign in to your account to continue</p>
            </div>

            <div className="flex gap-2 mb-6">
              {roles.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    role === r.id
                      ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-sm'
                      : 'theme-text-muted hover:theme-text hover:bg-[var(--hover)] border border-transparent'
                  }`}
                >
                  <span className="text-base">{r.icon}</span>
                  <span className="hidden sm:inline">{r.label}</span>
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                icon={FiMail}
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.com"
                error={errors.email}
              />

              <div className="relative">
                <Input
                  icon={FiLock}
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  error={errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-[38px] -translate-y-1/2 theme-text-muted hover:theme-text transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-xs theme-text-muted hover:theme-text transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <Button type="submit" variant="primary" className="w-full" loading={loading}>
                Sign In
              </Button>
            </form>

            <div className="flex items-center gap-3 my-6">
              <Divider className="flex-1" />
              <span className="text-xs theme-text-muted uppercase tracking-wider">or</span>
              <Divider className="flex-1" />
            </div>

            <Button variant="secondary" className="w-full" onClick={openGoogleModal} disabled={loading}>
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </Button>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-xs theme-text-muted hover:theme-text transition-colors inline-flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showGoogleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm"
            onClick={() => !googleLoading && setShowGoogleModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm theme-card border theme-border rounded-2xl p-6 shadow-2xl shadow-black/20"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                  <FiUser className="text-white" size={18} />
                </div>
                <div>
                  <h3 className="text-base font-semibold theme-text">Continue as</h3>
                  <p className="text-xs theme-text-muted">Choose your account type</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => { setGoogleRole(r.id); setGoogleError(''); setAdminAuthPassword(''); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      googleRole === r.id
                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        : 'theme-text-muted hover:theme-text hover:bg-[var(--hover)] border border-transparent'
                    }`}
                  >
                    <span className="text-lg">{r.icon}</span>
                    <span>{r.label}</span>
                    {googleRole === r.id && (
                      <svg className="ml-auto w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>

              <AnimatePresence>
                {googleRole === 'admin' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 overflow-hidden"
                  >
                    <Input
                      icon={FiShield}
                      label="Administrator Authorization Password"
                      type="password"
                      value={adminAuthPassword}
                      onChange={(e) => { setAdminAuthPassword(e.target.value); setGoogleError(''); }}
                      placeholder="Enter admin authorization password"
                      error={googleRole === 'admin' && googleError ? '' : undefined}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {googleError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-xs mb-4"
                >
                  {googleError}
                </motion.p>
              )}

              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setShowGoogleModal(false)}
                  disabled={googleLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={handleGoogleConfirm}
                  loading={googleLoading}
                >
                  Continue
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;
