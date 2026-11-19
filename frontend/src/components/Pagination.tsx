import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PaginationMeta } from '@/types';

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

export default function Pagination({ meta, onPageChange }: PaginationProps) {
  const from = meta.total === 0 ? 0 : (meta.current_page - 1) * meta.per_page + 1;
  const to = Math.min(meta.current_page * meta.per_page, meta.total);

  return (
    <div className="mt-4 flex flex-col items-center justify-between gap-3 text-sm sm:flex-row">
      <p className="text-gray-500 dark:text-gray-400">
        Menampilkan {from}-{to} dari {meta.total} barang
      </p>

      <div className="flex items-center gap-2">
        <button
          disabled={meta.current_page <= 1}
          onClick={() => onPageChange(meta.current_page - 1)}
          className="rounded-lg border border-gray-300 p-1.5 hover:bg-gray-100 disabled:opacity-40 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-gray-700 dark:text-gray-300">
          {meta.current_page} / {meta.last_page}
        </span>
        <button
          disabled={meta.current_page >= meta.last_page}
          onClick={() => onPageChange(meta.current_page + 1)}
          className="rounded-lg border border-gray-300 p-1.5 hover:bg-gray-100 disabled:opacity-40 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
