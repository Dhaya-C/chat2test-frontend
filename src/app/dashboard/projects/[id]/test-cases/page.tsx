"use client";

import { useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';
import { NotificationBell } from '@/components/ui/NotificationBell';
import {
  useTestCases,
  useTestCaseExecutor,
  useJiraIntegration,
  useTestCasePagination,
  useTestCaseSelection,
  useTestCaseComments,
  useTestCaseExporter
} from '@/hooks';
import { TestCasesTable } from '@/components/testing/TestCasesTable';
import { TestCasesPagination } from '@/components/testing/TestCasesPagination';

export default function TestCasesPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const projectId = params.id;
  const chatId = searchParams.get('chatId');
  const toast = useToast();

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Load test cases data
  const { testCases, loading, total, loadTestCases, deleteTestCases, addComment } = useTestCases(chatId, page, pageSize);

  // Selection state management
  const { selectedCases, expandedRows, selectTestCase, selectAllTestCases, toggleRowExpansion, getSelectedTestCases, isAllSelected, clearSelection } = useTestCaseSelection(testCases);

  // Comments state
  const { commentInputs, setCommentInput, getCommentInput, clearCommentInput } = useTestCaseComments();

  // Export functionality
  const { exportTestCases, loading: isExporting } = useTestCaseExporter();

  // Operations
  const { executeSelectedTestCases, isExecuting } = useTestCaseExecutor();
  const { sendToJira, isSending } = useJiraIntegration();

  // Pagination helpers
  const { totalPages, pageNumbers, getPageRange, canGoNext, canGoPrev } = useTestCasePagination(total, pageSize, page);
  const { from, to } = getPageRange();

  // Computed state
  const isAnyOperationInProgress = loading || isExecuting || isSending || isExporting;
  const hasSelectedCases = selectedCases.size > 0;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      clearSelection();
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
    clearSelection();
  };

  const handleExport = async () => {
    const selected = getSelectedTestCases();
    await exportTestCases(selected);
  };

  const handleExecuteSelected = async () => {
    if (!chatId || !projectId) {
      toast.error('Session or project information missing');
      return;
    }
    const selected = getSelectedTestCases();
    const success = await executeSelectedTestCases(selected, chatId, projectId);
    if (success) {
      clearSelection();
      loadTestCases();
    }
  };

  const handleSendToJira = async () => {
    if (!chatId || !projectId) {
      toast.error('Session or project information missing');
      return;
    }
    const selected = getSelectedTestCases();
    const success = await sendToJira(selected, chatId, projectId);
    if (success) {
      clearSelection();
    }
  };

  const handleDeleteSelected = async () => {
    const selected = getSelectedTestCases();
    const success = await deleteTestCases(Array.from(selectedCases), selected);
    if (success) {
      clearSelection();
      const remainingOnPage = testCases.length - selected.length;
      if (remainingOnPage === 0 && page > 1) {
        setPage(page - 1);
      } else {
        loadTestCases();
      }
    }
  };

  const handleAddComment = async (testCaseId: string) => {
    const comment = getCommentInput(testCaseId);
    const testCase = testCases.find(tc => tc.test_case_id === testCaseId);
    if (testCase) {
      const success = await addComment(testCaseId, testCase, comment, projectId || '');
      if (success) {
        clearCommentInput(testCaseId);
      }
    }
  };

  if (loading && testCases.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading test cases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-y-auto">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Test Cases</h1>
            <p className="text-muted-foreground">Review and execute generated test cases</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExport} disabled={!hasSelectedCases || isAnyOperationInProgress}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              onClick={handleDeleteSelected}
              disabled={!hasSelectedCases || isAnyOperationInProgress}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              Delete ({selectedCases.size})
            </Button>
            <Button
              variant="outline"
              onClick={handleSendToJira}
              disabled={!hasSelectedCases || isAnyOperationInProgress}
            >
              Send to Jira ({selectedCases.size})
            </Button>
            <Button
              onClick={handleExecuteSelected}
              disabled={!hasSelectedCases || isAnyOperationInProgress}
            >
              Execute Selected ({selectedCases.size})
            </Button>
            <NotificationBell />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {testCases.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Test Cases Found</h3>
              <p className="text-muted-foreground text-center mb-4">
                Test cases could not be loaded. Please go back to the Projects page or start a new testing session.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-foreground">{total}</div>
                  <p className="text-xs text-muted-foreground">Total Test Cases</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-green-600">
                    {testCases.filter(tc => tc.status === 'Pass').length}
                  </div>
                  <p className="text-xs text-muted-foreground">Passed (this page)</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-red-600">
                    {testCases.filter(tc => tc.status === 'Fail').length}
                  </div>
                  <p className="text-xs text-muted-foreground">Failed (this page)</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-gray-600">
                    {testCases.filter(tc => tc.status === 'New').length}
                  </div>
                  <p className="text-xs text-muted-foreground">New (this page)</p>
                </CardContent>
              </Card>
            </div>

            {/* Test Cases Table */}
            <TestCasesTable
              testCases={testCases}
              selectedCases={selectedCases}
              expandedRows={expandedRows}
              commentInputs={commentInputs}
              isAllSelected={isAllSelected}
              chatId={chatId || undefined}
              onSelectAll={selectAllTestCases}
              onSelectCase={selectTestCase}
              onToggleExpand={toggleRowExpansion}
              onCommentChange={setCommentInput}
              onAddComment={handleAddComment}
              onDelete={handleDeleteSelected}
              onExecute={handleExecuteSelected}
              onSendToJira={handleSendToJira}
            />

            {/* Pagination */}
            {total > 0 && (
              <TestCasesPagination
                currentPage={page}
                totalPages={totalPages}
                pageNumbers={pageNumbers}
                canGoPrev={canGoPrev}
                canGoNext={canGoNext}
                from={from}
                to={to}
                total={total}
                pageSize={pageSize}
                pageSizeOptions={[10, 20, 50, 100]}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}