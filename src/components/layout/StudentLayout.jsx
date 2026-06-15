import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../shared/Navbar';
import Sidebar from '../shared/Sidebar';
import AIChatbot from '../AIChatbot';

const StudentLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen theme-bg theme-text">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
      <div className="flex">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <motion.main
          layout
          className="flex-1 min-h-[calc(100vh-4rem)] p-4 lg:p-6 transition-all duration-300"
          style={{ marginLeft: 0 }}
        >
          <Outlet />
        </motion.main>
      </div>
      <AIChatbot />
    </div>
  );
};

export default StudentLayout;
