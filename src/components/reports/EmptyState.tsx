"use client";

import React from 'react';
import { InboxIcon, AlertCircle, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="py-12 text-center">
      <div className="flex justify-center mb-4">
        {icon || <InboxIcon className="h-12 w-12 text-muted-foreground" />}
      </div>
      <h3 className="font-semibold text-lg text-foreground mb-2">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mb-4">{description}</p>}
      {action && (
        <Button onClick={action.onClick} variant="outline" size="sm">
          {action.label}
        </Button>
      )}
    </div>
  );
}

export function NoReportsEmptyState({ onReset }: { onReset?: () => void }) {
  return (
    <Card>
      <CardContent>
        <EmptyState
          icon={<Filter className="h-12 w-12 text-muted-foreground" />}
          title="No reports found"
          description="Try adjusting your filters to see reports"
          action={
            onReset
              ? {
                  label: 'Reset Filters',
                  onClick: onReset,
                }
              : undefined
          }
        />
      </CardContent>
    </Card>
  );
}

export function NoTestCasesEmptyState() {
  return (
    <EmptyState
      icon={<InboxIcon className="h-12 w-12 text-muted-foreground" />}
      title="No test cases found"
      description="This session has no test cases"
    />
  );
}

export function LoadingErrorEmptyState({ onRetry }: { onRetry?: () => void }) {
  return (
    <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
      <CardContent>
        <EmptyState
          icon={<AlertCircle className="h-12 w-12 text-yellow-600" />}
          title="Unable to load reports"
          description="There was an error loading the reports. Please try again."
          action={
            onRetry
              ? {
                  label: 'Retry',
                  onClick: onRetry,
                }
              : undefined
          }
        />
      </CardContent>
    </Card>
  );
}
