"use client";

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';

interface ReportErrorBoundaryProps {
  error: string | null;
  onRetry?: () => void;
}

export function ReportErrorBoundary({ error, onRetry }: ReportErrorBoundaryProps) {
  if (!error) return null;

  // Ensure error is a string
  const errorMessage = typeof error === 'string' ? error : JSON.stringify(error);

  return (
    <Card className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
      <CardContent className="pt-6">
        <div className="flex gap-4">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">Error</h3>
            <p className="text-sm text-red-800 dark:text-red-200 mb-3">{errorMessage}</p>
            {onRetry && (
              <Button
                onClick={onRetry}
                size="sm"
                variant="outline"
                className="border-red-300 hover:bg-red-100 dark:border-red-700 dark:hover:bg-red-900"
              >
                Try Again
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
