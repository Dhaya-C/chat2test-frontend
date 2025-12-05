"use client";

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { shouldRedirectToTestCases } from '@/lib/redirect-utils';
import type { TestingResponse } from './useTestingResponses';

export interface InputPanelRef {
  clearInputs: () => void;
}

export function useTestingSubmit(
  chatId: string | null,
  projectId: number,
  responses: TestingResponse[],
  onResponseAdded: (response: TestingResponse) => void,
  onErrorAdded: (message: string) => void
) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const inputPanelRef = useRef<InputPanelRef>(null);

  const isInitialSubmission = responses.length === 0;

  const handleAutoRedirect = useCallback((message: any) => {
    // Check for test case generation - auto redirect
    if (shouldRedirectToTestCases(message)) {
      setTimeout(() => {
        router.push(`/dashboard/projects/${projectId}/test-cases?chatId=${chatId}`);
      }, 2000); // Give user time to see the response
    }
  }, [chatId, projectId, router]);

  const formatAndAddResponse = useCallback((message: any) => {
    const formattedResponse: TestingResponse = {
      id: message.id,
      type: 'ai',
      content: message.content,
      timestamp: message.timestamp,
      invoke_type: message.invoke_type,
      test_case: message.test_case,
      files: message.file_name ? [{
        name: message.file_name,
        type: message.file_type,
        url: message.file_url
      }] : []
    };
    onResponseAdded(formattedResponse);
    handleAutoRedirect(message);
  }, [onResponseAdded, handleAutoRedirect]);

  const submitMessage = useCallback(async (input: { text?: string; files?: File[] }) => {
    if (!chatId) {
      onErrorAdded('Chat session not found');
      return;
    }

    setIsProcessing(true);
    try {
      // Create FormData for file upload
      const formData = new FormData();
      const invokeType = isInitialSubmission ? 'new' : 'resume';
      formData.append('invoke_type', invokeType);

      if (input.text) {
        formData.append('content', input.text);
      }

      if (input.files && input.files.length > 0) {
        input.files.forEach((file) => {
          formData.append('files', file);
        });
      }

      // Send message via chat API
      const response = await api.post(
        `/chat/${chatId}/send-message?invoke_type=${invokeType}`,
        formData,
        {
          headers: {
            'Content-Type': undefined, // Let browser set proper multipart boundary
          },
        }
      );

      const newMessage = response.data;
      formatAndAddResponse(newMessage);

      // Clear input fields after successful submission
      inputPanelRef.current?.clearInputs();

    } catch (error) {
      console.error('Failed to submit message:', error);
      onErrorAdded(
        isInitialSubmission
          ? 'Failed to start testing. Please try again.'
          : 'Failed to send follow-up message. Please try again.'
      );
    } finally {
      setIsProcessing(false);
    }
  }, [chatId, isInitialSubmission, onResponseAdded, onErrorAdded, formatAndAddResponse]);

  return {
    isProcessing,
    inputPanelRef,
    submitMessage,
    isInitialSubmission
  };
}
