import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiMenu, FiX, FiLogOut, FiUser, FiChevronDown, FiSettings } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { getInitials } from '../../utils/helpers';

const Navbar = ({ onToggleSidebar, sidebarOpen }) => {
  const { user, logout } = useAuth();
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
    <nav className="sticky top-0 z-40 glass-dark border-b border-white/10">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button onClick={onToggleSidebar} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white lg:hidden">
            {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
              <span className="text-white font-bold text-sm">IS</span>
            </div>
            <span className="font-heading font-bold text-lg text-white hidden sm:block">ISDS</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white">
              <FiBell size={20} />
              {notifications.some(n => !n.read) && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />}
            </button>
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-80 glass-dark border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                >
                  <div className="p-3 border-b border-white/10">
                    <h3 className="text-sm font-semibold text-white">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map(n => (
                      <div key={n.id} className={`p-3 border-b border-white/5 hover:bg-white/5 cursor-pointer ${!n.read ? 'bg-indigo-500/5' : ''}`}>
                        <p className="text-sm text-slate-300">{n.text}</p>
                        <span className="text-xs text-slate-500">{n.time}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <button onClick={() => setShowProfile(!showProfile)} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/10 transition-colors">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                <span className="text-indigo-400 text-xs font-bold">{getInitials(user?.name)}</span>
              </div>
              <span className="text-sm text-slate-300 hidden md:block">{user?.name?.split(' ')[0]}</span>
              <FiChevronDown size={14} className="text-slate-500 hidden md:block" />
            </button>
            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 glass-dark border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                >
                  <div className="p-3 border-b border-white/10">
                    <p className="text-sm font-medium text-white">{user?.name}</p>
                    <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
                  </div>
                  <div className="p-1">
                    <button onClick={() => { navigate('/profile'); setShowProfile(false); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-300 hover:bg-white/5 rounded-lg">
                      <FiUser size={14} /> Profile
                    </button>
                    <button onClick={() => { navigate('/settings'); setShowProfile(false); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-300 hover:bg-white/5 rounded-lg">
                      <FiSettings size={14} /> Settings
                    </button>
                    <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-lg">
                      <FiLogOut size={14} /> Logout
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
