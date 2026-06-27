import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../shared/Navbar';
import Sidebar from '../shared/Sidebar';
import AIChatbot from '../AIChatbot';

const pageVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.15 } },
};

const StudentLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try { return localStorage.getItem('isds_sidebar_collapsed') === 'true'; } catch { return false; }
  });
  const location = useLocation();

  const handleToggleCollapse = () => {
    const next = !sidebarCollapsed;
    setSidebarCollapsed(next);
    try { localStorage.setItem('isds_sidebar_collapsed', next.toString()); } catch {}
  };

  return (
    <div className="min-h-screen theme-bg theme-text">
      <Navbar onToggleSidebar={() => setSidebarOpen(true)} />
      <div className="flex">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          collapsed={sidebarCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />
        <main
          className="flex-1 min-h-[calc(100vh-3.5rem)] transition-all duration-300"
          style={{ marginLeft: 0 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="p-4 lg:p-6 xl:p-8 max-w-7xl mx-auto"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <AIChatbot />
    </div>
  );
};

export default StudentLayout;
