// Composant StatCard réutilisable pour afficher des statistiques
// Utilisé dans le dashboard et les pages de liste

import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color?: string;
  bgColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatCard({
  title,
  value,
  icon: Icon,
  color = 'text-blue-600',
  bgColor = 'bg-blue-100',
  trend,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          {trend && (
            <p className={`text-sm mt-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </p>
          )}
        </div>
        <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );
}
