import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiBell, FiMenu, FiX, FiLogOut, FiUser, FiChevronDown, FiSettings, FiSun, FiMoon
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { getInitials } from '../../utils/helpers';

const Navbar = ({ onToggleSidebar, sidebarOpen }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, text: 'New assignment: Calculus Problem Set', time: '2m ago', read: false },
    { id: 2, text: 'Certificate earned: English Literature', time: '1h ago', read: false },
    { id: 3, text: 'Quiz score: 88/100 in Math', time: '3h ago', read: true },
  ];

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className="sticky top-0 z-30 bg-[#0B1120]/80 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl hover:bg-white/[0.06] text-slate-400 hover:text-white lg:hidden transition-all"
          >
            {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <span className="text-white font-bold text-sm">IS</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-heading font-bold text-base text-white">ISDS</span>
              <span className="text-[10px] text-slate-500 block leading-none">Learning Platform</span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl hover:bg-white/[0.06] text-slate-400 hover:text-white transition-all"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>

          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-xl hover:bg-white/[0.06] text-slate-400 hover:text-white transition-all"
            >
              <FiBell size={18} />
              {notifications.some(n => !n.read) && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-[#0B1120]" />
              )}
            </button>
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  className="absolute right-0 mt-2 w-80 bg-[#0F172A] border border-white/[0.06] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
                >
                  <div className="p-4 border-b border-white/[0.06]">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-white">Notifications</h3>
                      <span className="text-xs text-indigo-400 cursor-pointer hover:text-indigo-300">Mark all read</span>
                    </div>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.map(n => (
                      <div
                        key={n.id}
                        className={`p-4 border-b border-white/[0.04] hover:bg-white/[0.02] cursor-pointer transition-colors ${
                          !n.read ? 'bg-indigo-500/[0.03] border-l-2 border-l-indigo-500' : ''
                        }`}
                      >
                        <p className="text-sm text-slate-300 leading-snug">{n.text}</p>
                        <span className="text-xs text-slate-600 mt-1 block">{n.time}</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-white/[0.06] text-center">
                    <span className="text-xs text-indigo-400 cursor-pointer hover:text-indigo-300">View all notifications</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl hover:bg-white/[0.06] transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center">
                <span className="text-indigo-400 text-xs font-bold">{getInitials(user?.name)}</span>
              </div>
              <span className="text-sm text-slate-300 hidden md:block font-medium">{user?.name?.split(' ')[0]}</span>
              <FiChevronDown size={14} className="text-slate-500 hidden md:block" />
            </button>
            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  className="absolute right-0 mt-2 w-56 bg-[#0F172A] border border-white/[0.06] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
                >
                  <div className="p-4 border-b border-white/[0.06]">
                    <p className="text-sm font-semibold text-white">{user?.name}</p>
                    <p className="text-xs text-slate-500 capitalize mt-0.5">{user?.role}</p>
                  </div>
                  <div className="p-1.5">
                    <button
                      onClick={() => { navigate('/profile'); setShowProfile(false); }}
                      className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-slate-300 hover:bg-white/[0.04] rounded-xl transition-all"
                    >
                      <FiUser size={15} /> Profile
                    </button>
                    <button
                      onClick={() => { navigate('/settings'); setShowProfile(false); }}
                      className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-slate-300 hover:bg-white/[0.04] rounded-xl transition-all"
                    >
                      <FiSettings size={15} /> Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                    >
                      <FiLogOut size={15} /> Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
