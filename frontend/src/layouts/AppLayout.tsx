import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface NavItem {
  to: string;
  label: string;
  icon: string;
  badge?: string;
  roles?: string[];
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/customers', label: 'Customers', icon: '👥' },
  { to: '/products', label: 'Products', icon: '📦' },
  { to: '/inventory', label: 'Inventory', icon: '🏭' },
  { to: '/challans', label: 'Challans', icon: '📋', badge: 'Live' },
  { to: '/users', label: 'Users', icon: '👤', roles: ['ADMIN'] },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filtered = navItems.filter(item => !item.roles || item.roles.includes(user?.role ?? ''));

  return (
    <div className="flex h-screen overflow-hidden bg-surface-900">
      {/* Sidebar Navigation */}
      <aside className="w-64 flex-shrink-0 bg-surface-800/90 backdrop-blur-xl border-r border-surface-700/60 flex flex-col z-20">
        <div className="p-4 border-b border-surface-700/60">
          <div className="flex items-center gap-3">
            <img 
              src="/assets/logo.png" 
              alt="Enterprise ERP" 
              className="w-9 h-9 object-contain drop-shadow-md rounded-lg bg-surface-700/40 p-1"
            />
            <div>
              <p className="font-bold text-white text-base leading-tight tracking-wide">Enterprise ERP</p>
              <p className="text-xs text-brand-400 font-medium">Operations Hub</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          <p className="section-title mt-2">Main Navigation</p>
          {filtered.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link group ${isActive ? 'active' : ''}`}
            >
              <span className="icon group-hover:scale-110">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-surface-700/60 bg-surface-800/50">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface-700/60 border border-surface-600/40 mb-2 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-purple-600 border border-brand-400/40 flex items-center justify-center text-sm font-bold text-white shadow-md flex-shrink-0">
              {user?.name[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <span className="inline-block text-[10px] uppercase font-bold text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded border border-brand-500/20">
                {user?.role}
              </span>
            </div>
          </div>
          <button
            id="logout-btn"
            onClick={handleLogout}
            className="btn btn-ghost w-full justify-start text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area with Header */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar Header */}
        <header className="h-16 bg-surface-800/60 backdrop-blur-md border-b border-surface-700/60 px-6 flex items-center justify-between gap-4 z-10">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative w-full">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 text-sm">
                🔍
              </span>
              <input
                type="text"
                placeholder="Global search (Challans, Customers, SKUs)..."
                className="w-full bg-surface-700/50 border border-surface-600/50 rounded-xl pl-9 pr-4 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/60 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Sync
            </div>
            <button className="p-2 rounded-xl bg-surface-700/50 hover:bg-surface-700 text-gray-400 hover:text-white border border-surface-600/40 relative transition-colors">
              <span>🔔</span>
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-500"></span>
            </button>
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

