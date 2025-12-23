"use client";

import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronRight, Filter, Download, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ExploreEvent } from '@/hooks/useExploreEvents';
import { InputRequestModal } from '@/components/chat/InputRequestModal';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, Loader, Sparkles } from 'lucide-react';

interface DiscoveryEventsPanelProps {
  events: ExploreEvent[];
  isStreaming: boolean;
  error: string | null;
  onClose?: () => void;
  onInputRequest?: (response: string) => Promise<void>;
}

export function DiscoveryEventsPanel({ events, isStreaming, error, onClose, onInputRequest }: DiscoveryEventsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const eventsEndRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [inputRequestModal, setInputRequestModal] = useState<ExploreEvent | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [displayedInputRequestIndex, setDisplayedInputRequestIndex] = useState<number | null>(null);

  // Auto-scroll to bottom when new events arrive
  useEffect(() => {
    if (autoScroll && eventsEndRef.current) {
      eventsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [events, autoScroll]);

  // Watch for input_request events - only show for the most recent one if it's the LAST event
  useEffect(() => {
    // The modal should ONLY open if:
    // 1. There IS an input_request event
    // 2. It is the LAST/FINAL event in the events array
    // 3. We haven't already displayed it

    if (events.length === 0) {
      return;
    }

    const lastEvent = events[events.length - 1];
    const lastEventIndex = events.length - 1;

    // Only show modal if the LAST event is input_request AND we haven't shown it yet
    if (lastEvent.type === 'input_request' && lastEventIndex !== displayedInputRequestIndex) {
      console.log('[DiscoveryEventsPanel] LAST event is input_request, showing modal');
      setInputRequestModal(lastEvent);
      setDisplayedInputRequestIndex(lastEventIndex);
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
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getEventBgColor = (type: ExploreEvent['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800';
      case 'progress':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800';
      case 'test_case':
        return 'bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-800';
      default:
        return 'bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-700';
    }
  };

  const getEventTextColor = (type: ExploreEvent['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-800 dark:text-green-200';
      case 'error':
        return 'text-red-800 dark:text-red-200';
      case 'warning':
        return 'text-yellow-800 dark:text-yellow-200';
      case 'progress':
        return 'text-blue-800 dark:text-blue-200';
      case 'test_case':
        return 'text-purple-800 dark:text-purple-200';
      default:
        return 'text-gray-800 dark:text-gray-200';
    }
  };

  const downloadEvents = () => {
    const content = JSON.stringify(events, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `discovery-events-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleInputRequestSubmit = async (response: string) => {
    if (!inputRequestModal || !onInputRequest) return;

    try {
      setIsSubmitting(true);
      console.log('[DiscoveryEventsPanel] Submitting input:', response);
      await onInputRequest(response);
      
      // Close modal after successful submission
      setInputRequestModal(null);
      setDisplayedInputRequestIndex(null);
      
      console.log('[DiscoveryEventsPanel] Input submitted successfully, waiting for new events...');
    } catch (err) {
      console.error('[DiscoveryEventsPanel] Failed to submit input:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`flex flex-col h-full bg-card border-l transition-all duration-300 ${isExpanded ? 'w-full' : 'w-96'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-white">Discovery Events</h3>
          {isStreaming && (
            <span className="flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-blue-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-200"></span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-white hover:bg-white/20"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Minimize' : 'Maximize'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-white hover:bg-white/20"
            onClick={downloadEvents}
            disabled={events.length === 0}
            title="Download events"
          >
            <Download className="w-4 h-4" />
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-white hover:bg-white/20"
              onClick={onClose}
              title="Close panel"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Filter Bar - REMOVED */}

      {/* Error Message */}
      {error && (
        <div className="mx-3 mt-3 p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-950 dark:border-red-800">
          <p className="text-sm text-red-800 dark:text-red-200">
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}

      {/* Events List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {events.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {isStreaming ? (
              <div className="flex flex-col items-center gap-2">
                <Loader className="w-6 h-6 animate-spin text-blue-500" />
                <p className="text-sm">Waiting for events...</p>
              </div>
            ) : (
              <p className="text-sm">No events yet</p>
            )}
          </div>
        ) : (
          events.map((event, index) => (
            <div
              key={index}
              className={`flex gap-2 p-2.5 rounded-lg border ${getEventBgColor(event.type)}`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {getEventIcon(event.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium ${getEventTextColor(event.type)}`}>
                  {event.message || `${event.type.charAt(0).toUpperCase()}${event.type.slice(1)}`}
                </p>
                {event.data && Object.keys(event.data).length > 0 && (
                  <details className="cursor-pointer mt-1">
                    <summary className="text-xs text-muted-foreground hover:text-foreground">
                      Details <ChevronRight className="inline w-3 h-3" />
                    </summary>
                    <pre className="mt-1 p-2 bg-background rounded text-[10px] overflow-auto max-h-32 border">
                      {JSON.stringify(event.data, null, 2)}
                    </pre>
                  </details>
                )}
                {event.timestamp && (
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={eventsEndRef} />
      </div>

      {/* Footer */}
      <div className="p-3 border-t bg-sidebar flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={(e) => setAutoScroll(e.target.checked)}
            className="rounded"
          />
          Auto-scroll
        </label>
        <span className="text-xs text-muted-foreground">
          {events.length} {events.length === 1 ? 'event' : 'events'}
        </span>
      </div>

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
            setDisplayedInputRequestIndex(displayedInputRequestIndex);
          }}
        />
      )}
    </div>
  );
}
