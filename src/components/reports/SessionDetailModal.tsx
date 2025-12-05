"use client";

import React, { useEffect } from 'react';
import { SessionInfo, ReportTestCase, PaginationInfo } from '@/types/reports';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Download } from 'lucide-react';

interface SessionDetailModalProps {
  isOpen: boolean;
  sessionInfo: SessionInfo | null;
  testCases: ReportTestCase[];
  pagination: PaginationInfo | null;
  loading?: boolean;
  onClose: () => void;
  onPageChange?: (page: number) => Promise<void>;
  onDownloadTrace?: (traceUrl: string, testCaseTitle: string) => void;
}

export function SessionDetailModal({
  isOpen,
  sessionInfo,
  testCases,
  pagination,
  loading = false,
  onClose,
  onPageChange,
  onDownloadTrace,
}: SessionDetailModalProps) {
  const [isChangingPage, setIsChangingPage] = React.useState(false);

  // Handle page change in modal
  const handlePageChange = async (page: number) => {
    if (onPageChange) {
      setIsChangingPage(true);
      try {
        await onPageChange(page);
      } finally {
        setIsChangingPage(false);
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pass':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'fail':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case 'new':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {sessionInfo?.session_name || 'Session Details'}
          </DialogTitle>
          <DialogDescription>
            <div className="flex gap-4 mt-2 text-xs">
              <span className="text-muted-foreground">
                Project: <span className="font-semibold text-foreground">{sessionInfo?.project_name}</span>
              </span>
              <span className="text-muted-foreground">
                Date: <span className="font-semibold text-foreground">
                  {sessionInfo?.created_at
                    ? new Date(sessionInfo.created_at).toLocaleDateString()
                    : '-'}
                </span>
              </span>
              <span className="text-muted-foreground">
                Total Test Cases: <span className="font-semibold text-foreground">{sessionInfo?.total_test_cases}</span>
              </span>
            </div>
          </DialogDescription>
        </DialogHeader>

        {/* Test Cases Table */}
        <div className="mt-6">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-10 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : testCases.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground font-medium mb-1">No test cases found</p>
              <p className="text-xs text-muted-foreground">This session has no test cases to display</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto border border-border rounded-lg">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="text-left p-2 font-semibold">ID</th>
                      <th className="text-left p-2 font-semibold">Title</th>
                      <th className="text-left p-2 font-semibold">Module</th>
                      <th className="text-center p-2 font-semibold">Priority</th>
                      <th className="text-center p-2 font-semibold">Status</th>
                      <th className="text-left p-2 font-semibold">Expected</th>
                      <th className="text-left p-2 font-semibold">Actual</th>
                      <th className="text-center p-2 font-semibold">Time (s)</th>
                      <th className="text-center p-2 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testCases.map((testCase, index) => (
                      <tr key={testCase.test_case_id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="p-2 font-mono text-muted-foreground">{testCase.test_case_id.slice(0, 8)}</td>
                        <td className="p-2">
                          <span className="line-clamp-2 font-medium text-foreground">
                            {testCase.title}
                          </span>
                        </td>
                        <td className="p-2 text-muted-foreground">{testCase.module}</td>
                        <td className="p-2 text-center">
                          <Badge className={getPriorityColor(testCase.priority)}>
                            {testCase.priority}
                          </Badge>
                        </td>
                        <td className="p-2 text-center">
                          <Badge className={getStatusColor(testCase.status)}>
                            {testCase.status}
                          </Badge>
                        </td>
                        <td className="p-2 text-muted-foreground">
                          <span className="line-clamp-1 text-xs">{testCase.expected_result}</span>
                        </td>
                        <td className="p-2 text-muted-foreground">
                          <span className="line-clamp-1 text-xs">{testCase.actual_result}</span>
                        </td>
                        <td className="p-2 text-center text-muted-foreground">
                          {testCase.execution_time_seconds?.toFixed(2) || '-'}
                        </td>
                        <td className="p-2 text-center">
                          {testCase.trace_available && onDownloadTrace && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                onDownloadTrace(testCase.trace_url, testCase.title)
                              }
                              className="h-6 w-6 p-0"
                              title="Download trace"
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Modal Pagination */}
              {pagination && (
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Page {pagination.current_page} of {pagination.total_pages} ({pagination.total_records} total)
                  </span>
                  <div className="flex gap-1">
                    <Button
                      onClick={() => handlePageChange(pagination.current_page - 1)}
                      disabled={!pagination.has_prev || loading || isChangingPage}
                      variant="outline"
                      size="sm"
                      className="h-7 px-2"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => handlePageChange(pagination.current_page + 1)}
                      disabled={!pagination.has_next || loading || isChangingPage}
                      variant="outline"
                      size="sm"
                      className="h-7 px-2"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
