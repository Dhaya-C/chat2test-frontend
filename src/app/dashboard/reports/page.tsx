"use client";

import React, { useState, useCallback } from 'react';
import { useReportFilters, useReports, useSessionTestCases } from '@/hooks';
import { ReportFilter } from '@/types/reports';
import {
  ReportHeader,
  ReportFilterPanel,
  ReportKPISummary,
  ReportTable,
  ReportPagination,
  SessionDetailModal,
  ReportExportButton,
  ReportErrorBoundary,
  FilterPanelSkeleton,
  KPISummarySkeleton,
  ReportTableSkeleton,
  PaginationSkeleton,
  NoReportsEmptyState,
  NoTestCasesEmptyState,
} from '@/components/reports';
import { useToast } from '@/hooks';
import { api } from '@/lib/api';

// Get today's date and 30 days ago for default date range (ISO 8601 format)
const getTodayDate = () => {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date.toISOString();
};
const get30DaysAgoDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
};

export default function ReportsPage() {
  // Hooks
  const { filterOptions, filteredSessions, loading: filterLoading, error: filterError } = useReportFilters();
  const toast = useToast();

  // State for filters
  const [filters, setFilters] = useState<ReportFilter>({
    project_ids: null,
    session_ids: null,
    test_case_status: null,
    priority: null,
    modules: null,
    date_from: get30DaysAgoDate(),
    date_to: getTodayDate(),
    page: 1,
    page_size: 10,
  });

  // State for selected session (for modal)
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [modalPage, setModalPage] = useState(1);

  // Fetch reports with current filters (manual refetch only)
  const { reports, kpiSummary, pagination, loading: reportsLoading, error: reportsError, refetch: refetchReports } = useReports(filters);

  // Fetch session test cases for modal
  const {
    testCases,
    sessionInfo,
    pagination: modalPagination,
    loading: modalLoading,
    error: modalError,
    refetch: refetchModalData,
  } = useSessionTestCases(isDetailModalOpen ? selectedSessionId : null, modalPage);

  // Handle Apply Filters button click - now receives the complete filters to apply
  const handleApplyFilters = useCallback(async (filtersToApply: ReportFilter) => {
    // Update filters state with the new filters
    setFilters(filtersToApply);
    
    console.log('Applying filters:', filtersToApply);
    
    // Manually fetch with the new filters (can't rely on refetchReports as it uses stale state)
    try {
      const response = await api.post('/reports/get-reports', { filters: filtersToApply });
      console.log('Reports response:', response.data);
      // Trigger a refetch after state update to sync everything
      setTimeout(() => refetchReports(), 100);
    } catch (err: any) {
      console.error('Failed to apply filters:', err);
      console.error('Error response:', err.response?.data);
      
      // Handle error message extraction
      let errorMsg = 'Failed to apply filters';
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
      
      toast.error(errorMsg);
    }
  }, [refetchReports, toast]);

  // Handle Reset Filters button click
  const handleResetFilters = useCallback(() => {
    setFilters({
      project_ids: null,
      session_ids: null,
      test_case_status: null,
      priority: null,
      modules: null,
      date_from: get30DaysAgoDate(),
      date_to: getTodayDate(),
      page: 1,
      page_size: 10,
    });
  }, []);

  // Handle pagination
  const handlePageChange = useCallback(async (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
    await refetchReports();
  }, [refetchReports]);

  // Handle modal page change
  const handleModalPageChange = useCallback(async (newPage: number) => {
    setModalPage(newPage);
    await refetchModalData();
  }, [refetchModalData]);

  // Handle View Tests button
  const handleViewSessionTests = useCallback((sessionId: string) => {
    setSelectedSessionId(sessionId);
    setModalPage(1);
    setIsDetailModalOpen(true);
  }, []);

  // Handle modal close
  const handleCloseModal = useCallback(() => {
    setIsDetailModalOpen(false);
    setSelectedSessionId(null);
    setModalPage(1);
  }, []);

  // Handle download trace
  const handleDownloadTrace = useCallback(
    async (traceUrl: string, testCaseTitle: string) => {
      try {
        const response = await api.get(traceUrl, {
          responseType: 'blob',
        });

        // Extract filename from response headers or use default
        const contentDisposition = response.headers['content-disposition'];
        let filename = `trace_${new Date().getTime()}.webm`;

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
        const errorMsg =
          error.response?.data?.detail || 'Failed to download trace. No trace data available.';
        toast.error(errorMsg);
      }
    },
    [toast]
  );

  return (
    <div className="p-6 space-y-6">
      {/* Report Header */}
      <ReportHeader title="Reports" subtitle="View and manage your test reports" />

      {/* Filter Error */}
      {filterError && (
        <ReportErrorBoundary error={filterError} />
      )}

      {/* Reports Error */}
      {reportsError && (
        <ReportErrorBoundary error={reportsError} onRetry={refetchReports} />
      )}

      {/* Report Filter Panel */}
      {filterLoading ? (
        <FilterPanelSkeleton />
      ) : (
        <ReportFilterPanel
          filterOptions={filterOptions}
          filteredSessions={filteredSessions}
          currentFilters={filters}
          onApplyFilters={handleApplyFilters}
          onResetFilters={handleResetFilters}
          loading={reportsLoading}
          filterLoading={filterLoading}
        />
      )}

      {/* Export Button */}
      <div className="flex justify-end">
        <ReportExportButton filters={filters} disabled={reportsLoading} />
      </div>

      {/* Report KPI Summary */}
      {reportsLoading ? (
        <KPISummarySkeleton />
      ) : (
        <ReportKPISummary kpiSummary={kpiSummary} loading={false} />
      )}

      {/* Report Table */}
      {reportsLoading ? (
        <ReportTableSkeleton />
      ) : reports && reports.length > 0 ? (
        <ReportTable
          reports={reports}
          loading={false}
          onViewTests={handleViewSessionTests}
        />
      ) : (
        <NoReportsEmptyState onReset={handleResetFilters} />
      )}

      {/* Report Pagination */}
      {reportsLoading ? (
        <PaginationSkeleton />
      ) : pagination && reports.length > 0 ? (
        <ReportPagination
          pagination={pagination}
          loading={false}
          onPageChange={handlePageChange}
        />
      ) : null}

      {/* Session Detail Modal */}
      <SessionDetailModal
        isOpen={isDetailModalOpen}
        sessionInfo={sessionInfo}
        testCases={testCases}
        pagination={modalPagination}
        loading={modalLoading}
        onClose={handleCloseModal}
        onPageChange={handleModalPageChange}
        onDownloadTrace={handleDownloadTrace}
      />

      {/* Modal Error */}
      {isDetailModalOpen && modalError && (
        <ReportErrorBoundary error={modalError} onRetry={refetchModalData} />
      )}
    </div>
  );
}