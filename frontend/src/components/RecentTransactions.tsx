import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { formatDateTime } from '@/lib/format';
import { Transaction } from '@/types';
import Card from './ui/Card';
import Skeleton from './ui/Skeleton';

interface RecentTransactionsProps {
  transactions: Transaction[];
  loading: boolean;
}

export default function RecentTransactions({ transactions, loading }: RecentTransactionsProps) {
  return (
    <Card title="Log Aktivitas" description="Transaksi terbaru, diperbarui secara realtime">
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">Belum ada transaksi</p>
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
          <AnimatePresence initial={false}>
            {transactions.map((transaction) => (
              <motion.li
                key={transaction.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 py-3"
              >
                {transaction.type === 'in' ? (
                  <ArrowDownCircle className="shrink-0 text-indigo-500" size={28} />
                ) : (
                  <ArrowUpCircle className="shrink-0 text-orange-500" size={28} />
                )}

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-gray-900 dark:text-white">
                    <span className="font-medium">{transaction.created_by}</span>{' '}
                    {transaction.type === 'in' ? 'menambah' : 'mengeluarkan'}{' '}
                    <span className="font-semibold">
                      {transaction.quantity} {transaction.item_unit}
                    </span>{' '}
                    {transaction.item_name}
                  </p>
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                    {transaction.warehouse_name} · Stok {transaction.stock_before} → {transaction.stock_after}
                    {transaction.note && ` · ${transaction.note}`}
                  </p>
                </div>

                <span className="hidden shrink-0 text-xs text-gray-400 sm:block">{formatDateTime(transaction.created_at)}</span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </Card>
  );
}
