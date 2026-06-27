import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome, FiBookOpen, FiGrid, FiClipboard, FiCalendar, FiAward,
  FiUser, FiUsers, FiBarChart2, FiPhone, FiStar, FiLayers,
  FiChevronLeft, FiLogOut, FiMessageSquare, FiClock, FiZap,
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';

const studentNav = [
  { to: '/dashboard', icon: FiHome, label: 'Dashboard' },
  { to: '/courses', icon: FiGrid, label: 'Courses' },
  { to: '/assignments', icon: FiClipboard, label: 'Assignments' },
  { to: '/schedule', icon: FiClock, label: 'Schedule' },
  { to: '/attendance', icon: FiCalendar, label: 'Attendance' },
  { to: '/certificates', icon: FiAward, label: 'Certificates' },
  { to: '/leaderboard', icon: FiStar, label: 'Leaderboard' },
  { to: '/messages', icon: FiMessageSquare, label: 'Messages' },
  { to: '/profile', icon: FiUser, label: 'Profile' },
];

const adminNav = [
  { to: '/admin', icon: FiZap, label: 'Overview' },
  { to: '/admin/students', icon: FiUsers, label: 'Students' },
  { to: '/admin/courses', icon: FiLayers, label: 'Courses' },
  { to: '/admin/assignments', icon: FiClipboard, label: 'Assignments' },
  { to: '/admin/certificates', icon: FiAward, label: 'Certificates' },
  { to: '/admin/analytics', icon: FiBarChart2, label: 'Analytics' },
  { to: '/admin/calls', icon: FiPhone, label: 'Calls' },
  { to: '/admin/messages', icon: FiMessageSquare, label: 'Messages' },
  { to: '/admin/profile', icon: FiUser, label: 'Profile' },
];

const teacherNav = [
  { to: '/admin', icon: FiHome, label: 'Dashboard' },
  { to: '/courses', icon: FiBookOpen, label: 'My Learning' },
  { to: '/admin/courses', icon: FiGrid, label: 'Courses' },
  { to: '/admin/assignments', icon: FiClipboard, label: 'Assignments' },
  { to: '/admin/students', icon: FiUsers, label: 'Students' },
  { to: '/admin/analytics', icon: FiBarChart2, label: 'Analytics' },
  { to: '/admin/calls', icon: FiPhone, label: 'Calls' },
  { to: '/admin/messages', icon: FiMessageSquare, label: 'Messages' },
  { to: '/admin/profile', icon: FiUser, label: 'Profile' },
];

const navMap = { student: studentNav, teacher: teacherNav, admin: adminNav };

const sidebarVariants = {
  open: { width: 256, transition: { type: 'spring', stiffness: 250, damping: 25 } },
  collapsed: { width: 64, transition: { type: 'spring', stiffness: 250, damping: 25 } },
};

const mobileVariants = {
  hidden: { x: '-100%', opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 250, damping: 25 } },
};

const Sidebar = ({ open, onClose, collapsed, onToggleCollapse }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const navLinks = navMap[user?.role] || studentNav;

  const isActive = (path) => {
    const current = location.pathname;
    if (current === path) return true;
    if (path === '/' || path === '/admin' || path === '/dashboard') return false;
    return current.startsWith(path + '/');
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 theme-overlay z-30 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {open && (
          <motion.aside
            variants={mobileVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed top-0 left-0 h-screen z-40 theme-sidebar border-r theme-border overflow-hidden lg:!hidden"
          >
            <SidebarContent
              navLinks={navLinks}
              isActive={isActive}
              collapsed={false}
              onClose={onClose}
              logout={logout}
              navigate={navigate}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <motion.aside
        initial={false}
        animate={collapsed ? 'collapsed' : 'open'}
        variants={sidebarVariants}
        className="hidden lg:block h-screen sticky top-0 z-30 theme-sidebar border-r theme-border overflow-hidden flex-shrink-0"
      >
        <SidebarContent
          navLinks={navLinks}
          isActive={isActive}
          collapsed={collapsed}
          onClose={onClose}
          logout={logout}
          navigate={navigate}
          onToggleCollapse={onToggleCollapse}
          showToggle
        />
      </motion.aside>
    </>
  );
};

const SidebarContent = ({ navLinks, isActive, collapsed, onClose, logout, navigate, onToggleCollapse, showToggle }) => (
  <div className="flex flex-col h-screen">
    {/* Brand Area — Gradient */}
    <div className="relative overflow-hidden flex-shrink-0">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/10 via-[var(--primary)]/5 to-transparent" />
      <div className="absolute top-[-50%] right-[-50%] w-[200px] h-[200px] bg-[var(--primary)]/5 rounded-full blur-3xl" />
      <div className="relative px-[14px] py-[14px] flex items-center gap-3 h-16">
        <motion.div
          whileHover={{ scale: 1.05, rotate: -3 }}
          className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--primary)] to-violet-500 flex items-center justify-center flex-shrink-0 shadow-sm shadow-[var(--primary)]/20"
        >
          <span className="text-white font-bold text-sm">IS</span>
        </motion.div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col"
          >
            <span className="text-sm font-bold theme-text tracking-tight">ISDS</span>
            <span className="text-[10px] theme-text-muted font-medium tracking-wide">Intelligent System</span>
          </motion.div>
        )}
      </div>
      {!collapsed && <div className="divider-gradient mx-3" />}
    </div>

    {/* Navigation */}
    <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-0.5 scrollbar-thin">
      {navLinks.map((link) => {
        const active = isActive(link.to);
        return (
          <Link
            key={link.to + link.label}
            to={link.to}
            onClick={onClose}
            className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-caption font-medium transition-all duration-150 group
              ${active
                ? 'bg-[var(--primary-muted)] text-[var(--primary)]'
                : 'theme-text-muted hover:theme-text hover:bg-[var(--hover)]'
              }`}
            title={collapsed ? link.label : undefined}
          >
            {active && (
              <motion.span
                layoutId="sidebar-active"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-gradient-to-b from-[var(--primary)] to-violet-500 rounded-full"
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              />
            )}
            <link.icon size={18} strokeWidth={active ? 2.5 : 1.5} className="flex-shrink-0 transition-all duration-150" />
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="truncate"
              >
                {link.label}
              </motion.span>
            )}
            {active && !collapsed && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--primary)] shadow-sm shadow-[var(--primary)]/50" />
            )}
          </Link>
        );
      })}
    </nav>

    {/* Footer */}
    <div className="border-t theme-border py-3 px-2.5 space-y-1 flex-shrink-0">
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => { logout(); navigate('/login'); }}
        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-caption font-medium theme-text-muted hover:text-[var(--danger)] hover:bg-[var(--danger-subtle)] transition-all duration-150 group"
        title={collapsed ? 'Sign Out' : undefined}
      >
        <FiLogOut size={18} className="flex-shrink-0 transition-all duration-150 group-hover:scale-110" />
        {!collapsed && <span className="truncate">Sign Out</span>}
      </motion.button>

      {showToggle && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onToggleCollapse}
          className="flex items-center justify-center w-full p-2 rounded-xl theme-text-muted hover:theme-text hover:bg-[var(--hover)] transition-all duration-150"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <motion.div
            animate={{ rotate: collapsed ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <FiChevronLeft size={16} />
          </motion.div>
        </motion.button>
      )}
    </div>
  </div>
);

export default Sidebar;
