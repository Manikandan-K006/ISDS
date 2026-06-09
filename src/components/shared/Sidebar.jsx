import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome, FiBookOpen, FiGrid, FiClipboard, FiCalendar, FiAward,
  FiUser, FiUsers, FiBarChart2, FiPhone, FiStar, FiLayers,
  FiChevronLeft, FiLogOut
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';

const studentNav = [
  { to: '/dashboard', icon: FiHome, label: 'Dashboard' },
  { to: '/courses', icon: FiBookOpen, label: 'My Learning' },
  { to: '/courses', icon: FiGrid, label: 'Courses' },
  { to: '/assignments', icon: FiClipboard, label: 'Assignments' },
  { to: '/attendance', icon: FiCalendar, label: 'Attendance' },
  { to: '/certificates', icon: FiAward, label: 'Certificates' },
  { to: '/leaderboard', icon: FiStar, label: 'Leaderboard' },
  { to: '/profile', icon: FiUser, label: 'Profile' },
];

const adminNav = [
  { to: '/admin', icon: FiGrid, label: 'Overview' },
  { to: '/admin/students', icon: FiUsers, label: 'Students' },
  { to: '/admin/courses', icon: FiLayers, label: 'Courses' },
  { to: '/admin/assignments', icon: FiClipboard, label: 'Assignments' },
  { to: '/admin/analytics', icon: FiBarChart2, label: 'Analytics' },
  { to: '/admin/calls', icon: FiPhone, label: 'Communications' },
  { to: '/admin/profile', icon: FiUser, label: 'Profile' },
];

const teacherNav = [
  { to: '/admin', icon: FiHome, label: 'Dashboard' },
  { to: '/courses', icon: FiBookOpen, label: 'My Learning' },
  { to: '/admin/courses', icon: FiGrid, label: 'Courses' },
  { to: '/admin/assignments', icon: FiClipboard, label: 'Assignments' },
  { to: '/admin/students', icon: FiUsers, label: 'Students' },
  { to: '/admin/analytics', icon: FiBarChart2, label: 'Analytics' },
  { to: '/admin/calls', icon: FiPhone, label: 'Communications' },
  { to: '/admin/profile', icon: FiUser, label: 'Profile' },
];

const navMap = {
  student: studentNav,
  teacher: teacherNav,
  admin: adminNav,
};

const Sidebar = ({ open, onClose, collapsed, onToggleCollapse }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const navLinks = navMap[user?.role] || studentNav;

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={onClose} />}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 64 : 256 }}
        className={`fixed top-0 left-0 h-full z-40 bg-[#0B1120] border-r border-white/[0.06] overflow-hidden
          lg:relative
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex flex-col h-full">
          <div className="p-[10px] border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">IS</span>
              </div>
              {!collapsed && (
                <span className="text-sm font-semibold text-white">ISDS</span>
              )}
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
            {navLinks.map((link) => {
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to + link.label}
                  to={link.to}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                    active
                      ? 'bg-white/[0.08] text-white'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                  title={collapsed ? link.label : undefined}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-white rounded-full" />
                  )}
                  <link.icon size={18} className="flex-shrink-0" />
                  {!collapsed && (
                    <span className="truncate">{link.label}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-white/[0.06] py-3 px-2 space-y-1">
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-red-400 hover:bg-white/[0.04] transition-colors"
              title={collapsed ? 'Sign Out' : undefined}
            >
              <FiLogOut size={18} className="flex-shrink-0" />
              {!collapsed && <span className="truncate">Sign Out</span>}
            </button>

            <button
              onClick={onToggleCollapse}
              className="flex items-center justify-center w-full p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.04] transition-colors"
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
