'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
}

export function AnimatedCard({ children, className = '', hover = true, delay = 0 }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      whileHover={hover ? { y: -10, scale: 1.02 } : undefined}
      className={`relative ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-white rounded-2xl transform rotate-2 group-hover:rotate-4 transition-all duration-500" />
      <div className="relative bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg hover:shadow-2xl border border-slate-100 hover:border-blue-200 transition-all duration-500 overflow-hidden">
        {children}
      </div>
    </motion.div>
  );
}

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
  delay?: number;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  color = 'text-blue-600',
  bgColor = 'bg-blue-100',
  trend,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="relative group cursor-pointer"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-white rounded-2xl transform rotate-2 group-hover:rotate-4 transition-all duration-500" />
      <div className="relative bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl border border-slate-100 hover:border-blue-200 transition-all duration-500 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/50 to-transparent rounded-full blur-2xl group-hover:from-blue-200/50 transition-all duration-500" />
        <div className="flex items-center justify-between relative">
          <div>
            <p className="text-sm text-slate-600 font-medium">{title}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
            {trend && (
              <p className={`text-sm mt-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </p>
            )}
          </div>
          <motion.div
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.6 }}
            className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center shadow-lg relative`}
          >
            <Icon className={`w-6 h-6 ${color}`} />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
