import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="app-layout">
      <Navbar />
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      <main className="app-main">
        <div className="app-content">
          <Outlet />
        </div>
      </main>

      {/* Mobile menu toggle in navbar area */}
      <button
        className="menu-toggle"
        onClick={toggleSidebar}
        aria-label="Toggle menu"
        style={{
          position: 'fixed',
          top: '16px',
          left: '16px',
          zIndex: 250,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
    </div>
  );
}
