"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { NotificationBell } from '@/components/ui/NotificationBell';
import {
  useTestCases,
  useTestCaseExecutor,
  useJiraIntegration,
  useTestCasePagination,
  useTestCaseSelection,
  useTestCaseComments,
  useTestCaseExporter,
  useExploreEvents
} from '@/hooks';
import { useDiscoverySession } from '@/hooks/useDiscoverySession';
import { useTestCasesCount } from '@/hooks/useTestCasesCount';
import { TestCasesTable } from '@/components/testing/TestCasesTable';
import { TestCasesPagination } from '@/components/testing/TestCasesPagination';
import { DiscoveryStatsCards } from '@/components/testing/DiscoveryStatsCards';
import { DiscoveryEventsPanel } from '@/components/testing/DiscoveryEventsPanel';

export default function DiscoveryPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  
  const projectId = params.id as string;
  const chatId = params.chatId as string;

  // Discovery session data
  const { session, metadata, loading: sessionLoading, error: sessionError, refreshMetadata, updateStats, updateStatus } = useDiscoverySession(chatId);

  // Lightweight test cases count (faster than loading full table)
  const { count: testCasesCount, refreshCount } = useTestCasesCount(chatId);

  // SSE Events stream
  const { events, isStreaming, error: eventsError, startStreaming, stopStreaming, resumeWithInput } = useExploreEvents();

  // Events panel visibility
  const [showEventsPanel, setShowEventsPanel] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('discovery-events-panel-visible');
      return saved !== 'false';
    }
    return true;
  });

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Load test cases data
  const { testCases, loading: testCasesLoading, total, loadTestCases, deleteTestCases, addComment } = useTestCases(chatId, page, pageSize);

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
  const isAnyOperationInProgress = testCasesLoading || isExecuting || isSending || isExporting;
  const hasSelectedCases = selectedCases.size > 0;

  // Start SSE streaming on mount
  useEffect(() => {
    if (chatId && projectId) {
      startStreaming(projectId, chatId);
    }

    return () => {
      stopStreaming();
    };
  }, [chatId, projectId, startStreaming, stopStreaming]);

  // Update stats from SSE events
  useEffect(() => {
    events.forEach((event) => {
      if (event.type === 'status_update' && event.data) {
        updateStats({
          pages_explored: event.data.pages_explored as number,
          test_cases_generated: event.data.test_cases_generated as number,
          current_action: event.data.current_action as string,
          progress_percent: event.data.progress_percent as number,
        });
      } else if (event.type === 'exploration_complete') {
        updateStatus('completed');
        if (event.data) {
          updateStats({
            duration_seconds: event.data.duration_seconds as number,
          });
        }
        // Refresh test cases and count on completion
        loadTestCases();
        refreshCount();
      } else if (event.type === 'exploration_failed') {
        updateStatus('failed');
      } else if (event.type === 'test_case') {
        // Refresh test cases and count when new ones are generated
        loadTestCases();
        refreshCount();
      }
    });
  }, [events, updateStats, updateStatus, loadTestCases, refreshCount]);

  // Save panel visibility preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('discovery-events-panel-visible', showEventsPanel.toString());
    }
  }, [showEventsPanel]);

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
    if (!chatId) {
      toast.error('Session information missing');
      return;
    }
    
    const selected = getSelectedTestCases();
    if (selected.length === 0) {
      toast.error('No test cases selected');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selected.length} test case(s)?`)) {
      return;
    }

    const selectedIds = selected.map((tc) => tc.test_case_id);
    const success = await deleteTestCases(selectedIds, selected);
    if (success) {
      clearSelection();
      loadTestCases();
    }
  };

  const handleAddComment = async (testCaseId: string) => {
    if (!chatId || !projectId) {
      toast.error('Session or project information missing');
      return;
    }

    const comment = getCommentInput(testCaseId);
    if (!comment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    const testCase = testCases.find((tc) => tc.test_case_id === testCaseId);
    if (!testCase) {
      toast.error('Test case not found');
      return;
    }

    const success = await addComment(testCaseId, testCase, comment, projectId);
    if (success) {
      clearCommentInput(testCaseId);
    }
  };

  const handleBackToSessions = () => {
    router.push(`/dashboard/projects/${projectId}/sessions`);
  };

  const handleRefresh = () => {
    refreshMetadata();
    loadTestCases();
    refreshCount();
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading discovery session...</p>
        </div>
      </div>
    );
  }

  if (sessionError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">{sessionError}</p>
            <Button onClick={handleBackToSessions} className="mt-4">
              Back to Sessions
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBackToSessions}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sessions
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {session?.title || 'Discovery Session'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {metadata?.config?.url || 'AI Test Discovery'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEventsPanel(!showEventsPanel)}
            >
              {showEventsPanel ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              Events
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isAnyOperationInProgress}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isAnyOperationInProgress ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <NotificationBell />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 pt-6 flex-shrink-0">
        <DiscoveryStatsCards 
          metadata={metadata} 
          isStreaming={isStreaming}
          testCasesCount={testCasesCount}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-0 overflow-hidden px-6 pb-6">
        {/* Test Cases Section */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Card className="flex-1 flex flex-col overflow-hidden">
            <CardContent className="p-6 flex flex-col overflow-hidden flex-1">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Test Cases</h2>
                <div className="flex gap-2">
                  <Button
                    onClick={handleExecuteSelected}
                    disabled={!hasSelectedCases || isAnyOperationInProgress}
                    size="sm"
                  >
                    Execute Selected
                  </Button>
                  <Button
                    onClick={handleExport}
                    disabled={!hasSelectedCases || isExporting}
                    variant="outline"
                    size="sm"
                  >
                    Export
                  </Button>
                  <Button
                    onClick={handleSendToJira}
                    disabled={!hasSelectedCases || isSending}
                    variant="outline"
                    size="sm"
                  >
                    Send to Jira
                  </Button>
                  <Button
                    onClick={handleDeleteSelected}
                    disabled={!hasSelectedCases || isAnyOperationInProgress}
                    variant="destructive"
                    size="sm"
                  >
                    Delete
                  </Button>
                </div>
              </div>

              {/* Loading State */}
              {testCasesLoading && testCases.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">
                      {isStreaming ? 'Discovering test cases...' : 'Loading test cases...'}
                    </p>
                  </div>
                </div>
              ) : testCases.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-muted-foreground mb-2">No test cases yet</p>
                    {isStreaming && (
                      <p className="text-sm text-blue-600 animate-pulse">
                        Discovery in progress...
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {/* Test Cases Table */}
                  <div className="flex-1 overflow-auto">
                    <TestCasesTable
                      testCases={testCases}
                      selectedCases={selectedCases}
                      expandedRows={expandedRows}
                      commentInputs={commentInputs}
                      onSelectCase={selectTestCase}
                      onSelectAll={() => selectAllTestCases()}
                      onToggleExpand={toggleRowExpansion}
                      onCommentChange={setCommentInput}
                      onAddComment={handleAddComment}
                      onDelete={handleDeleteSelected}
                      onExecute={handleExecuteSelected}
                      onSendToJira={handleSendToJira}
                      isAllSelected={isAllSelected}
                      chatId={chatId}
                    />
                  </div>

                  {/* Pagination */}
                  <TestCasesPagination
                    currentPage={page}
                    pageSize={pageSize}
                    total={total}
                    totalPages={totalPages}
                    from={from}
                    to={to}
                    canGoPrev={canGoPrev}
                    canGoNext={canGoNext}
                    pageNumbers={pageNumbers}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Events Panel */}
        {showEventsPanel && (
          <DiscoveryEventsPanel
            events={events}
            isStreaming={isStreaming}
            error={eventsError}
            onClose={() => setShowEventsPanel(false)}
            onInputRequest={(response) => resumeWithInput(projectId, chatId, response)}
          />
        )}
      </div>
    </div>
  );
}
