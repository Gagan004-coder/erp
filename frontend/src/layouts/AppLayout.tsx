import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface NavItem {
  to: string;
  label: string;
  icon: string;
  roles?: string[];
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/customers', label: 'Customers', icon: '👥' },
  { to: '/products', label: 'Products', icon: '📦' },
  { to: '/inventory', label: 'Inventory', icon: '🏭' },
  { to: '/challans', label: 'Challans', icon: '📋' },
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
      <aside className="w-60 flex-shrink-0 bg-surface-800 border-r border-surface-600 flex flex-col">
        <div className="p-5 border-b border-surface-600">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-sm font-bold glow-brand">
              E
            </div>
            <div>
              <p className="font-bold text-white text-sm leading-tight">ERP Portal</p>
              <p className="text-xs text-gray-500">Operations Hub</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          <p className="section-title mt-2">Navigation</p>
          {filtered.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-surface-600">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface-700 mb-2">
            <div className="w-8 h-8 rounded-full bg-brand-600/30 border border-brand-500/30 flex items-center justify-center text-sm font-semibold text-brand-400 flex-shrink-0">
              {user?.name[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
          </div>
          <button
            id="logout-btn"
            onClick={handleLogout}
            className="btn btn-ghost w-full justify-start text-gray-400 hover:text-red-400"
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
