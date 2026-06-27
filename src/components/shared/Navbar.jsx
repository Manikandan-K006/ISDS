import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiMenu, FiLogOut, FiUser, FiSun, FiMoon, FiTrash2, FiCheck, FiSearch, FiCommand } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { getInitials } from '../../utils/helpers';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification } from '../../api/notifications';

const dropdownVariants = {
  hidden: { opacity: 0, y: -6, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.15, ease: 'easeOut' } },
  exit: { opacity: 0, y: -6, scale: 0.96, transition: { duration: 0.08 } },
};

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

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await getUnreadCount();
      setUnreadCount(res.data?.count || 0);
    } catch {}
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications({ limit: 20 });
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch {}
  };

  useEffect(() => {
    if (showNotifications) fetchNotifications();
  }, [showNotifications]);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  const handleNotificationClick = (n) => {
    if (!n.isRead) handleMarkRead(n._id);
    setShowNotifications(false);
    if (n.link) navigate(n.link);
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
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
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  return (
    <nav className="sticky top-0 z-40 px-3 sm:px-4 pt-3">
      <div className="max-w-[1600px] mx-auto glass-nav rounded-2xl h-14 px-3 sm:px-5 transition-all duration-300 shadow-sm">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onToggleSidebar}
              className="p-2 rounded-xl hover:bg-[var(--hover)] theme-text-muted hover:theme-text lg:hidden transition-all duration-150"
              aria-label="Toggle sidebar"
            >
              <FiMenu size={18} />
            </motion.button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--primary)] to-violet-500 flex items-center justify-center shadow-sm shadow-[var(--primary)]/20">
                <span className="text-white font-bold text-[11px]">IS</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5">
                <span className="text-sm font-bold theme-text tracking-tight">ISDS</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[var(--primary-muted)] text-[var(--primary)] font-semibold">v2</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-0.5 sm:gap-1">
            {/* Quick Search */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--subtle)] border border-[var(--border)] theme-text-muted hover:theme-text hover:border-[var(--text-muted)] transition-all duration-150 text-small"
            >
              <FiSearch size={13} />
              <span>Quick search...</span>
              <kbd className="text-[10px] px-1.5 py-0.5 rounded-md bg-[var(--hover)] theme-text-muted font-mono flex items-center gap-0.5">
                <FiCommand size={9} />K
              </kbd>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-[var(--hover)] theme-text-muted hover:theme-text transition-all duration-150"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              <motion.div
                key={theme}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {theme === 'dark' ? <FiSun size={16} /> : <FiMoon size={16} />}
              </motion.div>
            </motion.button>

            <div className="relative" ref={notifRef}>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl hover:bg-[var(--hover)] theme-text-muted hover:theme-text transition-all duration-150"
                aria-label="Notifications"
              >
                <FiBell size={16} />
                <AnimatePresence>
                  {unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-gradient-to-br from-[var(--danger)] to-rose-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-[var(--card-bg)]"
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute right-0 mt-2 w-80 theme-card border theme-border rounded-2xl shadow-2xl overflow-hidden"
                  >
                    <div className="p-4 border-b theme-border flex items-center justify-between">
                      <h3 className="text-caption font-semibold theme-text">Notifications</h3>
                      {unreadCount > 0 && (
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={handleMarkAllRead}
                          className="text-small text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors font-medium"
                        >
                          Mark all read
                        </motion.button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto scrollbar-thin">
                      {notifications.length > 0 ? (
                        notifications.map((n, i) => (
                          <motion.div
                            key={n._id}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.02 }}
                            onClick={() => handleNotificationClick(n)}
                            className={`p-4 border-b theme-border-light cursor-pointer transition-all duration-150 group relative ${
                              !n.isRead ? 'bg-[var(--primary-muted)]' : 'hover:bg-[var(--hover)]'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  {!n.isRead && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] flex-shrink-0" />
                                  )}
                                  <p className={`text-small ${!n.isRead ? 'theme-text font-semibold' : 'theme-text-secondary'}`}>
                                    {n.title}
                                  </p>
                                </div>
                                <p className="text-small theme-text-muted mt-0.5 line-clamp-2 ml-3.5">{n.message}</p>
                                <span className="text-micro theme-text-muted mt-1 ml-3.5 block">{formatTime(n.createdAt)}</span>
                              </div>
                              <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                {!n.isRead && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleMarkRead(n._id); }}
                                    className="p-1 rounded hover:bg-[var(--primary-muted)] theme-text-muted hover:text-[var(--primary)] transition-colors"
                                    title="Mark as read"
                                  >
                                    <FiCheck size={12} />
                                  </button>
                                )}
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDelete(n._id); }}
                                  className="p-1 rounded hover:bg-[var(--danger-subtle)] theme-text-muted hover:text-[var(--danger)] transition-colors"
                                  title="Delete"
                                >
                                  <FiTrash2 size={12} />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 px-4">
                          <div className="w-12 h-12 rounded-2xl bg-[var(--subtle)] flex items-center justify-center mb-3">
                            <FiBell size={20} className="theme-text-muted" />
                          </div>
                          <p className="text-caption theme-text-muted">No notifications yet</p>
                        </div>
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <div className="border-t theme-border p-2">
                        <button
                          onClick={() => { setShowNotifications(false); navigate('/notifications'); }}
                          className="w-full text-center text-small text-[var(--primary)] hover:text-[var(--primary-hover)] py-1.5 rounded-lg hover:bg-[var(--hover)] transition-colors font-medium"
                        >
                          View all notifications
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative" ref={profileRef}>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowProfile(!showProfile)}
                className="p-0.5 rounded-xl hover:bg-[var(--hover)] transition-all duration-150"
                aria-label="Profile"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--primary)] to-violet-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-[var(--card-bg)] shadow-sm">
                  {getInitials(user?.name)}
                </div>
              </motion.button>
              <AnimatePresence>
                {showProfile && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute right-0 mt-2 w-56 theme-card border theme-border rounded-2xl shadow-2xl overflow-hidden"
                  >
                    <div className="p-4 border-b theme-border">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--primary)] to-violet-500 text-white text-sm font-bold flex items-center justify-center border-2 border-[var(--border)] shadow-sm">
                          {getInitials(user?.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-caption font-semibold theme-text truncate">{user?.name}</p>
                          <p className="text-small theme-text-muted truncate">{user?.email || 'user@isds.edu'}</p>
                        </div>
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-[var(--primary-muted)] text-[var(--primary)] text-micro font-semibold capitalize">
                        {user?.role || 'student'}
                      </span>
                    </div>
                    <div className="p-1.5">
                      <button
                        onClick={() => { navigate('/profile'); setShowProfile(false); }}
                        className="flex items-center gap-2.5 w-full px-3 py-2 text-small theme-text hover:bg-[var(--hover)] rounded-xl transition-colors"
                      >
                        <FiUser size={14} /> Profile
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 w-full px-3 py-2 text-small text-[var(--danger)] hover:bg-[var(--danger-subtle)] rounded-xl transition-colors"
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
      </div>
    </nav>
  );
};

export default Navbar;
