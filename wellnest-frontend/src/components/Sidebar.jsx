import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  User,
  Dumbbell,
  UtensilsCrossed,
  Droplets,
  Moon,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Heart,
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/profile', label: 'Profile', icon: User },
  { path: '#', label: 'Workouts', icon: Dumbbell, soon: true },
  { path: '#', label: 'Nutrition', icon: UtensilsCrossed, soon: true },
  { path: '#', label: 'Hydration', icon: Droplets, soon: true },
  { path: '#', label: 'Sleep', icon: Moon, soon: true },
];

const SIDEBAR_WIDE = 256;
const SIDEBAR_NARROW = 72;

const Sidebar = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  // On mobile: show/hide via mobileOpen. On desktop: always visible, toggle width via collapsed.
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop sidebar – always visible at lg+ */}
      <aside
        style={{
          width: collapsed ? SIDEBAR_NARROW : SIDEBAR_WIDE,
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 40,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#1a1a2e',
          borderRight: '1px solid rgba(255,255,255,0.08)',
          transition: 'width 0.3s ease',
        }}
        className="hidden lg:flex"
      >
        {renderSidebarContent(collapsed)}

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            position: 'absolute',
            right: -12,
            top: 80,
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: '#1e2a4a',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#808098',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'color 0.2s, border-color 0.2s',
          }}
        >
          {collapsed ? <ChevronRight style={{ width: 14, height: 14 }} /> : <ChevronLeft style={{ width: 14, height: 14 }} />}
        </button>
      </aside>

      {/* Mobile sidebar – overlay drawer */}
      <aside
        style={{
          width: SIDEBAR_WIDE,
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 40,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#1a1a2e',
          borderRight: '1px solid rgba(255,255,255,0.08)',
          transition: 'transform 0.3s ease',
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
        className="lg:hidden"
      >
        {renderSidebarContent(false)}
      </aside>
    </>
  );

  function renderSidebarContent(isCollapsed) {
    const brandStyle = {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '0 1.25rem',
      height: 68,
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      flexShrink: 0,
    };

    const navStyle = {
      flex: 1,
      padding: '1rem 0.75rem',
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      overflowY: 'auto',
    };

    const linkBase = {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '0.65rem 0.85rem',
      borderRadius: 12,
      textDecoration: 'none',
      transition: 'all 0.2s',
      cursor: 'pointer',
    };

    const activeStyle = {
      ...linkBase,
      background: 'rgba(78, 204, 163, 0.12)',
      color: '#4ecca3',
      boxShadow: 'inset 0 0 0 1px rgba(78, 204, 163, 0.2)',
    };

    const inactiveStyle = {
      ...linkBase,
      color: '#a0a0b8',
    };

    const disabledStyle = {
      ...linkBase,
      color: '#808098',
      opacity: 0.45,
      cursor: 'not-allowed',
    };

    return (
      <>
        {/* Brand */}
        <div style={brandStyle}>
          <Heart style={{ width: 28, height: 28, color: '#4ecca3', flexShrink: 0, fill: '#4ecca3' }} />
          {!isCollapsed && (
            <span style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
              WellNest
            </span>
          )}
        </div>

        {/* Nav Links */}
        <nav style={navStyle}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            if (item.soon) {
              return (
                <div
                  key={item.label}
                  style={{ ...disabledStyle, justifyContent: isCollapsed ? 'center' : undefined }}
                  title={isCollapsed ? `${item.label} (Coming Soon)` : undefined}
                >
                  <Icon style={{ width: 20, height: 20, flexShrink: 0 }} />
                  {!isCollapsed && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: '0.875rem' }}>{item.label}</span>
                      <span style={{ fontSize: '0.6rem', padding: '2px 7px', borderRadius: 999, background: 'rgba(42, 58, 92, 0.6)', color: '#808098', whiteSpace: 'nowrap' }}>
                        Soon
                      </span>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                style={isActive ? { ...activeStyle, justifyContent: isCollapsed ? 'center' : undefined } : { ...inactiveStyle, justifyContent: isCollapsed ? 'center' : undefined }}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon style={{ width: 20, height: 20, flexShrink: 0 }} />
                {!isCollapsed && (
                  <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{item.label}</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Section */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '0.85rem 0.75rem', flexShrink: 0 }}>
          {!isCollapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 0.5rem', marginBottom: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(78, 204, 163, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4ecca3', fontSize: '0.85rem', fontWeight: 700, flexShrink: 0 }}>
                {user?.fullName?.[0] || user?.username?.[0] || 'U'}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 500, color: '#e0e0e0', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.fullName || user?.username}
                </p>
                <p style={{ fontSize: '0.7rem', color: '#808098', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.email}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              width: '100%',
              padding: '0.6rem 0.85rem',
              borderRadius: 12,
              color: '#f87171',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.2s',
              justifyContent: isCollapsed ? 'center' : undefined,
            }}
            title={isCollapsed ? 'Logout' : undefined}
          >
            <LogOut style={{ width: 20, height: 20, flexShrink: 0 }} />
            {!isCollapsed && <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Logout</span>}
          </button>
        </div>
      </>
    );
  }
};

export { SIDEBAR_WIDE, SIDEBAR_NARROW };
export default Sidebar;
