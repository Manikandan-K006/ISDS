import { Outlet, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';

const AuthLayout = () => {
  const { isAuthenticated, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  if (isAuthenticated) {
    const redirect = user?.role === 'admin' || user?.role === 'teacher' ? '/admin' : '/dashboard';
    return <Navigate to={redirect} replace />;
  }

  return (
    <div className="h-screen w-screen theme-bg flex items-center justify-center relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-[-15%] left-[-10%] w-[600px] h-[600px] bg-[var(--primary)]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-500/3 rounded-full blur-[100px]" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(var(--text) 1px, transparent 1px), linear-gradient(90deg, var(--text) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
        }}
      />

      <div className="absolute top-6 right-6 flex items-center gap-3 z-10">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          className="p-2.5 rounded-xl hover:bg-[var(--hover)] theme-text-muted hover:theme-text transition-all"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
        </motion.button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md px-4"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="w-14 h-14 rounded-2xl bg-[var(--primary)] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[var(--primary)]/20"
          >
            <span className="text-white font-bold text-lg">IS</span>
          </motion.div>
          <h1 className="text-page-title theme-text mb-1">ISDS</h1>
          <p className="text-caption theme-text-muted">Intelligent Student Development System</p>
        </div>

        <Outlet />
      </motion.div>
    </div>
  );
};

export default AuthLayout;
