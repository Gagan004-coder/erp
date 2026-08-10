import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { inventoryService } from '../services/inventoryService';
import { DashboardStats } from '../types';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    inventoryService.getStats()
      .then(setStats)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <LoadingSpinner text="Loading dashboard..." />;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title text-gradient">Dashboard</h1>
          <p className="page-subtitle">Welcome back — here's what's happening today</p>
        </div>
        <div className="flex gap-2">
          <Link to="/challans/new" id="new-challan-btn" className="btn btn-primary">
            + New Challan
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        <StatCard
          icon="👥"
          iconBg="bg-brand-500/20 text-brand-400"
          label="Total Customers"
          value={stats?.totalCustomers ?? 0}
          sub="All registered customers"
        />
        <StatCard
          icon="📦"
          iconBg="bg-purple-500/20 text-purple-400"
          label="Total Products"
          value={stats?.totalProducts ?? 0}
          sub="SKUs in catalogue"
        />
        <StatCard
          icon="⚠️"
          iconBg="bg-amber-500/20 text-amber-400"
          label="Low Stock"
          value={stats?.lowStockCount ?? 0}
          sub="Below minimum level"
        />
        <StatCard
          icon="📋"
          iconBg="bg-yellow-500/20 text-yellow-400"
          label="Draft Challans"
          value={stats?.draftChallans ?? 0}
          sub="Pending confirmation"
        />
        <StatCard
          icon="✅"
          iconBg="bg-emerald-500/20 text-emerald-400"
          label="Confirmed"
          value={stats?.confirmedChallans ?? 0}
          sub="Completed challans"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'Manage Customers', desc: 'View and manage your CRM contacts', icon: '👥', to: '/customers', color: 'from-brand-600/20 to-brand-800/10 border-brand-500/20' },
          { title: 'Create Challan', desc: 'Generate a new sales challan', icon: '📋', to: '/challans/new', color: 'from-emerald-600/20 to-emerald-800/10 border-emerald-500/20' },
          { title: 'View Inventory', desc: 'Monitor stock levels and movements', icon: '🏭', to: '/inventory', color: 'from-amber-600/20 to-amber-800/10 border-amber-500/20' },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`card p-5 bg-gradient-to-br ${item.color} border hover:scale-[1.02] transition-transform duration-200`}
          >
            <div className="text-3xl mb-3">{item.icon}</div>
            <h3 className="text-white font-semibold mb-1">{item.title}</h3>
            <p className="text-gray-400 text-sm">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
