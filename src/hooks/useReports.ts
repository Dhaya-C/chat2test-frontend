"use client";

import { useState, useCallback, useEffect } from 'react';
import { api } from '@/lib/api';
import { ReportFilter, ReportResponse, UseReportsReturn } from '@/types/reports';
import { useToast } from './useToast';

export function useReports(filters: ReportFilter): UseReportsReturn {
  const [reports, setReports] = useState<ReportResponse['reports']>([]);
  const [kpiSummary, setKpiSummary] = useState<ReportResponse['kpi_summary'] | null>(null);
  const [pagination, setPagination] = useState<ReportResponse['pagination'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post('/reports/get-reports', {
        filters: {
          project_ids: filters.project_ids,
          session_ids: filters.session_ids,
          test_case_status: filters.test_case_status,
          priority: filters.priority,
          modules: filters.modules,
          date_from: filters.date_from,
          date_to: filters.date_to,
          page: filters.page,
          page_size: filters.page_size,
        }
      });

      const data: ReportResponse = response.data;
      setReports(data.reports);
      setKpiSummary(data.kpi_summary);
      setPagination(data.pagination);
    } catch (err: any) {
      console.error('Failed to fetch reports:', err);
      
      // Handle error message extraction
      let errorMsg = 'Failed to fetch reports';
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === 'string') {
          errorMsg = data;
        } else if (data.detail) {
          // Handle both string and array detail
          if (typeof data.detail === 'string') {
            errorMsg = data.detail;
          } else if (Array.isArray(data.detail)) {
            errorMsg = data.detail.map((e: any) => e.msg || JSON.stringify(e)).join(', ');
          } else {
            errorMsg = JSON.stringify(data.detail);
          }
        } else if (data.message) {
          errorMsg = data.message;
        }
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
      toast.error(errorMsg);
      setReports([]);
      setKpiSummary(null);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [
    filters.project_ids,
    filters.session_ids,
    filters.test_case_status,
    filters.priority,
    filters.modules,
    filters.date_from,
    filters.date_to,
    filters.page,
    filters.page_size,
    toast,
  ]);

  // Auto-load data on page mount (initial load)
  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty - only run on initial mount

  // Manual refetch - called when user clicks Apply Filters or changes page
  const refetch = useCallback(async () => {
    await fetchReports();
  }, [fetchReports]);

  return {
    reports,
    kpiSummary,
    pagination,
    loading,
    error,
    refetch,
  };
}
