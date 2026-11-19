import { CheckCircle, AlertTriangle, Wrench } from 'lucide-react';
import { ItemStatus } from '@/types';

const statusStyles = {
  Available: {
    className: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400',
    icon: CheckCircle,
  },
  'Low Stock': {
    className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400',
    icon: AlertTriangle,
  },
  Maintenance: {
    className: 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400',
    icon: Wrench,
  },
};

export default function StatusBadge({ status }: { status: ItemStatus }) {
  const style = statusStyles[status];
  const Icon = style.icon;

  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${style.className}`}>
      <Icon size={12} />
      {status}
    </span>
  );
}
