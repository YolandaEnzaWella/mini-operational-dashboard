import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '@/lib/api';
import { Item, ItemFilters, PaginationMeta } from '@/types';

export default function useItems(filters: ItemFilters) {
  const [items, setItems] = useState<Item[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(() => {
    return api
      .get('/items', { params: filters })
      .then((response) => {
        setItems(response.data.data);
        setMeta(response.data.meta);
      })
      .catch((error) => toast.error(getErrorMessage(error)))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return { items, meta, loading, fetchItems };
}
