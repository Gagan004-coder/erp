import { ReactNode } from 'react';

interface Props {
  icon: ReactNode;
  iconBg: string;
  label: string;
  value: number | string;
  sub?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export default function StatCard({ icon, iconBg, label, value, sub }: Props) {
  return (
    <div className="stat-card group cursor-default">
      <div className={`stat-icon ${iconBg} group-hover:scale-110 transition-transform duration-200`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
        <p className="text-3xl font-bold text-white tabular-nums">{value}</p>
        {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
      </div>
    </div>
  );
}
