import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiArrowLeft, FiCpu, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('email');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    toast.success('OTP sent to your email!');
    setStep('otp');
    setLoading(false);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    toast.success('Password reset successfully!');
    setStep('done');
    setLoading(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-xl bg-indigo-500 flex items-center justify-center mx-auto mb-4">
          <FiCpu className="text-white" size={32} />
        </div>
        <h1 className="text-2xl font-bold text-white font-heading">Reset Password</h1>
      </div>

      {step === 'email' && (
        <form onSubmit={handleSendOTP} className="space-y-4">
          <p className="text-sm text-slate-400 text-center">Enter your email to receive an OTP</p>
          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@school.com" className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-3 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500/50" />
          </div>
          <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="w-full py-2.5 rounded-lg bg-indigo-500 text-white font-medium text-sm disabled:opacity-50">
            {loading ? 'Sending...' : 'Send OTP'}
          </motion.button>
        </form>
      )}

      {step === 'otp' && (
        <form onSubmit={handleReset} className="space-y-4">
          <p className="text-sm text-slate-400 text-center">Enter the OTP sent to your email</p>
          <input value={otp} onChange={e => setOtp(e.target.value)} placeholder="Enter OTP" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm text-center tracking-widest focus:outline-none focus:border-indigo-500/50" />
          <input type="password" placeholder="New password" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500/50" />
          <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="w-full py-2.5 rounded-lg bg-indigo-500 text-white font-medium text-sm disabled:opacity-50">
            {loading ? 'Resetting...' : 'Reset Password'}
          </motion.button>
        </form>
      )}

      {step === 'done' && (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
            <FiCheck className="text-emerald-400" size={32} />
          </div>
          <p className="text-white font-medium">Password reset successful!</p>
          <Link to="/login" className="inline-block py-2.5 px-6 rounded-lg bg-indigo-500 text-white text-sm font-medium">Back to Login</Link>
        </div>
      )}

      <p className="text-center text-xs text-slate-500 mt-6">
        <Link to="/login" className="flex items-center justify-center gap-1 text-indigo-400 hover:text-indigo-300">
          <FiArrowLeft size={14} /> Back to Login
        </Link>
      </p>
    </motion.div>
  );
};

export default ForgotPassword;
