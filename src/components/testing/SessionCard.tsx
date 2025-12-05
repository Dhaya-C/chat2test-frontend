"use client";

import { MessageSquare, Calendar, Play, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ChatSession } from '@/hooks/useProjectSessions';

interface SessionCardProps {
  session: ChatSession;
  onResume: (chatId: number) => void;
  onViewTestCases: (chatId: number) => void;
  onDelete: (chatId: number) => void;
}

export function SessionCard({
  session,
  onResume,
  onViewTestCases,
  onDelete
}: SessionCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = () => {
    if (!confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      return;
    }
    onDelete(session.id);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{session.title}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Created: {formatDate(session.created_at)}
              </div>
              {session.updated_at && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Updated: {formatDate(session.updated_at)}
                </div>
              )}
            </div>
          </div>
          <Badge variant="outline" className="ml-4">
            Session #{session.id}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            onClick={() => onResume(session.id)}
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            <Play className="w-4 h-4 mr-2" />
            Resume Chat
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewTestCases(session.id)}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            View Test Cases
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
