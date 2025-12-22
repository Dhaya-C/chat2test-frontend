"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Globe, FileCheck, Clock, Activity } from 'lucide-react';
import { DiscoveryMetadata } from '@/hooks/useDiscoverySession';

interface DiscoveryStatsCardsProps {
  metadata: DiscoveryMetadata | null;
  isStreaming: boolean;
  testCasesCount?: number;
}

export function DiscoveryStatsCards({ metadata, isStreaming, testCasesCount }: DiscoveryStatsCardsProps) {
  const [duration, setDuration] = React.useState(0);

  // Live duration timer
  React.useEffect(() => {
    if (!metadata?.started_at || metadata.status === 'completed' || metadata.status === 'failed') {
      if (metadata?.stats?.duration_seconds) {
        setDuration(metadata.stats.duration_seconds);
      }
      return;
    }

    const startTime = new Date(metadata.started_at).getTime();
    const timer = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      setDuration(elapsed);
    }, 1000);

    return () => clearInterval(timer);
  }, [metadata?.started_at, metadata?.status, metadata?.stats?.duration_seconds]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getStatusBadge = () => {
    const status = metadata?.status || 'pending';
    const colors = {
      pending: 'bg-gray-100 text-gray-700 border-gray-300',
      running: 'bg-blue-100 text-blue-700 border-blue-300',
      completed: 'bg-green-100 text-green-700 border-green-300',
      failed: 'bg-red-100 text-red-700 border-red-300',
    };

    const labels = {
      pending: 'Pending',
      running: 'Running',
      completed: 'Completed',
      failed: 'Failed',
    };

    return (
      <div className="flex items-center gap-2">
        {status === 'running' && (
          <span className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
        )}
        <span className={`px-2 py-1 rounded-md text-xs font-medium border ${colors[status]}`}>
          {labels[status]}
        </span>
      </div>
    );
  };

  const pagesExplored = metadata?.stats?.pages_explored || 0;
  const pagesTotal = metadata?.stats?.pages_total || metadata?.config?.max_pages || 0;
  const progressPercent = pagesTotal > 0 ? Math.round((pagesExplored / pagesTotal) * 100) : 0;
  const testCases = testCasesCount ?? metadata?.stats?.test_cases_generated ?? 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* Pages Explored */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Pages Explored</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-foreground">
                  {pagesExplored}
                </p>
                <p className="text-sm text-muted-foreground">
                  / {pagesTotal}
                </p>
              </div>
              {pagesTotal > 0 && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{progressPercent}%</p>
                </div>
              )}
            </div>
            <div className="ml-3 p-2 bg-blue-100 rounded-lg">
              <Globe className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Cases Found */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Test Cases</p>
              <p className="text-2xl font-bold text-foreground">
                {testCases}
              </p>
              {isStreaming && (
                <p className="text-xs text-blue-600 mt-1 animate-pulse">
                  Generating...
                </p>
              )}
            </div>
            <div className="ml-3 p-2 bg-green-100 rounded-lg">
              <FileCheck className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Duration */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Duration</p>
              <p className="text-2xl font-bold text-foreground">
                {formatDuration(duration)}
              </p>
              {isStreaming && (
                <p className="text-xs text-blue-600 mt-1">
                  In progress...
                </p>
              )}
            </div>
            <div className="ml-3 p-2 bg-purple-100 rounded-lg">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Status</p>
              <div className="mt-2">
                {getStatusBadge()}
              </div>
              {metadata?.stats?.current_action && (
                <p className="text-xs text-muted-foreground mt-2 truncate">
                  {metadata.stats.current_action}
                </p>
              )}
            </div>
            <div className="ml-3 p-2 bg-orange-100 rounded-lg">
              <Activity className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
