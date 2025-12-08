"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '@/lib/api';
import { FilterOptions, UseReportFiltersReturn } from '@/types/reports';

// Utility function to capitalize first letter (backend 'new' -> UI 'New')
const capitalizeStatus = (status: string): string => {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

export function useReportFilters(): UseReportFiltersReturn {
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProjectIds, setSelectedProjectIds] = useState<number[] | null>(null);

  const fetchFilterOptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/reports/filter-options');
      console.log('Filter options response:', response.data);
      
      // Transform statuses from backend (lowercase) to UI format (capitalized)
      const transformedData = {
        ...response.data,
        statuses: response.data.statuses?.map((status: string) => capitalizeStatus(status)) || [],
      };
      
      setFilterOptions(transformedData);
    } catch (err: any) {
      console.error('Failed to fetch filter options:', err);
      setError(err.message || 'Failed to fetch filter options');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  // Cascade: Filter sessions based on selected projects
  const filteredSessions = useMemo(() => {
    if (!filterOptions || !selectedProjectIds || selectedProjectIds.length === 0) {
      return filterOptions?.sessions || [];
    }
    return filterOptions.sessions.filter(session =>
      selectedProjectIds.includes(session.project_id)
    );
  }, [filterOptions, selectedProjectIds]);

  // Callback to update selected projects and trigger cascade
  const updateSelectedProjects = useCallback((projectIds: number[] | null) => {
    setSelectedProjectIds(projectIds);
  }, []);

  return {
    filterOptions,
    filteredSessions,
    loading,
    error,
    updateSelectedProjects,
  };
}
