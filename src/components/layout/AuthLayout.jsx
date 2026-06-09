import { Outlet, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';

const AuthLayout = () => {
  const { isAuthenticated, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  if (isAuthenticated) {
    const redirect = user?.role === 'admin' ? '/admin' : user?.role === 'teacher' ? '/admin' : '/dashboard';
    return <Navigate to={redirect} replace />;
  }

  return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-[#0B1120] to-purple-900/20" />
      <div className="absolute top-20 left-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-2.5 rounded-xl bg-white/[0.06] text-slate-400 hover:text-white transition-all z-10"
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-500/25">
            <span className="text-white font-bold text-xl">IS</span>
          </div>
          <h1 className="text-2xl font-bold text-white font-heading">ISDS</h1>
          <p className="text-slate-400 text-sm mt-1">Intelligent Student Development System</p>
        </div>

        <div className="bg-[#0F172A]/80 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 shadow-2xl">
          <Outlet />
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          Powered by ISDS Learning Platform v2.0
        </p>
      </motion.div>
    </div>
  );
};

export default AuthLayout;
