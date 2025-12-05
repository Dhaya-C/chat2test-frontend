"use client";

import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useToast } from './useToast';
import type { TestCase } from './useTestCases';

export function useTestCaseExporter() {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const exportTestCases = useCallback(async (selectedTestCases: TestCase[]) => {
    // Validate selection
    if (!selectedTestCases || selectedTestCases.length === 0) {
      toast.error('Please select test cases to export');
      return;
    }

    setLoading(true);
    try {
      // Extract unique IDs
      const test_case_unique_ids = selectedTestCases.map(
        tc => tc.test_case_unique_id || tc.test_case_id
      );

      // POST to API with responseType: 'blob'
      const response = await api.post(
        '/chat/testcase-exporter',
        { test_case_unique_ids },
        { responseType: 'blob' }
      );

      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'testcases_export.csv';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+?)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create blob and download
      const blob = new Blob([response.data], { type: 'text/csv; charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`Exported ${selectedTestCases.length} test case(s)`);
    } catch (error: any) {
      console.error('Failed to export test cases:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to export test cases';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return { exportTestCases, loading };
}
