import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown, ArrowDownToLine, ArrowUp, ArrowUpDown, ArrowUpFromLine, PackageSearch, Pencil, Trash2 } from 'lucide-react';
import { Item, ItemFilters, TransactionType } from '@/types';
import StatusBadge from './ui/StatusBadge';
import Skeleton from './ui/Skeleton';

interface ItemTableProps {
  items: Item[];
  loading: boolean;
  filters: ItemFilters;
  onSort: (column: string) => void;
  onTransaction: (item: Item, type: TransactionType) => void;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
}

const columns = [
  { key: 'name', label: 'Barang' },
  { key: 'category', label: 'Kategori' },
  { key: 'warehouse', label: 'Gudang' },
  { key: 'stock', label: 'Stok' },
  { key: 'status', label: 'Status' },
];

export default function ItemTable({ items, loading, filters, onSort, onTransaction, onEdit, onDelete }: ItemTableProps) {
  const renderSortIcon = (column: string) => {
    if (filters.sort_by !== column) {
      return <ArrowUpDown size={14} className="opacity-40" />;
    }

    return filters.sort_order === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((index) => (
          <Skeleton key={index} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-center text-gray-500">
        <PackageSearch size={40} className="mb-3 text-gray-300" />
        <p className="font-medium">Barang tidak ditemukan</p>
        <p className="text-sm">Coba ubah kata kunci atau filter</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px] text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-xs text-gray-500 uppercase dark:border-gray-800 dark:text-gray-400">
            {columns.map((column) => (
              <th key={column.key} className="px-3 py-3 font-medium">
                <button onClick={() => onSort(column.key)} className="flex items-center gap-1 uppercase hover:text-gray-900 dark:hover:text-white">
                  {column.label}
                  {renderSortIcon(column.key)}
                </button>
              </th>
            ))}
            <th className="px-3 py-3 text-right font-medium">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence initial={false}>
            {items.map((item, index) => (
              <motion.tr
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: index * 0.03 }}
                className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
              >
                <td className="px-3 py-3">
                  <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.code}</p>
                </td>
                <td className="px-3 py-3 text-gray-600 dark:text-gray-300">{item.category_name}</td>
                <td className="px-3 py-3 text-gray-600 dark:text-gray-300">{item.warehouse_name}</td>
                <td className="px-3 py-3">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {item.stock} <span className="text-xs font-normal text-gray-500">{item.unit}</span>
                  </p>
                  <p className="text-xs text-gray-500">Min. {item.min_stock}</p>
                </td>
                <td className="px-3 py-3">
                  <StatusBadge status={item.status} />
                </td>
                <td className="px-3 py-3">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => onTransaction(item, 'in')}
                      title="Stok masuk"
                      className="rounded-lg p-2 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/10"
                    >
                      <ArrowDownToLine size={16} />
                    </button>
                    <button
                      onClick={() => onTransaction(item, 'out')}
                      disabled={item.status === 'Maintenance' || item.stock === 0}
                      title="Stok keluar"
                      className="rounded-lg p-2 text-gray-500 hover:bg-orange-50 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-orange-500/10"
                    >
                      <ArrowUpFromLine size={16} />
                    </button>
                    <button
                      onClick={() => onEdit(item)}
                      title="Edit"
                      className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(item)}
                      title="Hapus"
                      className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}
