import { Search, X } from 'lucide-react';
import { Category, ItemFilters, Warehouse } from '@/types';
import { Input, Select } from './ui/FormField';

interface ItemFilterProps {
  search: string;
  filters: ItemFilters;
  categories: Category[];
  warehouses: Warehouse[];
  onSearchChange: (value: string) => void;
  onFilterChange: (name: keyof ItemFilters, value: string) => void;
  onReset: () => void;
}

export default function ItemFilter({
  search,
  filters,
  categories,
  warehouses,
  onSearchChange,
  onFilterChange,
  onReset,
}: ItemFilterProps) {
  const hasFilter = search || filters.status || filters.warehouse_id || filters.category_id;

  return (
    <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <div className="relative lg:col-span-2">
        <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Cari nama atau kode barang..."
          className="pl-9"
        />
      </div>

      <Select value={filters.status} onChange={(event) => onFilterChange('status', event.target.value)}>
        <option value="">Semua Status</option>
        <option value="Available">Available</option>
        <option value="Low Stock">Low Stock</option>
        <option value="Maintenance">Maintenance</option>
      </Select>

      <Select value={filters.warehouse_id} onChange={(event) => onFilterChange('warehouse_id', event.target.value)}>
        <option value="">Semua Gudang</option>
        {warehouses.map((warehouse) => (
          <option key={warehouse.id} value={warehouse.id}>
            {warehouse.name}
          </option>
        ))}
      </Select>

      <div className="flex gap-2">
        <Select value={filters.category_id} onChange={(event) => onFilterChange('category_id', event.target.value)}>
          <option value="">Semua Kategori</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>

        {hasFilter && (
          <button
            onClick={onReset}
            title="Reset filter"
            className="shrink-0 rounded-lg border border-gray-300 px-2 text-gray-500 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
