'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Summary } from '@/types';
import Card from './ui/Card';
import Skeleton from './ui/Skeleton';

interface StatusChartProps {
  summary: Summary | null;
  loading: boolean;
}

export default function StatusChart({ summary, loading }: StatusChartProps) {
  const data = summary
    ? [
        { name: 'Available', value: summary.available, color: '#22c55e' },
        { name: 'Low Stock', value: summary.low_stock, color: '#eab308' },
        { name: 'Maintenance', value: summary.maintenance, color: '#f97316' },
      ]
    : [];

  return (
    <Card title="Status Barang" description="Perbandingan kondisi stok saat ini">
      {loading || !summary ? (
        <Skeleton className="h-72 w-full" />
      ) : (
        <>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 space-y-2">
            {data.map((entry) => (
              <div key={entry.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  {entry.name}
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">{entry.value} barang</span>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
