"use client";

import React, { useState } from 'react';
import { X, Send, Loader } from 'lucide-react';

interface InputRequestModalProps {
  prompt: string;
  reason?: string;
  pageUrl?: string;
  isOpen: boolean;
  isSubmitting?: boolean;
  onSubmit: (response: string) => Promise<void>;
  onClose: () => void;
}

export function InputRequestModal({
  prompt,
  reason,
  pageUrl,
  isOpen,
  isSubmitting = false,
  onSubmit,
  onClose,
}: InputRequestModalProps) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async () => {
    if (!inputValue.trim()) {
      setError('Please enter a response');
      return;
    }

    try {
      setError(null);
      await onSubmit(inputValue.trim());
      setInputValue('');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to submit response';
      setError(errorMsg);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit();
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 rounded-lg shadow-lg bg-background border border-border animate-in fade-in-50 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Agent Question</h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 hover:bg-muted rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Prompt */}
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">
              {prompt}
            </label>
          </div>

          {/* Reason */}
          {reason && (
            <div className="p-3 rounded-lg bg-muted border border-border">
              <p className="text-xs font-medium text-muted-foreground mb-1">Reason:</p>
              <p className="text-sm text-foreground">{reason}</p>
            </div>
          )}

          {/* Page URL */}
          {pageUrl && (
            <div className="p-3 rounded-lg bg-muted border border-border">
              <p className="text-xs font-medium text-muted-foreground mb-1">Current Page:</p>
              <p className="text-xs text-foreground break-words font-mono">{pageUrl}</p>
            </div>
          )}

          {/* Input Field */}
          <div>
            <textarea
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setError(null);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Enter your response here... (Ctrl+Enter to submit)"
              disabled={isSubmitting}
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed resize-none"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 dark:bg-red-950/30 dark:border-red-900">
              <p className="text-sm text-red-800 dark:text-red-200">
                <strong>Error:</strong> {error}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-border">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !inputValue.trim()}
            className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Response
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
