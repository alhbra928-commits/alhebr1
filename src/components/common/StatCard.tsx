import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  bgColor?: string;
  iconColor?: string;
}

export function StatCard({ title, value, icon: Icon, trend, bgColor = 'bg-emerald-500/10', iconColor = 'text-emerald-400' }: StatCardProps) {
  return (
    <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-emerald-800/30 shadow-lg p-6 hover:shadow-emerald-500/10 hover:border-emerald-700/50 transition-all duration-300 group">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-emerald-200/70 mb-1">{title}</p>
          <p className="text-2xl font-bold bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">{value}</p>
          {trend && (
            <p className={`text-xs mt-2 ${trend.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <div className={`${bgColor} backdrop-blur-sm p-4 rounded-lg border border-emerald-700/30 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}
