"use client";

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { ReportFilter } from '@/types/reports';
import { useToast } from '@/hooks/useToast';
import { api } from '@/lib/api';
import { Download, FileJson } from 'lucide-react';

interface ReportExportButtonProps {
  filters: ReportFilter;
  disabled?: boolean;
}

export function ReportExportButton({ filters, disabled = false }: ReportExportButtonProps) {
  const [loadingCsv, setLoadingCsv] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const toast = useToast();

  const exportReport = useCallback(
    async (format: 'csv' | 'pdf') => {
      try {
        const setLoading = format === 'csv' ? setLoadingCsv : setLoadingPdf;
        setLoading(true);

        const response = await api.post(
          '/reports/export',
          {
            export_format: format,
            export_type: 'summary', // 'summary' or 'detailed'
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
            },
          },
          {
            responseType: 'blob',
          }
        );

        // Extract filename from Content-Disposition header
        const contentDisposition = response.headers['content-disposition'];
        let filename = `reports_${new Date().toISOString().split('T')[0]}.${format}`;

        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+?)"/);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }

        // Create blob and download
        const blob = new Blob([response.data], {
          type: format === 'csv' ? 'text/csv' : 'application/pdf',
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.success(`Report exported as ${format.toUpperCase()}: ${filename}`);
      } catch (error: any) {
        console.error(`Failed to export report as ${format}:`, error);
        const errorMsg =
          error.response?.data?.detail || `Failed to export report as ${format.toUpperCase()}`;
        toast.error(errorMsg);
      } finally {
        const setLoading = format === 'csv' ? setLoadingCsv : setLoadingPdf;
        setLoading(false);
      }
    },
    [filters, toast]
  );

  return (
    <div className="flex gap-2">
      <Button
        onClick={() => exportReport('csv')}
        disabled={disabled || loadingCsv || loadingPdf}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Download className="h-4 w-4" />
        {loadingCsv ? 'Exporting...' : 'Export CSV'}
      </Button>
      <Button
        onClick={() => exportReport('pdf')}
        disabled={disabled || loadingCsv || loadingPdf}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <FileJson className="h-4 w-4" />
        {loadingPdf ? 'Exporting...' : 'Export PDF'}
      </Button>
    </div>
  );
}
