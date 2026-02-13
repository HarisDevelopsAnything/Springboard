import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar, { SIDEBAR_WIDE, SIDEBAR_NARROW } from './Sidebar';
import { Menu } from 'lucide-react';

const LG_BREAKPOINT = 1024;

const Layout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= LG_BREAKPOINT);

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= LG_BREAKPOINT);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const contentMargin = isDesktop ? (collapsed ? SIDEBAR_NARROW : SIDEBAR_WIDE) : 0;

  return (
    <div className="min-h-screen">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main content area */}
      <div
        className="flex flex-col min-h-screen transition-all duration-300"
        style={{ marginLeft: contentMargin }}
      >
        {/* Top bar (mobile only) */}
        <header className="lg:hidden sticky top-0 z-20 flex items-center h-14 px-4 bg-dark-800/90 backdrop-blur-lg border-b border-border">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 rounded-lg hover:bg-surface-hover text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="ml-3 text-lg font-bold text-accent">WellNest</span>
        </header>

        <main style={{ flex: 1, padding: '2.5rem 3rem' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
