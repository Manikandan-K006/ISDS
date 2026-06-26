import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiBell, FiMenu, FiLogOut, FiUser, FiSettings,
  FiSun, FiMoon, FiTrash2
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { getInitials } from '../../utils/helpers';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification } from '../../api/notifications';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications({ limit: 20 });
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch {
      // silently fail
    }
  };

  useEffect(() => {
    if (showNotifications) fetchNotifications();
  }, [showNotifications]);

  useEffect(() => {
    (async () => {
      try {
        const res = await getUnreadCount();
        setUnreadCount(res.data?.count || 0);
      } catch { /* silent */ }
    })();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // silently fail
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      // silently fail
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      // silently fail
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

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
            type="button"
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
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 theme-bg">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
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
                      {unreadCount > 0 && (
                        <button onClick={handleMarkAllRead} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                          Mark all read
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map(n => (
                        <div
                          key={n._id}
                          onClick={() => { if (!n.isRead) handleMarkRead(n._id); }}
                          className={`p-4 border-b theme-border-light hover:theme-subtle cursor-pointer transition-colors group ${
                            !n.isRead ? 'theme-subtle' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm theme-text font-medium">{n.title}</p>
                              <p className="text-xs theme-text-muted mt-0.5 line-clamp-2">{n.message}</p>
                              <span className="text-[10px] theme-text-muted mt-1 block">{formatTime(n.createdAt)}</span>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(n._id); }}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/10 theme-text-muted hover:text-red-400 transition-all shrink-0"
                            >
                              <FiTrash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 px-4">
                        <FiBell size={28} className="theme-text-muted mb-3" />
                          <p className="text-sm theme-text-muted">No notifications yet</p>
                      </div>
                    )}
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
              <div className="w-7 h-7 rounded-full bg-[var(--subtle)] flex items-center justify-center">
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
                    <span className="inline-block mt-2 px-2 py-0.5 rounded-md theme-hover theme-text-muted text-[10px] font-medium uppercase tracking-wider">
                      {user?.role || 'student'}
                    </span>
                  </div>
                  <div className="p-1.5">
                    <button
                      onClick={() => { navigate('/profile'); setShowProfile(false); }}
                      className="flex items-center gap-2.5 w-full px-3 py-2 text-sm theme-text hover:theme-hover rounded-lg transition-colors"
                    >
                      <FiUser size={14} /> Profile
                    </button>
                    <button
                      onClick={() => { navigate('/settings'); setShowProfile(false); }}
                      className="flex items-center gap-2.5 w-full px-3 py-2 text-sm theme-text hover:theme-hover rounded-lg transition-colors"
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
