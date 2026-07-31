import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, CalendarCheck, BarChart3, ClipboardList,
  MessageSquare, Bell, User, ChevronLeft, Menu, LogOut, Sun, Moon,
  FileText, GraduationCap,
} from 'lucide-react';

const navItems = [
  { to: '/parent/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/parent/attendance', icon: CalendarCheck, label: 'Attendance' },
  { to: '/parent/performance', icon: BarChart3, label: 'Performance' },
  { to: '/parent/assignments', icon: ClipboardList, label: 'Assignments' },
  { to: '/parent/reports', icon: FileText, label: 'Reports' },
  { to: '/parent/messages', icon: MessageSquare, label: 'Messages' },
  { to: '/parent/notifications', icon: Bell, label: 'Notifications' },
];

export default function ParentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen theme-bg flex">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        <motion.aside
          initial={false}
          animate={{ width: sidebarOpen ? 260 : 72 }}
          className="theme-sidebar border-r theme-border fixed left-0 top-0 h-screen z-30 flex flex-col overflow-hidden"
        >
          {/* Logo */}
          <div className="flex items-center justify-between px-4 h-16 border-b theme-border">
            {sidebarOpen && (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl gradient-accent flex items-center justify-center">
                  <GraduationCap size={16} className="text-white" />
                </div>
                <span className="font-bold text-base theme-text">SIDTS</span>
              </div>
            )}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg hover:theme-hover transition-colors">
              <ChevronLeft size={18} className={`theme-text-muted transition-transform ${!sidebarOpen && 'rotate-180'}`} />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-500/10 text-indigo-500 font-medium'
                      : 'theme-text-muted hover:theme-hover hover:theme-text'
                  }`
                }
              >
                <Icon size={20} className="shrink-0" />
                {sidebarOpen && <span className="text-sm">{label}</span>}
              </NavLink>
            ))}
          </nav>

          {/* User */}
          <div className="p-3 border-t theme-border">
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="w-8 h-8 rounded-full gradient-accent flex items-center justify-center text-white text-xs font-bold">
                {user?.name?.charAt(0) || 'P'}
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium theme-text truncate">{user?.name}</p>
                  <p className="text-xs theme-text-muted">Parent</p>
                </div>
              )}
            </div>
          </div>
        </motion.aside>
      </AnimatePresence>

      {/* Main */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-[260px]' : 'ml-[72px]'}`}>
        {/* Top Nav */}
        <header className="h-16 border-b theme-border flex items-center justify-between px-6 glass-nav sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:theme-hover transition-colors lg:hidden">
              <Menu size={20} className="theme-text" />
            </button>
            <h1 className="text-sm font-medium theme-text capitalize">
              {location.pathname.split('/').pop()?.replace(/-/g, ' ') || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:theme-hover transition-colors">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={logout} className="p-2 rounded-lg hover:theme-hover transition-colors text-red-400">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}