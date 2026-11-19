import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '@/lib/api';
import { ChartData, Summary, Transaction } from '@/types';

export default function useDashboard(chartDays: number) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(() => {
    return Promise.all([
      api.get('/dashboard/summary'),
      api.get('/dashboard/chart', { params: { days: chartDays } }),
      api.get('/transactions', { params: { limit: 8 } }),
    ])
      .then(([summaryResponse, chartResponse, transactionResponse]) => {
        setSummary(summaryResponse.data.data);
        setChartData(chartResponse.data.data);
        setTransactions(transactionResponse.data.data);
      })
      .catch((error) => toast.error(getErrorMessage(error), { id: 'dashboard-error' }))
      .finally(() => setLoading(false));
  }, [chartDays]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return { summary, chartData, transactions, loading, fetchDashboard };
}
