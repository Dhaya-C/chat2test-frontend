import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';

export interface DiscoveryConfig {
  url: string;
  max_pages: number;
  suggestion?: string;
}

export interface DiscoveryStats {
  pages_explored: number;
  pages_total: number;
  test_cases_generated: number;
  duration_seconds: number;
  current_action?: string;
  progress_percent?: number;
}

export interface DiscoveryMetadata {
  chat_id: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  config: DiscoveryConfig;
  stats: DiscoveryStats;
  started_at: string;
  completed_at: string | null;
  error_message: string | null;
}

export interface DiscoverySession {
  id: number;
  title: string;
  chat_type: string;
  project_id: number;
  metadata?: DiscoveryMetadata;
}

export interface UseDiscoverySessionReturn {
  session: DiscoverySession | null;
  metadata: DiscoveryMetadata | null;
  loading: boolean;
  error: string | null;
  refreshMetadata: () => Promise<void>;
  updateStats: (stats: Partial<DiscoveryStats>) => void;
  updateStatus: (status: DiscoveryMetadata['status']) => void;
}

export function useDiscoverySession(chatId: string | number | null): UseDiscoverySessionReturn {
  const [session, setSession] = useState<DiscoverySession | null>(null);
  const [metadata, setMetadata] = useState<DiscoveryMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSession = useCallback(async () => {
    if (!chatId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Fetch chat details
      const chatRes = await api.get(`/chat/${chatId}`);
      setSession(chatRes.data);

      // Try to fetch discovery metadata (new endpoint)
      try {
        const metadataRes = await api.get(`/discovery/${chatId}/metadata`);
        setMetadata(metadataRes.data);
      } catch (metaErr) {
        // Fallback: construct metadata from chat data if available
        if (chatRes.data.discovery_metadata) {
          setMetadata(chatRes.data.discovery_metadata);
        } else {
          // Default metadata structure
          setMetadata({
            chat_id: typeof chatId === 'string' ? parseInt(chatId) : chatId,
            status: 'pending',
            config: {
              url: '',
              max_pages: 0,
            },
            stats: {
              pages_explored: 0,
              pages_total: 0,
              test_cases_generated: 0,
              duration_seconds: 0,
            },
            started_at: chatRes.data.created_at || new Date().toISOString(),
            completed_at: null,
            error_message: null,
          });
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load discovery session';
      setError(errorMsg);
      console.error('Failed to fetch discovery session:', err);
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  const refreshMetadata = useCallback(async () => {
    await fetchSession();
  }, [fetchSession]);

  const updateStats = useCallback((newStats: Partial<DiscoveryStats>) => {
    setMetadata((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        stats: {
          ...prev.stats,
          ...newStats,
        },
      };
    });
  }, []);

  const updateStatus = useCallback((status: DiscoveryMetadata['status']) => {
    setMetadata((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        status,
        completed_at: status === 'completed' || status === 'failed' ? new Date().toISOString() : prev.completed_at,
      };
    });
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  return {
    session,
    metadata,
    loading,
    error,
    refreshMetadata,
    updateStats,
    updateStatus,
  };
}
