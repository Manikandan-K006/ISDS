import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome, FiBookOpen, FiGrid, FiClipboard, FiAward, FiUser,
  FiUsers, FiBarChart2, FiCalendar, FiPhone, FiSettings, FiLayers, FiStar,
  FiChevronDown, FiChevronLeft, FiCompass, FiLogOut
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';

const studentLinks = [
  { to: '/dashboard', icon: FiHome, label: 'Dashboard' },
  { to: '/courses', icon: FiBookOpen, label: 'My Learning' },
  { to: '/knowledge-hub', icon: FiCompass, label: 'Knowledge Hub' },
  { to: '/assignments', icon: FiClipboard, label: 'Assignments' },
  { to: '/attendance', icon: FiCalendar, label: 'Attendance' },
  { to: '/leaderboard', icon: FiStar, label: 'Leaderboard' },
  { to: '/certificates', icon: FiAward, label: 'Certificates' },
  { to: '/trophies', icon: FiStar, label: 'Achievements' },
  { to: '/profile', icon: FiUser, label: 'My Profile' },
];

const adminLinks = [
  { to: '/admin', icon: FiGrid, label: 'Overview' },
  { to: '/admin/students', icon: FiUsers, label: 'Students' },
  { to: '/admin/courses', icon: FiLayers, label: 'Courses' },
  { to: '/admin/assignments', icon: FiClipboard, label: 'Assignments' },
  { to: '/admin/analytics', icon: FiBarChart2, label: 'Analytics' },
  { to: '/admin/calls', icon: FiPhone, label: 'Communications' },
  { to: '/admin/profile', icon: FiUser, label: 'Profile' },
];

const teamLinks = [
  { to: '/admin', icon: FiGrid, label: 'Overview' },
  { to: '/admin/students', icon: FiUsers, label: 'Students' },
  { to: '/admin/courses', icon: FiLayers, label: 'Courses' },
  { to: '/admin/assignments', icon: FiClipboard, label: 'Assignments' },
  { to: '/admin/analytics', icon: FiBarChart2, label: 'Analytics' },
  { to: '/admin/calls', icon: FiPhone, label: 'Communications' },
  { to: '/admin/profile', icon: FiUser, label: 'Profile' },
  { to: '/courses', icon: FiBookOpen, label: 'My Learning' },
];

const bottomLinks = [
  { to: '/settings', icon: FiSettings, label: 'Settings' },
];

const Sidebar = ({ open, onClose, collapsed, onToggleCollapse }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const links = user?.role === 'admin' ? adminLinks : user?.role === 'teacher' ? teamLinks : studentLinks;

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={onClose} />}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 256 }}
        className={`fixed top-0 left-0 h-full z-40 bg-[#0B1120] border-r border-white/[0.06] overflow-hidden
          lg:relative lg:h-[calc(100vh-4rem)]
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex flex-col h-full">
          <div className="px-4 py-5 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 flex-shrink-0">
                <span className="text-white font-bold text-sm">IS</span>
              </div>
              <AnimatePresence>
                {!collapsed && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <p className="text-sm font-semibold text-white leading-tight">ISDS</p>
                    <p className="text-[10px] text-slate-500">Learning Platform</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
            {links.map(link => {
              const isActive = location.pathname === link.to || location.pathname.startsWith(link.to + '/');
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-indigo-500/15 text-indigo-400'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                  title={collapsed ? link.label : undefined}
                >
                  {isActive && (
                    <motion.div layoutId="sidebar-active" className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full bg-indigo-400" />
                  )}
                  <link.icon size={18} className="flex-shrink-0" />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="truncate"
                      >
                        {link.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              );
            })}
          </nav>

          <div className="px-2 py-3 border-t border-white/[0.06]">
            <button
              onClick={onToggleCollapse}
              className="flex items-center justify-center w-full p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/[0.04] transition-all"
            >
              <FiChevronLeft size={16} className={`transition-transform ${collapsed ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
