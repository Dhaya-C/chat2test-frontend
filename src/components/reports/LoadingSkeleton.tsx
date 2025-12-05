"use client";

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function FilterPanelSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-5 w-20 bg-muted animate-pulse rounded" />
      </CardHeader>
      <CardContent className="space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-32 bg-muted animate-pulse rounded" />
            <div className="space-y-1.5">
              {[1, 2].map(j => (
                <div key={j} className="h-4 w-40 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function KPISummarySkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <Card key={i}>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              <div className="h-3 w-32 bg-muted animate-pulse rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ReportTableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-5 w-32 bg-muted animate-pulse rounded" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-12 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function PaginationSkeleton() {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="h-4 w-40 bg-muted animate-pulse rounded" />
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-8 w-8 bg-muted animate-pulse rounded" />
            ))}
          </div>
          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
        </div>
      </CardContent>
    </Card>
  );
}
