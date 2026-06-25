import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiShield, FiBook, FiHash, FiBriefcase } from 'react-icons/fi';
import { register as registerApi, getFirebaseErrorMessage } from '../../api/auth';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { Button, Input } from '../../components/ui';

const roles = [
  { id: 'student', label: 'Student', icon: '🎓', color: 'from-indigo-500 to-indigo-600' },
  { id: 'teacher', label: 'Teacher', icon: '👨‍🏫', color: 'from-emerald-500 to-emerald-600' },
  { id: 'admin', label: 'Admin', icon: '⚙️', color: 'from-purple-500 to-purple-600' },
];

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    class: '',
    rollNumber: '',
    department: '',
    subject: '',
    employeeId: '',
    adminAuthorizationPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email format';
    if (!form.password.trim()) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (!form.confirmPassword.trim()) e.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (form.role === 'student') {
      if (!form.class.trim()) e.class = 'Class is required';
      if (!form.rollNumber.trim()) e.rollNumber = 'Roll number is required';
    }
    if (form.role === 'teacher') {
      if (!form.department.trim()) e.department = 'Department is required';
      if (!form.subject.trim()) e.subject = 'Subject is required';
      if (!form.employeeId.trim()) e.employeeId = 'Employee ID is required';
    }
    if (form.role === 'admin') {
      if (!form.adminAuthorizationPassword.trim()) e.adminAuthorizationPassword = 'Administrator authorization password is required.';
    }
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        class: form.role === 'student' ? form.class : undefined,
        rollNumber: form.role === 'student' ? form.rollNumber : undefined,
        department: form.role === 'teacher' ? form.department : undefined,
        subject: form.role === 'teacher' ? form.subject : undefined,
        employeeId: form.role === 'teacher' ? form.employeeId : undefined,
        adminAuthorizationPassword: form.role === 'admin' ? form.adminAuthorizationPassword : undefined,
      };
      const data = await registerApi(payload);
      login({ id: data.user._id, ...data.user }, data.token);
      toast.success(`Welcome, ${data.user.name}!`);
      const redirect = data.user.role === 'admin' || data.user.role === 'teacher' ? '/admin' : '/dashboard';
      navigate(redirect);
    } catch (err) {
      const code = err.code;
      const message = code
        ? getFirebaseErrorMessage(code)
        : err.response?.data?.error || 'Registration failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 w-full h-full flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[460px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative"
        >
          <div className="absolute -inset-1 bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent rounded-2xl blur-xl" />

          <div className="relative theme-card border theme-border rounded-2xl p-6 md:p-8 shadow-2xl shadow-black/10 backdrop-blur-xl bg-[var(--card-bg)]/90 max-h-[calc(100vh-100px)] overflow-y-auto scrollbar-thin">
            <div className="flex flex-col items-center text-center mb-7">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20">
                <span className="text-white font-bold text-base">IS</span>
              </div>
              <h1 className="text-xl font-semibold theme-text font-heading">Create your Account</h1>
              <p className="text-sm theme-text-muted mt-1">Choose your role and fill in the details</p>
            </div>

            <div className="flex gap-2 mb-6">
              {roles.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, role: r.id }))}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    form.role === r.id
                      ? `bg-gradient-to-br ${r.color} text-white shadow-lg shadow-${r.id === 'student' ? 'indigo' : r.id === 'teacher' ? 'emerald' : 'purple'}-500/20`
                      : 'theme-text-muted hover:theme-text hover:bg-[var(--hover)] border border-[var(--border)]'
                  }`}
                >
                  <span className="text-base">{r.icon}</span>
                  <span className="hidden sm:inline">{r.label}</span>
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                icon={FiUser}
                label="Full Name"
                type="text"
                value={form.name}
                onChange={handleChange('name')}
                placeholder="Your full name"
                error={errors.name}
              />

              <Input
                icon={FiMail}
                label="Email"
                type="email"
                value={form.email}
                onChange={handleChange('email')}
                placeholder="you@school.com"
                error={errors.email}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  icon={FiLock}
                  label="Password"
                  type="password"
                  value={form.password}
                  onChange={handleChange('password')}
                  placeholder="Min 6 characters"
                  error={errors.password}
                />
                <Input
                  icon={FiLock}
                  label="Confirm Password"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange('confirmPassword')}
                  placeholder="Re-enter password"
                  error={errors.confirmPassword}
                />
              </div>

              <AnimatePresence mode="wait">
                {form.role === 'student' && (
                  <motion.div
                    key="student"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  >
                    <Input
                      icon={FiBook}
                      label="Department / Class"
                      type="text"
                      value={form.class}
                      onChange={handleChange('class')}
                      placeholder="e.g. 10A"
                      error={errors.class}
                    />
                    <Input
                      icon={FiHash}
                      label="Roll Number"
                      type="text"
                      value={form.rollNumber}
                      onChange={handleChange('rollNumber')}
                      placeholder="e.g. 1012"
                      error={errors.rollNumber}
                    />
                  </motion.div>
                )}

                {form.role === 'teacher' && (
                  <motion.div
                    key="teacher"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        icon={FiBriefcase}
                        label="Department"
                        type="text"
                        value={form.department}
                        onChange={handleChange('department')}
                        placeholder="e.g. Mathematics"
                        error={errors.department}
                      />
                      <Input
                        icon={FiBook}
                        label="Subject"
                        type="text"
                        value={form.subject}
                        onChange={handleChange('subject')}
                        placeholder="e.g. Algebra"
                        error={errors.subject}
                      />
                    </div>
                    <Input
                      icon={FiHash}
                      label="Employee ID"
                      type="text"
                      value={form.employeeId}
                      onChange={handleChange('employeeId')}
                      placeholder="e.g. EMP001"
                      error={errors.employeeId}
                    />
                  </motion.div>
                )}

                {form.role === 'admin' && (
                  <motion.div
                    key="admin"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Input
                      icon={FiShield}
                      label="Administrator Authorization Password"
                      type="password"
                      value={form.adminAuthorizationPassword}
                      onChange={handleChange('adminAuthorizationPassword')}
                      placeholder="Enter admin authorization password"
                      error={errors.adminAuthorizationPassword}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <Button type="submit" variant="primary" className="w-full" loading={loading}>
                Create Account
              </Button>
            </form>

            <p className="text-center text-xs theme-text-muted mt-6">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="theme-text hover:text-indigo-400 transition-colors font-medium"
              >
                Sign In
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
