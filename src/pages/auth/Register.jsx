import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiCpu } from 'react-icons/fi';
import { register as registerApi } from '../../api/auth';
import toast from 'react-hot-toast';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', class: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerApi(form);
      toast.success('Account created successfully! You can now login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl gradient-accent flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/25">
          <FiCpu className="text-white" size={32} />
        </div>
        <h1 className="text-2xl font-bold text-white font-heading">Create Account</h1>
        <p className="text-slate-400 text-sm mt-1">Admin creates student/teacher accounts</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Full Name</label>
          <div className="relative">
            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Full name" className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-3 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500/50" />
          </div>
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Email</label>
          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="email@school.com" className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-3 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500/50" />
          </div>
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Password</label>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Create a password" className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-3 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500/50" />
          </div>
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Role</label>
          <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500/50">
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        </div>
        {form.role === 'student' && (
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Class</label>
            <select value={form.class} onChange={e => setForm({...form, class: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500/50">
              {['9A','9B','10A','10B','11A','11B','12A','12B'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}
        <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="w-full py-2.5 rounded-lg gradient-accent text-white font-medium text-sm hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50">
          {loading ? 'Creating...' : 'Create Account'}
        </motion.button>
      </form>
      <p className="text-center text-xs text-slate-500 mt-6">
        <Link to="/login" className="text-indigo-400 hover:text-indigo-300">Back to Login</Link>
      </p>
    </motion.div>
  );
};

export default Register;
