"use client";

import React, { useEffect, useState } from 'react';
import { ExploreEvent, useExploreEvents } from '@/hooks/useExploreEvents';
import { InputRequestModal } from './InputRequestModal';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, Loader } from 'lucide-react';

interface ExploreEventsDisplayProps {
  projectId: string;
  chatId: string;
  autoStart?: boolean;
}

export function ExploreEventsDisplay({ projectId, chatId, autoStart = true }: ExploreEventsDisplayProps) {
  const { events, isStreaming, error, startStreaming, stopStreaming, clearEvents, resumeWithInput } = useExploreEvents();
  const [inputRequestModal, setInputRequestModal] = useState<ExploreEvent | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [displayedInputRequestIndex, setDisplayedInputRequestIndex] = useState<number | null>(null);

  useEffect(() => {
    if (autoStart) {
      startStreaming(projectId, chatId);
    }

    return () => {
      stopStreaming();
    };
  }, [projectId, chatId, autoStart, startStreaming, stopStreaming]);

  // Watch for NEW input_request events
  useEffect(() => {
    // Find the latest input_request event that hasn't been displayed yet
    for (let i = events.length - 1; i >= 0; i--) {
      const event = events[i];
      if (event.type === 'input_request' && i !== displayedInputRequestIndex) {
        setInputRequestModal(event);
        setDisplayedInputRequestIndex(i);
        break;
      }
    }
  }, [events, displayedInputRequestIndex]);

  const getEventIcon = (type: ExploreEvent['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'progress':
        return <Loader className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'test_case':
        return <CheckCircle2 className="w-4 h-4 text-purple-500" />;
      case 'input_request':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getEventBgColor = (type: ExploreEvent['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'progress':
        return 'bg-blue-50 border-blue-200';
      case 'test_case':
        return 'bg-purple-50 border-purple-200';
      case 'input_request':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getEventTextColor = (type: ExploreEvent['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'progress':
        return 'text-blue-800';
      case 'test_case':
        return 'text-purple-800';
      case 'input_request':
        return 'text-orange-800';
      default:
        return 'text-gray-800';
    }
  };

  const handleInputRequestSubmit = async (response: string) => {
    if (!inputRequestModal) return;
    
    try {
      setIsSubmitting(true);
      await resumeWithInput(projectId, chatId, response);
      // Clear the modal and reset the displayed index so new input requests can be shown
      setInputRequestModal(null);
      setDisplayedInputRequestIndex(null);
    } catch (err) {
      console.error('Failed to submit input request:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold">Exploration Progress</h3>
        <div className="flex items-center gap-2">
          {isStreaming && <Loader className="w-4 h-4 animate-spin text-blue-500" />}
          <span className="text-sm text-muted-foreground">
            {isStreaming ? 'Streaming...' : 'Completed'}
          </span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}

      {/* Events List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {events.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {isStreaming ? 'Waiting for events...' : 'No events received'}
          </div>
        ) : (
          events.map((event, index) => (
            <div
              key={index}
              className={`flex gap-3 p-3 rounded-lg border ${getEventBgColor(event.type)}`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {getEventIcon(event.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${getEventTextColor(event.type)}`}>
                  {event.message || `${event.type.charAt(0).toUpperCase()}${event.type.slice(1)}`}
                </p>
                {event.data && (
                  <div className="text-xs text-muted-foreground mt-1">
                    <details className="cursor-pointer">
                      <summary>Details</summary>
                      <pre className="mt-1 p-2 bg-background rounded text-xs overflow-auto max-h-32">
                        {JSON.stringify(event.data, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
                {event.timestamp && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {!isStreaming && events.length > 0 && (
        <div className="p-4 border-t flex gap-2">
          <button
            onClick={clearEvents}
            className="flex-1 px-3 py-2 text-sm bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
          >
            Clear Events
          </button>
        </div>
      )}

      {/* Input Request Modal */}
      {inputRequestModal && (
        <InputRequestModal
          isOpen={true}
          prompt={inputRequestModal.prompt || 'Please provide your input'}
          reason={inputRequestModal.reason as string | undefined}
          pageUrl={inputRequestModal.page_url as string | undefined}
          isSubmitting={isSubmitting}
          onSubmit={handleInputRequestSubmit}
          onClose={() => {
            setInputRequestModal(null);
            // Mark this input request as displayed so it won't reopen
            setDisplayedInputRequestIndex(displayedInputRequestIndex);
          }}
        />
      )}
    </div>
  );
}
