import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome, FiBookOpen, FiGrid, FiClipboard, FiCalendar, FiAward,
  FiUser, FiUsers, FiBarChart2, FiPhone, FiSettings, FiStar,
  FiCompass, FiChevronLeft, FiLogOut
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';

const navSections = {
  student: [
    {
      label: 'MAIN',
      links: [
        { to: '/dashboard', icon: FiHome, label: 'Dashboard' },
        { to: '/courses', icon: FiBookOpen, label: 'My Learning' },
      ]
    },
    {
      label: 'ACADEMICS',
      links: [
        { to: '/assignments', icon: FiClipboard, label: 'Assignments' },
        { to: '/attendance', icon: FiCalendar, label: 'Attendance' },
        { to: '/certificates', icon: FiAward, label: 'Certificates' },
      ]
    },
    {
      label: 'COMMUNITY',
      links: [
        { to: '/leaderboard', icon: FiStar, label: 'Leaderboard' },
        { to: '/knowledge-hub', icon: FiCompass, label: 'Knowledge Hub' },
      ]
    },
    {
      label: 'ACCOUNT',
      links: [
        { to: '/profile', icon: FiUser, label: 'Profile' },
        { to: '/settings', icon: FiSettings, label: 'Settings' },
      ]
    }
  ],
  admin: [
    {
      label: 'MAIN',
      links: [
        { to: '/admin', icon: FiHome, label: 'Dashboard' },
        { to: '/admin/courses', icon: FiGrid, label: 'Courses' },
      ]
    },
    {
      label: 'ACADEMICS',
      links: [
        { to: '/admin/assignments', icon: FiClipboard, label: 'Assignments' },
      ]
    },
    {
      label: 'COMMUNITY',
      links: [
        { to: '/admin/students', icon: FiUsers, label: 'Students' },
        { to: '/admin/analytics', icon: FiBarChart2, label: 'Analytics' },
        { to: '/admin/calls', icon: FiPhone, label: 'Communications' },
      ]
    },
    {
      label: 'ACCOUNT',
      links: [
        { to: '/admin/profile', icon: FiUser, label: 'Profile' },
        { to: '/settings', icon: FiSettings, label: 'Settings' },
      ]
    }
  ],
  teacher: [
    {
      label: 'MAIN',
      links: [
        { to: '/admin', icon: FiHome, label: 'Dashboard' },
        { to: '/courses', icon: FiBookOpen, label: 'My Learning' },
        { to: '/admin/courses', icon: FiGrid, label: 'Courses' },
      ]
    },
    {
      label: 'ACADEMICS',
      links: [
        { to: '/admin/assignments', icon: FiClipboard, label: 'Assignments' },
      ]
    },
    {
      label: 'COMMUNITY',
      links: [
        { to: '/admin/students', icon: FiUsers, label: 'Students' },
        { to: '/admin/analytics', icon: FiBarChart2, label: 'Analytics' },
        { to: '/admin/calls', icon: FiPhone, label: 'Communications' },
      ]
    },
    {
      label: 'ACCOUNT',
      links: [
        { to: '/admin/profile', icon: FiUser, label: 'Profile' },
        { to: '/settings', icon: FiSettings, label: 'Settings' },
      ]
    }
  ]
};

const Sidebar = ({ open, onClose, collapsed, onToggleCollapse }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const sections = navSections[user?.role] || navSections.student;

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

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
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <p className="text-sm font-semibold text-white leading-tight">ISDS</p>
                    <p className="text-[10px] text-slate-500">Learning Platform</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
            {sections.map((section) => (
              <div key={section.label}>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-[10px] text-slate-600 font-semibold tracking-widest uppercase px-3 mb-1.5"
                    >
                      {section.label}
                    </motion.p>
                  )}
                </AnimatePresence>
                <div className="space-y-0.5">
                  {section.links.map((link) => {
                    const active = isActive(link.to);
                    return (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={onClose}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                          active
                            ? 'bg-indigo-500/15 text-indigo-400'
                            : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                        }`}
                        title={collapsed ? link.label : undefined}
                      >
                        {active && (
                          <motion.div
                            layoutId="sidebar-active"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full bg-indigo-400"
                          />
                        )}
                        <link.icon size={18} className="flex-shrink-0" />
                        <AnimatePresence>
                          {!collapsed && (
                            <motion.span
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              transition={{ duration: 0.15 }}
                              className="truncate"
                            >
                              {link.label}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="border-t border-white/[0.06] py-3 px-3 space-y-1">
            <button
              onClick={() => { logout(); }}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
              title={collapsed ? 'Sign Out' : undefined}
            >
              <FiLogOut size={18} className="flex-shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="truncate"
                  >
                    Sign Out
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            <button
              onClick={onToggleCollapse}
              className="flex items-center justify-center w-full p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/[0.04] transition-all"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <FiChevronLeft size={16} className={`transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
