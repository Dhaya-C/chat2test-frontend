"use client";

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import { InputPanel } from '@/components/testing/InputPanel';
import { OutputPanel } from '@/components/testing/OutputPanel';
import { TestingHeader } from '@/components/testing/TestingHeader';
import {
  useTestingSession,
  useTestingResponses,
  useTestingSubmit
} from '@/hooks';

export default function TestingPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = parseInt(params.id as string);
  const chatId = searchParams.get('chatId');

  // Load session details (chat title, project name, auto-redirect if test cases ready)
  const { loading, projectName, chatTitle } = useTestingSession(chatId, projectId);

  // Manage responses state
  const { responses, addResponse, addErrorResponse, setFormattedResponses } = useTestingResponses();

  // Handle message submission (both initial and follow-up)
  const { isProcessing, inputPanelRef, submitMessage } = useTestingSubmit(
    chatId,
    projectId,
    responses,
    addResponse,
    addErrorResponse
  );

  const handleBackToProjects = () => {
    router.push('/dashboard/projects');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading testing session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <TestingHeader
        projectId={projectId}
        projectName={projectName}
        chatTitle={chatTitle}
        onBack={handleBackToProjects}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
        {/* Input Panel */}
        <div className="w-full md:w-1/2 p-3 md:p-4 lg:p-6 flex flex-col overflow-hidden">
          <InputPanel
            ref={inputPanelRef}
            onSubmit={submitMessage}
            isProcessing={isProcessing}
            disabled={false}
            isFollowUp={responses.length > 0}
          />
        </div>

        {/* Output Panel */}
        <div className="w-full md:w-1/2 p-3 md:p-4 lg:p-6 flex flex-col overflow-hidden border-t md:border-t-0 md:border-l border-border">
          <OutputPanel
            responses={responses}
            isProcessing={isProcessing}
          />
        </div>
      </div>
    </div>
  );
}