import { ArrowLeftRight, Boxes, Plus } from 'lucide-react';
import Button from './ui/Button';
import ThemeToggle from './ThemeToggle';

interface NavbarProps {
  onAddItem: () => void;
  onAddTransaction: () => void;
}

export default function Navbar({ onAddItem, onAddTransaction }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-gray-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <Boxes size={20} />
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white">Ops Dashboard</p>
            <p className="hidden text-xs text-gray-500 sm:block">Monitoring aset & stok gudang</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="secondary" onClick={onAddTransaction} className="hidden sm:inline-flex">
            <ArrowLeftRight size={16} />
            Transaksi
          </Button>
          <Button onClick={onAddItem}>
            <Plus size={16} />
            <span className="hidden sm:inline">Tambah Barang</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
