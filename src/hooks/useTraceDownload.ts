"use client";

import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useToast } from './useToast';

export function useTraceDownload() {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const downloadTrace = useCallback(async (chatId: string, testCaseUniqueId: string) => {
    if (!chatId || !testCaseUniqueId) {
      toast.error('Missing chat or test case information');
      return;
    }

    setLoading(true);
    try {
      // Fetch the trace file as blob
      const response = await api.get(
        `/chat/${chatId}/test-case/${testCaseUniqueId}/trace`,
        {
          responseType: 'blob'
        }
      );

      // Extract filename from response headers
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'trace.webm';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+?)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create blob and download
      const blob = new Blob([response.data], { type: 'video/webm' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`Trace downloaded: ${filename}`);
    } catch (error: any) {
      console.error('Failed to download trace:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to download trace. No trace data available for this test case.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return { downloadTrace, loading };
}
