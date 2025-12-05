"use client";

import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { SessionTestCasesResponse, UseSessionTestCasesReturn } from '@/types/reports';
import { useToast } from './useToast';

export function useSessionTestCases(
  sessionId: string | null,
  page: number = 1,
  pageSize: number = 20
): UseSessionTestCasesReturn {
  const [testCases, setTestCases] = useState<SessionTestCasesResponse['test_cases']>([]);
  const [sessionInfo, setSessionInfo] = useState<SessionTestCasesResponse['session_info'] | null>(null);
  const [pagination, setPagination] = useState<SessionTestCasesResponse['pagination'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const fetchSessionTestCases = useCallback(async () => {
    if (!sessionId) {
      setTestCases([]);
      setSessionInfo(null);
      setPagination(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await api.get(
        `/reports/sessions/${sessionId}/test-cases`,
        {
          params: {
            page,
            page_size: pageSize,
          },
        }
      );

      const data: SessionTestCasesResponse = response.data;
      setSessionInfo(data.session_info);
      setTestCases(data.test_cases);
      setPagination(data.pagination);
    } catch (err: any) {
      console.error('Failed to fetch session test cases:', err);
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to fetch test cases';
      setError(errorMsg);
      toast.error(errorMsg);
      setTestCases([]);
      setSessionInfo(null);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [sessionId, page, pageSize, toast]);

  const refetch = useCallback(async () => {
    await fetchSessionTestCases();
  }, [fetchSessionTestCases]);

  return {
    testCases,
    sessionInfo,
    pagination,
    loading,
    error,
    refetch,
  };
}
