import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiHome, FiBookOpen, FiGrid, FiClipboard, FiAward, FiUser,
  FiUsers, FiBarChart2, FiCalendar, FiPhone, FiSettings, FiLayers, FiStar
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';

const studentLinks = [
  { to: '/dashboard', icon: FiHome, label: 'Dashboard' },
  { to: '/courses', icon: FiBookOpen, label: 'Course Catalog' },
  { to: '/assignments', icon: FiClipboard, label: 'Assignments' },
  { to: '/attendance', icon: FiCalendar, label: 'Attendance' },
  { to: '/certificates', icon: FiAward, label: 'Certificates' },
  { to: '/trophies', icon: FiStar, label: 'Trophy Room' },
  { to: '/profile', icon: FiUser, label: 'My Profile' },
];

const adminLinks = [
  { to: '/admin', icon: FiHome, label: 'Dashboard' },
  { to: '/admin/students', icon: FiUsers, label: 'Students' },
  { to: '/admin/courses', icon: FiLayers, label: 'Courses' },
  { to: '/admin/assignments', icon: FiClipboard, label: 'Assignments' },
  { to: '/admin/analytics', icon: FiBarChart2, label: 'Analytics' },
  { to: '/admin/calls', icon: FiPhone, label: 'Call Module' },
  { to: '/admin/profile', icon: FiUser, label: 'My Profile' },
];

const teacherLinks = [
  { to: '/admin', icon: FiHome, label: 'Dashboard' },
  { to: '/admin/students', icon: FiUsers, label: 'Students' },
  { to: '/admin/courses', icon: FiLayers, label: 'Courses' },
  { to: '/admin/assignments', icon: FiClipboard, label: 'Assignments' },
  { to: '/admin/analytics', icon: FiBarChart2, label: 'Analytics' },
  { to: '/admin/calls', icon: FiPhone, label: 'Call Module' },
  { to: '/admin/profile', icon: FiUser, label: 'My Profile' },
  { to: '/courses', icon: FiBookOpen, label: 'Learning' },
];

const Sidebar = ({ open, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  const links = user?.role === 'admin' ? adminLinks : user?.role === 'teacher' ? teacherLinks : studentLinks;

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={onClose} />}
      <motion.aside
        initial={false}
        animate={{ x: open ? 0 : -280 }}
        className="fixed top-0 left-0 h-full w-64 bg-navy border-r border-white/10 z-40 lg:translate-x-0 lg:static lg:h-[calc(100vh-4rem)] overflow-y-auto pt-4"
      >
        <div className="px-4 mb-6 lg:hidden">
          <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
            <span className="text-white font-bold text-sm">IS</span>
          </div>
        </div>
        <nav className="px-3 space-y-1">
          {links.map(link => {
            const isActive = location.pathname === link.to || location.pathname.startsWith(link.to + '/');
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <link.icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </motion.aside>
    </>
  );
};

export default Sidebar;
