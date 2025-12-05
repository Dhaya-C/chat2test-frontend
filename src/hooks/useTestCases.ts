"use client";

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useToast } from './useToast';
import { TestCase } from '@/types/chat';

// Re-export for backward compatibility
export type { TestCase };

interface TestCaseResponse {
  test_cases: TestCase[];
  total: number;
}

export function useTestCases(chatId: string | null, page: number, pageSize: number) {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const toast = useToast();

  const loadTestCases = useCallback(async () => {
    if (!chatId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await api.get<TestCaseResponse>(
        `/chat/${chatId}/test-cases?page=${page}&page_size=${pageSize}`
      );
      setTestCases(response.data.test_cases);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Failed to load test cases:', error);
      toast.error('Failed to load test cases');
    } finally {
      setLoading(false);
    }
  }, [chatId, page, pageSize, toast]);

  useEffect(() => {
    loadTestCases();
  }, [loadTestCases]);

  const deleteTestCases = useCallback(async (testCaseIds: string[], selectedTestCases: TestCase[]) => {
    if (!chatId) return false;

    try {
      const test_case_unique_ids = selectedTestCases.map(tc => tc.test_case_unique_id || tc.test_case_id);
      await api.delete(`/chat/${chatId}/test-cases`, {
        data: { test_case_unique_ids }
      });
      toast.success(`Successfully deleted ${selectedTestCases.length} test case(s)`);
      return true;
    } catch (error: any) {
      console.error('Failed to delete test cases:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete test cases');
      return false;
    }
  }, [chatId, toast]);

  const addComment = useCallback(async (testCaseId: string, testCase: TestCase, comment: string, projectId: string | string[]) => {
    if (!chatId || !comment.trim()) {
      toast.info('Comment cannot be empty');
      return false;
    }

    try {
      const payload = {
        chat_id: chatId.toString(),
        project_id: (projectId || '').toString(),
        test_case_id: testCaseId,
        test_case_unique_id: testCase.test_case_unique_id || testCaseId,
        comments: comment
      };

      const res = await api.post('/chat/update_test_case', payload);
      const updated = res.data;
      setTestCases(prev => prev.map(tc => tc.test_case_id === updated.test_case_id ? updated : tc));
      toast.success('Comment added');
      return true;
    } catch (err: any) {
      console.error('Failed to add comment', err);
      toast.error('Failed to add comment');
      return false;
    }
  }, [chatId, toast]);

  return {
    testCases,
    loading,
    total,
    loadTestCases,
    deleteTestCases,
    addComment,
    setTestCases
  };
}
