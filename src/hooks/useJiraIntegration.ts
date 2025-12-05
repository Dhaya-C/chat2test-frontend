"use client";

import { useCallback, useState } from 'react';
import { api } from '@/lib/api';
import { useToast } from './useToast';
import type { TestCase } from './useTestCases';

export function useJiraIntegration() {
  const toast = useToast();
  const [isSending, setIsSending] = useState(false);

  const sendToJira = useCallback(
    async (
      selectedTestCases: TestCase[],
      chatId: string | null,
      projectId: string | string[]
    ) => {
      if (!selectedTestCases.length) {
        toast.info('Please select test cases to send to Jira');
        return false;
      }

      // Filter only failed test cases
      const failedTestCases = selectedTestCases.filter(tc => tc.status === 'Fail');
      
      if (!failedTestCases.length) {
        toast.info('Only failed test cases can be sent to Jira');
        return false;
      }

      if (!chatId) {
        toast.error('Chat session not found');
        return false;
      }

      try {
        setIsSending(true);
        
        // Send each failed test case individually
        for (const testCase of failedTestCases) {
          const payload = {
            test_case_unique_id: testCase.test_case_unique_id || testCase.test_case_id,
            project_id: parseInt(projectId.toString())
          };

          await api.post('/chat/jira_integration', payload);
        }

        toast.success(`${failedTestCases.length} failed test case(s) sent to Jira`);
        return true;
      } catch (error: any) {
        console.error('Failed to send to Jira:', error);
        const errorMsg = error.response?.data?.detail || 'Failed to send to Jira';
        toast.error(errorMsg);
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [toast]
  );

  return { sendToJira, isSending };
}
