"use client";

import React, { Fragment } from 'react';
import { CheckCircle, AlertCircle, ChevronDown, ChevronRight, Send, Trash2, Play, Circle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { TraceDownloadButton } from './TraceDownloadButton';
import type { TestCase } from '@/hooks/useTestCases';

interface TestCasesTableProps {
  testCases: TestCase[];
  selectedCases: Set<string>;
  expandedRows: Set<string>;
  commentInputs: Record<string, string>;
  isAllSelected: boolean;
  chatId?: string;
  onSelectAll: () => void;
  onSelectCase: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onCommentChange: (id: string, value: string) => void;
  onAddComment: (id: string) => void;
  onDelete: () => void;
  onExecute: () => void;
  onSendToJira: () => void;
}

export function TestCasesTable({
  testCases,
  selectedCases,
  expandedRows,
  commentInputs,
  isAllSelected,
  chatId,
  onSelectAll,
  onSelectCase,
  onToggleExpand,
  onCommentChange,
  onAddComment,
  onDelete,
  onExecute,
  onSendToJira
}: TestCasesTableProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pass':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'fail':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'new':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pass': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'fail': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <Play className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="w-12 p-3 text-left">
              <Checkbox
                checked={isAllSelected && testCases.length > 0}
                onCheckedChange={onSelectAll}
              />
            </th>
            <th className="w-8 p-3"></th>
            <th className="p-3 text-left font-semibold">Test Case ID</th>
            <th className="p-3 text-left font-semibold min-w-[200px]">Title</th>
            <th className="p-3 text-left font-semibold">Module</th>
            <th className="p-3 text-left font-semibold">Priority</th>
            <th className="p-3 text-left font-semibold">Status</th>
            <th className="p-3 text-left font-semibold">Trace</th>
          </tr>
        </thead>
        <tbody>
          {testCases.map((testCase) => {
            const isSelected = selectedCases.has(testCase.test_case_id);
            const isExpanded = expandedRows.has(testCase.test_case_id);

            return (
              <Fragment key={testCase.test_case_id}>
                <tr className={`border-t hover:bg-muted/30 ${isSelected ? 'bg-primary/5' : ''}`}>
                  <td className="p-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onSelectCase(testCase.test_case_id)}
                    />
                  </td>
                  <td className="p-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleExpand(testCase.test_case_id)}
                      className="h-6 w-6 p-0"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </td>
                  <td className="p-3 font-mono text-sm">{testCase.test_case_id}</td>
                  <td className="p-3 font-medium">{testCase.title}</td>
                  <td className="p-3 text-sm">{testCase.module_feature || '-'}</td>
                  <td className="p-3">
                    <Badge variant="outline" className={getPriorityColor(testCase.priority)}>
                      {testCase.priority}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <Badge variant="outline" className={getStatusColor(testCase.status)}>
                      {testCase.status}
                    </Badge>
                  </td>
                  <td className="p-3">
                    {chatId && testCase.test_case_unique_id ? (
                      <TraceDownloadButton chatId={chatId} testCaseUniqueId={testCase.test_case_unique_id} />
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </td>
                </tr>
                {isExpanded && (
                  <tr className="bg-muted/20">
                    <td colSpan={8} className="p-4 border-t">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {testCase.preconditions && (
                          <div>
                            <strong className="text-muted-foreground">Preconditions:</strong>
                            <p className="mt-1">{testCase.preconditions}</p>
                          </div>
                        )}
                        {testCase.test_steps && testCase.test_steps.length > 0 && (
                          <div>
                            <strong className="text-muted-foreground">Test Steps:</strong>
                            <div className="mt-1 space-y-2">
                              {testCase.test_steps.map((step, index) => (
                                <div key={index} className="flex items-start gap-2 text-sm">
                                  <span className="font-medium text-muted-foreground min-w-[20px]">
                                    {index + 1}.
                                  </span>
                                  <span>{step}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {testCase.test_data && (
                          <div>
                            <strong className="text-muted-foreground">Test Data:</strong>
                            <p className="mt-1">{testCase.test_data}</p>
                          </div>
                        )}
                        <div>
                          <strong className="text-muted-foreground">Expected Result:</strong>
                          <p className="mt-1">{testCase.expected_result}</p>
                        </div>
                        {testCase.actual_result && (
                          <div>
                            <strong className="text-muted-foreground">Actual Result:</strong>
                            <p className="mt-1">{testCase.actual_result}</p>
                          </div>
                        )}
                        {/* Error log hidden - commented out for now */}
                        {/* {testCase.error_log && (
                          <div className="bg-red-50 border border-red-200 rounded p-3">
                            <h4 className="font-medium text-red-700 mb-2">Error Log</h4>
                            <p className="text-sm text-red-600 font-mono">{testCase.error_log}</p>
                          </div>
                        )} */}
                        <div className="col-span-1 md:col-span-2">
                          <strong className="text-muted-foreground">Comments:</strong>
                          <div className="mt-2 flex items-start gap-2">
                            <Textarea
                              value={commentInputs[testCase.test_case_id] || ''}
                              onChange={(e) => onCommentChange(testCase.test_case_id, e.target.value)}
                              placeholder="Add a comment or request update for this test case"
                              rows={2}
                            />
                            <Button 
                              onClick={() => onAddComment(testCase.test_case_id)}
                              size="sm"
                            >
                              Send
                            </Button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
