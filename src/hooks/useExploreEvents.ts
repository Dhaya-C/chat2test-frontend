import { useEffect, useCallback, useState, useRef } from 'react';
import { api } from '@/lib/api';

export interface ExploreEvent {
  type: 'info' | 'success' | 'warning' | 'error' | 'test_case' | 'progress' | 'status_update' | 'exploration_complete' | 'exploration_failed' | 'input_request';
  message?: string;
  data?: Record<string, unknown>;
  index?: number;
  timestamp?: string;
  level?: string;
  // Input request specific fields (nested in data)
  prompt?: string;
  reason?: string;
  page_url?: string;
}

export interface UseExploreEventsReturn {
  events: ExploreEvent[];
  isStreaming: boolean;
  error: string | null;
  startStreaming: (projectId: string, chatId: string, lastIndex?: number) => void;
  stopStreaming: () => void;
  clearEvents: () => void;
  resumeWithInput: (projectId: string, chatId: string, response: string) => Promise<void>;
}

export function useExploreEvents(): UseExploreEventsReturn {
  const [events, setEvents] = useState<ExploreEvent[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const stopStreaming = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const clearEvents = useCallback(() => {
    setEvents([]);
    setError(null);
  }, []);

  const resumeWithInput = useCallback(async (projectId: string, chatId: string, response: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/Chat2Test/v1';
      const resumeUrl = `${baseUrl}/discovery/explore/${projectId}/${chatId}/resume`;
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

      const response_obj = await fetch(resumeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ response }),
      });

      if (!response_obj.ok) {
        throw new Error(`HTTP ${response_obj.status}: ${response_obj.statusText}`);
      }

      // Add a status message to events
      setEvents((prev) => [...prev, {
        type: 'info',
        message: 'Resuming exploration with your input...',
        timestamp: new Date().toISOString(),
      }]);
    } catch (err) {
      console.error('Failed to resume with input:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to resume exploration';
      setError(errorMsg);
    }
  }, []);

  const startStreaming = useCallback((projectId: string, chatId: string, lastIndex: number = -1) => {
    // Stop any existing stream
    stopStreaming();

    setEvents([]);
    setError(null);
    setIsStreaming(true);

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/Chat2Test/v1';
    const eventUrl = `${baseUrl}/discovery/explore/${projectId}/${chatId}/events?last_index=${lastIndex}`;
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

    // Use fetch with streaming instead of EventSource to support auth headers
    const controller = new AbortController();
    
    fetch(eventUrl, {
      headers: {
        'Accept': 'text/event-stream',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error('No response body');
        }

        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            setIsStreaming(false);
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const jsonData = line.slice(6); // Remove 'data: ' prefix
                let event = JSON.parse(jsonData) as any;
                
                // Ensure event has a type field
                // Check if this is an input_request nested in data
                if (event.data && typeof event.data === 'object') {
                  const nestedData = event.data as Record<string, unknown>;
                  
                  if (nestedData.type === 'input_request') {
                    // This is an input request event - extract fields
                    console.log('[useExploreEvents] Detected input_request event:', nestedData);
                    event.type = 'input_request';
                    event.prompt = nestedData.prompt as string | undefined;
                    event.reason = nestedData.reason as string | undefined;
                    event.page_url = nestedData.page_url as string | undefined;
                  }
                }
                
                // If still no type field, infer from level
                if (!event.type && event.level) {
                  const level = event.level as string;
                  event.type = (level.toLowerCase() === 'warning' ? 'warning' :
                               level.toLowerCase() === 'error' ? 'error' :
                               level.toLowerCase() === 'success' ? 'success' :
                               'info') as ExploreEvent['type'];
                }
                
                // Default to 'info' if no type
                if (!event.type) {
                  event.type = 'info';
                }
                
                console.log('[useExploreEvents] Final event type:', event.type, 'Event:', event);
                setEvents((prev) => [...prev, event as ExploreEvent]);
              } catch (parseError) {
                console.error('Failed to parse SSE event:', parseError);
              }
            }
          }
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.error('SSE streaming error:', err);
          const errorMsg = err instanceof Error ? err.message : 'Failed to stream events';
          setError(errorMsg);
        }
        setIsStreaming(false);
      });

    // Store cleanup function
    eventSourceRef.current = { close: () => controller.abort() } as any;
  }, [stopStreaming]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return {
    events,
    isStreaming,
    error,
    startStreaming,
    stopStreaming,
    clearEvents,
    resumeWithInput,
  };
}
