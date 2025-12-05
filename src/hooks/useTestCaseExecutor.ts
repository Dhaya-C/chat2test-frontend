"use client";

import { useCallback, useState } from 'react';
import { api } from '@/lib/api';
import { useToast } from './useToast';
import type { TestCase } from './useTestCases';

export function useTestCaseExecutor() {
  const toast = useToast();
  const [isExecuting, setIsExecuting] = useState(false);

  const executeSelectedTestCases = useCallback(
    async (
      selectedTestCases: TestCase[],
      chatId: string | null,
      projectId: string | string[]
    ) => {
      if (!selectedTestCases.length) {
        toast.info('Please select test cases to execute');
        return false;
      }

      if (!chatId) {
        toast.error('Chat session not found');
        return false;
      }

      try {
        setIsExecuting(true);
        const payload = {
          project_id: projectId.toString(),
          chat_id: chatId.toString(),
          test_case_ids: selectedTestCases.map(tc => tc.test_case_unique_id || tc.test_case_id)
        };

        await api.post('/automation/execute-from-mongo', payload);
        toast.success(`Executing ${selectedTestCases.length} test case(s)`);
        return true;
      } catch (error: any) {
        console.error('Failed to execute test cases:', error);
        toast.error(error.response?.data?.detail || 'Failed to execute test cases');
        return false;
      } finally {
        setIsExecuting(false);
      }
    },
    [toast]
  );

  return { executeSelectedTestCases, isExecuting };
}
