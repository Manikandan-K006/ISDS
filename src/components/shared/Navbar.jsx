import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiBell, FiMenu, FiX, FiLogOut, FiUser, FiChevronDown, FiSettings,
  FiSun, FiMoon, FiSearch, FiMail
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { getInitials } from '../../utils/helpers';

const breadcrumbMap = {
  '/dashboard': 'Dashboard',
  '/courses': 'My Learning',
  '/knowledge-hub': 'Knowledge Hub',
  '/assignments': 'Assignments',
  '/attendance': 'Attendance',
  '/leaderboard': 'Leaderboard',
  '/certificates': 'Certificates',
  '/trophies': 'Achievements',
  '/profile': 'Profile',
  '/settings': 'Settings',
  '/admin': 'Overview',
  '/admin/students': 'Students',
  '/admin/courses': 'Courses',
  '/admin/assignments': 'Assignments',
  '/admin/analytics': 'Analytics',
  '/admin/calls': 'Communications',
  '/admin/profile': 'Profile',
};

const Navbar = ({ onToggleSidebar, sidebarOpen }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
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

  const getBreadcrumb = () => {
    const exact = breadcrumbMap[location.pathname];
    if (exact) return exact;
    const segs = location.pathname.split('/').filter(Boolean);
    return segs.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' / ') || 'Dashboard';
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
          <div className="hidden md:flex items-center gap-1.5 ml-4 pl-4 border-l border-white/[0.06]">
            <span className="text-xs text-slate-500">/</span>
            <span className="text-sm text-slate-300 font-medium">{getBreadcrumb()}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all text-sm">
            <FiSearch size={15} />
            <span className="text-slate-500">Quick search...</span>
            <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-white/[0.06] text-[10px] text-slate-500 font-medium">
              <span>⌘</span>K
            </kbd>
          </button>

          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl hover:bg-white/[0.06] text-slate-400 hover:text-white transition-all"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>

          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-xl hover:bg-white/[0.06] text-slate-400 hover:text-white transition-all"
            >
              <FiBell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 flex items-center justify-center bg-rose-500 text-white text-[9px] font-bold rounded-full ring-2 ring-[#0B1120] min-w-[18px] h-[18px]">
                  {unreadCount}
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
                  className="absolute right-0 mt-2 w-80 bg-[#0F172A] border border-white/[0.06] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
                >
                  <div className="p-4 border-b border-white/[0.06]">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-white">Notifications</h3>
                      <button className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                        Mark all read
                      </button>
                    </div>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          className={`p-4 border-b border-white/[0.04] hover:bg-white/[0.02] cursor-pointer transition-colors ${
                            !n.read ? 'bg-indigo-500/[0.03] border-l-2 border-l-indigo-500' : ''
                          }`}
                        >
                          <p className="text-sm text-slate-300 leading-snug">{n.text}</p>
                          <span className="text-xs text-slate-600 mt-1 block">{n.time}</span>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 px-4">
                        <FiBell size={32} className="text-slate-600 mb-3" />
                        <p className="text-sm text-slate-500">No notifications yet</p>
                      </div>
                    )}
                  </div>
                  <div className="p-3 border-t border-white/[0.06] text-center">
                    <span className="text-xs text-indigo-400 cursor-pointer hover:text-indigo-300 transition-colors">
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
              className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl hover:bg-white/[0.06] transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center">
                <span className="text-indigo-400 text-xs font-bold">{getInitials(user?.name)}</span>
              </div>
              <span className="text-sm text-slate-300 hidden md:block font-medium">{user?.name?.split(' ')[0]}</span>
              <FiChevronDown size={14} className={`text-slate-500 hidden md:block transition-transform duration-200 ${showProfile ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-60 bg-[#0F172A] border border-white/[0.06] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
                >
                  <div className="p-4 border-b border-white/[0.06]">
                    <p className="text-sm font-semibold text-white">{user?.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{user?.email || 'user@isds.edu'}</p>
                    <span className="inline-block mt-2 px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 text-[10px] font-semibold uppercase tracking-wider">
                      {user?.role || 'student'}
                    </span>
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
                  </div>
                  <div className="border-t border-white/[0.06] p-1.5">
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
