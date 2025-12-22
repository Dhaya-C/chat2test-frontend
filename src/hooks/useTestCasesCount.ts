import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';

export interface UseTestCasesCountReturn {
  count: number;
  loading: boolean;
  error: string | null;
  refreshCount: () => Promise<void>;
}

export function useTestCasesCount(chatId: string | number | null): UseTestCasesCountReturn {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCount = useCallback(async () => {
    if (!chatId) {
      setCount(0);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/discovery/test-cases/count', {
        params: { chat_id: chatId }
      });
      setCount(res.data.count || 0);
    } catch (err) {
      console.error('Failed to fetch test cases count:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch count');
      setCount(0);
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  const refreshCount = useCallback(async () => {
    await fetchCount();
  }, [fetchCount]);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  return {
    count,
    loading,
    error,
    refreshCount,
  };
}
