'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import useDebounce from '@/hooks/useDebounce';
import useItems from '@/hooks/useItems';
import useDashboard from '@/hooks/useDashboard';
import useRealtime from '@/hooks/useRealtime';
import { Category, Item, ItemFilters, TransactionType, Warehouse } from '@/types';
import Navbar from '@/components/Navbar';
import StatCards from '@/components/StatCards';
import TransactionChart from '@/components/TransactionChart';
import StatusChart from '@/components/StatusChart';
import ItemFilter from '@/components/ItemFilter';
import ItemTable from '@/components/ItemTable';
import Pagination from '@/components/Pagination';
import RecentTransactions from '@/components/RecentTransactions';
import ItemFormModal from '@/components/ItemFormModal';
import TransactionModal from '@/components/TransactionModal';
import DeleteItemModal from '@/components/DeleteItemModal';
import Card from '@/components/ui/Card';

const initialFilters: ItemFilters = {
  search: '',
  status: '',
  warehouse_id: '',
  category_id: '',
  sort_by: 'name',
  sort_order: 'asc',
  page: 1,
  per_page: 10,
};

interface TransactionModalState {
  item: Item | null;
  type: TransactionType;
}

export default function DashboardPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<ItemFilters>(initialFilters);
  const [chartDays, setChartDays] = useState(7);

  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [transactionModal, setTransactionModal] = useState<TransactionModalState | null>(null);
  const [deletingItem, setDeletingItem] = useState<Item | null>(null);

  const debouncedSearch = useDebounce(search);
  const itemQuery = useMemo(() => ({ ...filters, search: debouncedSearch }), [filters, debouncedSearch]);

  const { items, meta, loading: itemsLoading, fetchItems } = useItems(itemQuery);
  const { summary, chartData, transactions, loading: dashboardLoading, fetchDashboard } = useDashboard(chartDays);

  useEffect(() => {
    Promise.all([api.get('/categories'), api.get('/warehouses')]).then(([categoryResponse, warehouseResponse]) => {
      setCategories(categoryResponse.data.data);
      setWarehouses(warehouseResponse.data.data);
    });
  }, []);

  const refreshData = useCallback(() => {
    fetchItems();
    fetchDashboard();
  }, [fetchItems, fetchDashboard]);

  useRealtime(refreshData);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setFilters({ ...filters, page: 1 });
  };

  const handleFilterChange = (name: keyof ItemFilters, value: string) => {
    setFilters({ ...filters, [name]: value, page: 1 });
  };

  const handleSort = (column: string) => {
    const isSameColumn = filters.sort_by === column;

    setFilters({
      ...filters,
      sort_by: column,
      sort_order: isSameColumn && filters.sort_order === 'asc' ? 'desc' : 'asc',
      page: 1,
    });
  };

  const handleResetFilter = () => {
    setSearch('');
    setFilters(initialFilters);
  };

  const handleFilterStatus = (status: string) => {
    setSearch('');
    setFilters({ ...initialFilters, status });
    document.getElementById('inventory')?.scrollIntoView({ behavior: 'smooth' });
  };

  const openCreateForm = () => {
    setEditingItem(null);
    setShowItemForm(true);
  };

  const openEditForm = (item: Item) => {
    setEditingItem(item);
    setShowItemForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar onAddItem={openCreateForm} onAddTransaction={() => setTransactionModal({ item: null, type: 'out' })} />

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Operasional</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Ringkasan aset, stok, dan aktivitas gudang</p>
        </div>

        <StatCards summary={summary} loading={dashboardLoading} onFilterStatus={handleFilterStatus} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="min-w-0 lg:col-span-2">
            <TransactionChart data={chartData} days={chartDays} loading={dashboardLoading} onChangeDays={setChartDays} />
          </div>
          <StatusChart summary={summary} loading={dashboardLoading} />
        </div>

        <div id="inventory" className="min-w-0 scroll-mt-20">
          <Card title="Data Barang" description="Daftar aset dan stok operasional di semua gudang">
            <ItemFilter
              search={search}
              filters={filters}
              categories={categories}
              warehouses={warehouses}
              onSearchChange={handleSearchChange}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilter}
            />

            <ItemTable
              items={items}
              loading={itemsLoading}
              filters={filters}
              onSort={handleSort}
              onTransaction={(item, type) => setTransactionModal({ item, type })}
              onEdit={openEditForm}
              onDelete={setDeletingItem}
            />

            {meta && meta.total > 0 && (
              <Pagination meta={meta} onPageChange={(page) => setFilters({ ...filters, page })} />
            )}
          </Card>
        </div>

        <RecentTransactions transactions={transactions} loading={dashboardLoading} />
      </main>

      <AnimatePresence>
        {showItemForm && (
          <ItemFormModal
            key={editingItem?.id ?? 'new'}
            item={editingItem}
            categories={categories}
            warehouses={warehouses}
            onClose={() => setShowItemForm(false)}
            onSaved={() => {
              setShowItemForm(false);
              refreshData();
            }}
          />
        )}

        {transactionModal && (
          <TransactionModal
            key="transaction"
            item={transactionModal.item}
            defaultType={transactionModal.type}
            onClose={() => setTransactionModal(null)}
            onSaved={() => {
              setTransactionModal(null);
              refreshData();
            }}
          />
        )}

        {deletingItem && (
          <DeleteItemModal
            key="delete"
            item={deletingItem}
            onClose={() => setDeletingItem(null)}
            onDeleted={() => {
              setDeletingItem(null);
              refreshData();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
