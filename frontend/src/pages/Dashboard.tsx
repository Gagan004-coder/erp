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

  if (isLoading) return <LoadingSpinner text="Loading enterprise dashboard..." />;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Top Visual Welcome Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-surface-600/80 shadow-2xl bg-surface-800">
        <img 
          src="/assets/dashboard_banner.png" 
          alt="Enterprise Analytics" 
          className="w-full h-44 object-cover opacity-60 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-surface-900 via-surface-900/80 to-transparent flex items-center p-6 sm:p-8">
          <div className="max-w-xl">
            <span className="badge badge-blue mb-2">System Active • v2.4</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Enterprise Dashboard
            </h1>
            <p className="text-gray-300 text-sm mt-1">
              Real-time insight into stock levels, customer relations, and live delivery challans.
            </p>
          </div>
          <div className="hidden md:flex ml-auto gap-3">
            <Link to="/challans/new" id="new-challan-btn" className="btn btn-primary shadow-lg shadow-brand-500/20">
              ⚡ Create Challan
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard
          icon="👥"
          iconBg="bg-gradient-to-br from-brand-600/30 to-brand-400/10 text-brand-400 border border-brand-500/20"
          label="Total Customers"
          value={stats?.totalCustomers ?? 0}
          sub="Registered accounts"
          trend="+14%"
        />
        <StatCard
          icon="📦"
          iconBg="bg-gradient-to-br from-purple-600/30 to-purple-400/10 text-purple-400 border border-purple-500/20"
          label="Total Products"
          value={stats?.totalProducts ?? 0}
          sub="Active catalog SKUs"
          trend="+8%"
        />
        <StatCard
          icon="⚠️"
          iconBg="bg-gradient-to-br from-amber-600/30 to-amber-400/10 text-amber-400 border border-amber-500/20"
          label="Low Stock Alert"
          value={stats?.lowStockCount ?? 0}
          sub="Requires reorder"
          trend={stats?.lowStockCount ? 'Action Required' : 'Optimal'}
        />
        <StatCard
          icon="📋"
          iconBg="bg-gradient-to-br from-blue-600/30 to-blue-400/10 text-blue-400 border border-blue-500/20"
          label="Draft Challans"
          value={stats?.draftChallans ?? 0}
          sub="Pending dispatch"
          trend="In Progress"
        />
        <StatCard
          icon="✅"
          iconBg="bg-gradient-to-br from-emerald-600/30 to-emerald-400/10 text-emerald-400 border border-emerald-500/20"
          label="Confirmed Sales"
          value={stats?.confirmedChallans ?? 0}
          sub="Dispatched & finalized"
          trend="100% Verified"
        />
      </div>

      {/* Quick Action Modules */}
      <div>
        <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <span>🚀</span> Quick Operations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: 'Customer Directory',
              desc: 'Manage customer profiles, billing addresses, and interaction history',
              icon: '👥',
              to: '/customers',
              badge: 'CRM',
              gradient: 'from-brand-900/40 via-surface-800 to-surface-800 border-brand-500/30',
            },
            {
              title: 'Challan Operations',
              desc: 'Issue new delivery challans, update status, and manage stock deductions',
              icon: '📋',
              to: '/challans',
              badge: 'Logistics',
              gradient: 'from-emerald-900/40 via-surface-800 to-surface-800 border-emerald-500/30',
            },
            {
              title: 'Inventory & Warehousing',
              desc: 'Track warehouse locations, stock movements, and minimum stock alerts',
              icon: '🏭',
              to: '/inventory',
              badge: 'Warehouse',
              gradient: 'from-purple-900/40 via-surface-800 to-surface-800 border-purple-500/30',
            },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`card p-6 bg-gradient-to-br ${item.gradient} border hover:border-brand-500/50 hover:shadow-2xl transition-all duration-300 group flex flex-col justify-between`}
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-surface-700/80 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <span className="badge badge-gray">{item.badge}</span>
                </div>
                <h3 className="text-white font-bold text-lg mb-1 group-hover:text-brand-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-surface-700/40 flex items-center justify-between text-xs font-semibold text-brand-400 group-hover:text-brand-300">
                <span>Access Module</span>
                <span className="transform group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

