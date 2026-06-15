import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiBell, FiMenu, FiLogOut, FiUser, FiSettings,
  FiSun, FiMoon
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { getInitials } from '../../utils/helpers';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  const notifications = [
    { id: 1, text: 'New assignment: Calculus Problem Set', time: '2m ago', read: false },
    { id: 2, text: 'Certificate earned: English Literature', time: '1h ago', read: false },
    { id: 3, text: 'Quiz score: 88/100 in Math', time: '3h ago', read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => { logout(); navigate('/login'); };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-30 theme-bg/80 backdrop-blur-xl border-b theme-border h-14">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-[var(--hover)] theme-text-muted hover:theme-text lg:hidden transition-colors"
          >
            <FiMenu size={18} />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
              <span className="theme-text font-bold text-xs">IS</span>
            </div>
            <span className="text-sm font-semibold theme-text hidden sm:block">ISDS</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-[var(--hover)] theme-text-muted hover:theme-text transition-colors"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <FiSun size={16} /> : <FiMoon size={16} />}
          </button>

          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-[var(--hover)] theme-text-muted hover:theme-text transition-colors"
            >
              <FiBell size={16} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 theme-bg" />
              )}
            </button>
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-80 theme-card border theme-border rounded-xl shadow-lg overflow-hidden"
                >
                  <div className="p-4 border-b theme-border">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold theme-text">Notifications</h3>
                      <button className="text-xs theme-text-muted hover:theme-text transition-colors">
                        Mark all read
                      </button>
                    </div>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          className={`p-4 border-b border-[var(--border-light)] hover:bg-[var(--subtle)] cursor-pointer transition-colors ${
                            !n.read ? 'bg-[var(--subtle)]' : ''
                          }`}
                        >
                          <p className="text-sm theme-text leading-snug">{n.text}</p>
                          <span className="text-xs theme-text-muted mt-1 block">{n.time}</span>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 px-4">
                        <FiBell size={28} className="theme-text-muted mb-3" />
                          <p className="text-sm theme-text-muted">No notifications yet</p>
                      </div>
                    )}
                  </div>
                  <div className="p-3 border-t theme-border text-center">
                    <span className="text-xs theme-text-muted cursor-pointer hover:theme-text transition-colors">
                      View all notifications
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="p-1 rounded-lg hover:bg-[var(--hover)] transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-white/[0.08] flex items-center justify-center">
                <span className="theme-text-muted text-xs font-medium">{getInitials(user?.name)}</span>
              </div>
            </button>
            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 theme-card border theme-border rounded-xl shadow-lg overflow-hidden"
                >
                  <div className="p-4 border-b theme-border">
                    <p className="text-sm font-semibold theme-text">{user?.name}</p>
                    <p className="text-xs theme-text-muted mt-0.5">{user?.email || 'user@isds.edu'}</p>
                    <span className="inline-block mt-2 px-2 py-0.5 rounded-md bg-[var(--hover)] theme-text-muted text-[10px] font-medium uppercase tracking-wider">
                      {user?.role || 'student'}
                    </span>
                  </div>
                  <div className="p-1.5">
                    <button
                      onClick={() => { navigate('/profile'); setShowProfile(false); }}
                      className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-slate-300 hover:bg-white/[0.04] rounded-lg transition-colors"
                    >
                      <FiUser size={14} /> Profile
                    </button>
                    <button
                      onClick={() => { navigate('/settings'); setShowProfile(false); }}
                      className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-slate-300 hover:bg-white/[0.04] rounded-lg transition-colors"
                    >
                      <FiSettings size={14} /> Settings
                    </button>
                  </div>
                  <div className="border-t theme-border p-1.5">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <FiLogOut size={14} /> Sign Out
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
