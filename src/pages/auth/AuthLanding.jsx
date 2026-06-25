import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const AuthLanding = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      className="relative z-10 w-full h-full flex items-center justify-center px-4 py-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="w-full max-w-[960px]">
        <motion.div className="text-center mb-10" variants={cardVariants}>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-500/25">
            <span className="text-white font-bold text-xl">IS</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold theme-text font-heading">ISDS</h1>
          <p className="theme-text-muted text-sm md:text-base mt-2 max-w-md mx-auto">
            Intelligent Student Development System
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[640px] mx-auto">
          <motion.button
            variants={cardVariants}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/login')}
            className="group relative overflow-hidden rounded-2xl p-8 text-left cursor-pointer
              bg-[var(--card-bg)] border border-[var(--border)] hover:border-[var(--border-light)]
              shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-black/10
              transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center mb-5 shadow-lg shadow-indigo-500/20">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold theme-text mb-2">Sign In</h2>
              <p className="text-sm theme-text-muted">Already have an account? Sign in to continue your learning journey.</p>
            </div>
          </motion.button>

          <motion.button
            variants={cardVariants}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/register')}
            className="group relative overflow-hidden rounded-2xl p-8 text-left cursor-pointer
              bg-[var(--card-bg)] border border-[var(--border)] hover:border-[var(--border-light)]
              shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-black/10
              transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-5 shadow-lg shadow-emerald-500/20">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold theme-text mb-2">Create Account</h2>
              <p className="text-sm theme-text-muted">New user? Register here to start your educational experience.</p>
            </div>
          </motion.button>
        </div>

        <motion.p
          variants={cardVariants}
          className="text-center text-xs theme-text-muted mt-10"
        >
          Powered by ISDS Learning Platform v2.0
        </motion.p>
      </div>
    </motion.div>
  );
};

export default AuthLanding;
