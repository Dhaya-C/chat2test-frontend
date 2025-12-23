"use client";

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

export interface ChatSession {
  id: number;
  title: string;
  project_id: number;
  chat_type?: 'general_chat' | 'test_case_discovery';
  created_at: string;
  updated_at?: string;
}

export function useProjectSessions(projectId: number) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectName, setProjectName] = useState('');

  const loadSessions = useCallback(async () => {
    try {
      const response = await api.get(`/chat/?project_id=${projectId}`);
      setSessions(response.data);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const loadProjectDetails = useCallback(async () => {
    try {
      const response = await api.get(`/projects/${projectId}`);
      setProjectName(response.data.name);
    } catch (error) {
      console.error('Failed to load project details:', error);
    }
  }, [projectId]);

  useEffect(() => {
    loadSessions();
    loadProjectDetails();
  }, [loadSessions, loadProjectDetails]);

  const deleteSession = useCallback(async (chatId: number) => {
    try {
      await api.delete(`/chat/${chatId}`);
      setSessions(prev => prev.filter(session => session.id !== chatId));
      return true;
    } catch (error) {
      console.error('Failed to delete session:', error);
      return false;
    }
  }, []);

  const refreshSessions = useCallback(async () => {
    await loadSessions();
  }, [loadSessions]);

  return {
    sessions,
    loading,
    projectName,
    setSessions,
    loadSessions,
    deleteSession,
    refreshSessions
  };
}
