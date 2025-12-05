"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RecentActivityItem } from '@/types/dashboard';
import { TestTube, MessageCircle, CheckCircle, XCircle, Clock } from 'lucide-react';

interface RecentActivityProps {
  data: RecentActivityItem[] | null;
  loading?: boolean;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

function getStatusConfig(status: string) {
  const lowerStatus = status.toLowerCase();
  if (lowerStatus === 'passed' || lowerStatus === 'pass') {
    return { 
      icon: CheckCircle, 
      color: 'text-green-600', 
      bgColor: 'bg-green-100 text-green-800 border-green-200' 
    };
  }
  if (lowerStatus === 'failed' || lowerStatus === 'fail') {
    return { 
      icon: XCircle, 
      color: 'text-red-600', 
      bgColor: 'bg-red-100 text-red-800 border-red-200' 
    };
  }
  if (lowerStatus === 'pending' || lowerStatus === 'new') {
    return { 
      icon: Clock, 
      color: 'text-orange-600', 
      bgColor: 'bg-orange-100 text-orange-800 border-orange-200' 
    };
  }
  // Default for other statuses like 'final_report', 'testing', etc.
  return { 
    icon: Clock, 
    color: 'text-blue-600', 
    bgColor: 'bg-blue-100 text-blue-800 border-blue-200' 
  };
}

export function RecentActivity({ data, loading = false }: RecentActivityProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {!data || data.length === 0 ? (
          <p className="text-muted-foreground text-sm">No recent activity to display.</p>
        ) : (
          <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar">
            {data.map((item) => {
              const statusConfig = getStatusConfig(item.status);
              const StatusIcon = statusConfig.icon;
              const TypeIcon = item.type === 'test_case' ? TestTube : MessageCircle;
              
              return (
                <div 
                  key={item.id} 
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className={`p-2 rounded-full bg-muted ${statusConfig.color}`}>
                    <TypeIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={`text-xs ${statusConfig.bgColor}`}>
                        {item.status.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {item.project_name}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTimeAgo(item.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
