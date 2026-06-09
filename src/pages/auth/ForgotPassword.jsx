import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiArrowLeft, FiCheck } from 'react-icons/fi';
import { forgotPassword } from '../../api/auth';
import toast from 'react-hot-toast';
import { Input, Button } from '../../components/ui';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError('Email is required'); return; }
    setError('');
    setLoading(true);
    try {
      await forgotPassword({ email });
      toast.success('Password reset email sent! Check your inbox.');
      setSent(true);
    } catch (err) {
      const msg = err.code
        ? { 'auth/user-not-found': 'No account found with this email.' }[err.code] || err.message
        : 'Failed to send reset email. Try again.';
      console.error('Forgot password error:', { code: err.code, message: err.message });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center mx-auto mb-4">
          <FiMail className="text-white" size={20} />
        </div>
        <h1 className="text-xl font-semibold text-white">Reset Password</h1>
        <p className="text-sm text-slate-400 mt-1">
          {sent ? 'Check your email for the reset link' : 'Enter your email to receive a reset link'}
        </p>
      </div>

      {!sent ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            icon={FiMail}
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@school.com"
            error={error}
          />
          <Button type="submit" variant="primary" className="w-full" loading={loading}>
            Send reset link
          </Button>
        </form>
      ) : (
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
            <FiCheck className="text-emerald-400" size={24} />
          </div>
          <p className="text-sm text-slate-400">A password reset link has been sent to <span className="text-white font-medium">{email}</span></p>
          <button onClick={() => setSent(false)} className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
            Send to a different email
          </button>
        </div>
      )}

      <p className="text-center text-xs text-slate-500 mt-6">
        <Link to="/login" className="flex items-center justify-center gap-1 text-slate-400 hover:text-white transition-colors">
          <FiArrowLeft size={14} /> Back to Login
        </Link>
      </p>
    </motion.div>
  );
};

export default ForgotPassword;
