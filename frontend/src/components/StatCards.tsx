import { motion } from 'framer-motion';
import { AlertTriangle, ArrowLeftRight, Package, Wrench, LucideIcon } from 'lucide-react';
import { formatNumber } from '@/lib/format';
import { Summary } from '@/types';
import Skeleton from './ui/Skeleton';

interface StatCardsProps {
  summary: Summary | null;
  loading: boolean;
  onFilterStatus: (status: string) => void;
}

interface StatItem {
  label: string;
  value: number;
  description: string;
  icon: LucideIcon;
  color: string;
  status?: string;
}

export default function StatCards({ summary, loading, onFilterStatus }: StatCardsProps) {
  if (loading || !summary) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((index) => (
          <div key={index} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-3 h-8 w-16" />
            <Skeleton className="mt-3 h-3 w-32" />
          </div>
        ))}
      </div>
    );
  }

  const stats: StatItem[] = [
    {
      label: 'Total Barang',
      value: summary.total_items,
      description: `${formatNumber(summary.total_stock)} unit tersimpan`,
      icon: Package,
      color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400',
    },
    {
      label: 'Stok Kritis',
      value: summary.low_stock,
      description: 'Klik untuk lihat barang',
      icon: AlertTriangle,
      color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-500/15 dark:text-yellow-400',
      status: 'Low Stock',
    },
    {
      label: 'Maintenance',
      value: summary.maintenance,
      description: 'Klik untuk lihat barang',
      icon: Wrench,
      color: 'bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400',
      status: 'Maintenance',
    },
    {
      label: 'Transaksi Hari Ini',
      value: summary.transactions_today,
      description: `Masuk ${summary.stock_in_today} · Keluar ${summary.stock_out_today} unit`,
      icon: ArrowLeftRight,
      color: 'bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;

        return (
          <motion.button
            key={stat.label}
            type="button"
            disabled={!stat.status}
            onClick={() => stat.status && onFilterStatus(stat.status)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={stat.status ? { y: -4 } : undefined}
            className="rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition-shadow enabled:cursor-pointer enabled:hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
              <div className={`rounded-xl p-2 ${stat.color}`}>
                <Icon size={18} />
              </div>
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{formatNumber(stat.value)}</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{stat.description}</p>
          </motion.button>
        );
      })}
    </div>
  );
}
