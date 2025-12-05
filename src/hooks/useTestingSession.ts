"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { shouldRedirectFromMessages } from '@/lib/redirect-utils';

export function useTestingSession(chatId: string | null, projectId: number) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [projectName, setProjectName] = useState<string>('');
  const [chatTitle, setChatTitle] = useState<string>('');

  const loadChatDetails = useCallback(async () => {
    if (!chatId) return;
    try {
      const response = await api.get(`/chat/${chatId}/details`);
      setChatTitle(response.data.chat_title);
      setProjectName(response.data.project_name);
    } catch (error) {
      console.error('Failed to load chat details:', error);
    }
  }, [chatId]);

  const loadChatHistory = useCallback(async () => {
    if (!chatId) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get(`/chat/${chatId}/messages`);
      const messages = response.data;

      // Check if last message has test cases - auto redirect
      if (shouldRedirectFromMessages(messages)) {
        router.push(`/dashboard/projects/${projectId}/test-cases?chatId=${chatId}`);
        return;
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    } finally {
      setLoading(false);
    }
  }, [chatId, projectId, router]);

  useEffect(() => {
    const loadData = async () => {
      await loadChatDetails();
      await loadChatHistory();
    };
    loadData();
  }, [loadChatDetails, loadChatHistory]);

  return {
    loading,
    projectName,
    chatTitle,
    loadChatDetails,
    loadChatHistory
  };
}
