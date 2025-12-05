"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { MessageSquare, Download, TestTube } from 'lucide-react';
import { exportConversation } from '@/lib/file-operations';
import { MarkdownRenderer } from '@/components/shared';
import { TestingResponse } from '@/hooks/useTestingResponses';

interface OutputPanelProps {
  responses: TestingResponse[];
  isProcessing: boolean;
}

export function OutputPanel({ responses, isProcessing }: OutputPanelProps) {
  const handleExportConversation = () => {
    exportConversation(responses);
  };

  const renderResponse = (response: TestingResponse, index: number) => {
    const isAI = response.type === 'ai';
    const isError = response.type === 'error';
    const hasTestCase = response.invoke_type === 'test_case' || response.test_case;
    
    return (
      <div key={response.id || index} className="mb-4 md:mb-6">
        <Card>
          <CardHeader className="pb-2 md:pb-3 p-3 md:p-4 lg:p-6">
            <CardTitle className="flex items-center gap-1.5 md:gap-2 text-sm md:text-base">
              {hasTestCase ? (
                <>
                  <TestTube className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  Test Cases Generated
                </>
              ) : isError ? (
                <>
                  <MessageSquare className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  Error
                </>
              ) : isAI ? (
                <>
                  <MessageSquare className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  AI Response
                </>
              ) : (
                <>
                  <MessageSquare className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  User Message
                </>
              )}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-3 md:p-4 lg:p-6">
            <div className="prose prose-xs sm:prose-sm md:prose-base max-w-none">
              <MarkdownRenderer content={typeof response.content === 'string' ? response.content : JSON.stringify(response.content, null, 2)} />
            </div>
            {response.files && response.files.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-sm font-medium">Attachments:</p>
                {response.files.map((file, idx) => (
                  <a key={idx} href={file.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline block">
                    {file.name}
                  </a>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <Card className="flex flex-col h-full max-h-[600px] md:max-h-none">
        <CardHeader className="flex-shrink-0 p-3 md:p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
            <div>
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <MessageSquare className="w-4 h-4 md:w-5 md:h-5" />
                AI Analysis & Results
              </CardTitle>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                AI will analyze your requirements and generate comprehensive test cases
              </p>
            </div>
            {responses.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportConversation}
                className="flex items-center gap-1.5 text-xs md:text-sm h-8 md:h-9"
              >
                <Download className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Export Chat</span>
                <span className="sm:hidden">Export</span>
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col overflow-hidden p-3 md:p-4 lg:p-6">
          {responses.length === 0 && !isProcessing ? (
            <div className="flex-1 flex items-center justify-center text-center px-4">
              <div className="space-y-3 md:space-y-4">
                <MessageSquare className="mx-auto text-muted-foreground w-10 h-10 md:w-12 md:h-12" />
                <div>
                  <h3 className="text-base md:text-lg font-medium text-muted-foreground">Ready to Analyze</h3>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">
                    Upload your requirements and click "Start Testing" to begin
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-3 md:space-y-4 pr-1 md:pr-2">
              {responses.map((response, index) => renderResponse(response, index))}

              {isProcessing && (
                <Card>
                  <CardContent className="pt-4 md:pt-6 pb-4 md:pb-6">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-2 border-primary border-t-transparent"></div>
                      <span className="text-xs md:text-sm">AI is analyzing your requirements...</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}