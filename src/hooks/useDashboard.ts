"use client";

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { DashboardStats } from '@/types/dashboard';

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (err: any) {
      console.error('Failed to fetch dashboard stats:', err);
      setError(err.message || 'Failed to fetch dashboard stats');
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}
