import { ReactNode } from 'react';

interface Props {
  icon: ReactNode;
  iconBg: string;
  label: string;
  value: number | string;
  sub?: string;
  trend?: string;
}

export default function StatCard({ icon, iconBg, label, value, sub, trend }: Props) {
  return (
    <div className="stat-card group cursor-default hover:shadow-xl hover:border-surface-500/60 relative overflow-hidden">
      <div className="flex-1 min-w-0 pr-2">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
          {trend && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {trend}
            </span>
          )}
        </div>
        <p className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums tracking-tight">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1 truncate">{sub}</p>}
      </div>
      <div className={`stat-icon ${iconBg} group-hover:scale-110 transition-transform duration-200 shadow-lg`}>
        {icon}
      </div>
    </div>
  );
}

