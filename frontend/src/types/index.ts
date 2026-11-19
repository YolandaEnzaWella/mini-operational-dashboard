export type ItemStatus = 'Available' | 'Low Stock' | 'Maintenance';

export type TransactionType = 'in' | 'out';

export interface Category {
  id: number;
  name: string;
}

export interface Warehouse {
  id: number;
  name: string;
  city: string;
}

export interface Item {
  id: number;
  code: string;
  name: string;
  category_id: number;
  warehouse_id: number;
  stock: number;
  min_stock: number;
  unit: string;
  status: ItemStatus;
  category_name: string;
  warehouse_name: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: number;
  item_id: number;
  type: TransactionType;
  quantity: number;
  stock_before: number;
  stock_after: number;
  note: string | null;
  created_by: string;
  created_at: string;
  item_code: string;
  item_name: string;
  item_unit: string;
  warehouse_name: string;
}

export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface Summary {
  total_items: number;
  total_stock: number;
  available: number;
  low_stock: number;
  maintenance: number;
  transactions_today: number;
  stock_in_today: number;
  stock_out_today: number;
}

export interface ChartData {
  date: string;
  total_in: number;
  total_out: number;
}

export interface ItemFilters {
  search: string;
  status: string;
  warehouse_id: string;
  category_id: string;
  sort_by: string;
  sort_order: 'asc' | 'desc';
  page: number;
  per_page: number;
}

export type ValidationErrors = Record<string, string[]>;
