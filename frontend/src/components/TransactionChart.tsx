'use client';

import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatShortDate } from '@/lib/format';
import { ChartData } from '@/types';
import Card from './ui/Card';
import Skeleton from './ui/Skeleton';

interface TransactionChartProps {
  data: ChartData[];
  days: number;
  loading: boolean;
  onChangeDays: (days: number) => void;
}

const dayOptions = [7, 14, 30];

export default function TransactionChart({ data, days, loading, onChangeDays }: TransactionChartProps) {
  return (
    <Card
      title="Tren Transaksi"
      description="Jumlah unit masuk dan keluar per hari"
      action={
        <div className="flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
          {dayOptions.map((option) => (
            <button
              key={option}
              onClick={() => onChangeDays(option)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                days === option
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              {option} Hari
            </button>
          ))}
        </div>
      }
    >
      <div className="h-72">
        {loading ? (
          <Skeleton className="h-full w-full" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#9ca3af" strokeOpacity={0.2} vertical={false} />
              <XAxis dataKey="date" tickFormatter={formatShortDate} tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                labelFormatter={(label) => formatShortDate(String(label))}
                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 13 }} />
              <Area type="monotone" dataKey="total_in" name="Stok Masuk" stroke="#6366f1" strokeWidth={2} fill="url(#colorIn)" />
              <Area type="monotone" dataKey="total_out" name="Stok Keluar" stroke="#f97316" strokeWidth={2} fill="url(#colorOut)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
