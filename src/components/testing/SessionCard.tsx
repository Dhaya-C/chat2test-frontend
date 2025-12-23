"use client";

import { MessageSquare, Calendar, Play, Trash2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ChatSession } from '@/hooks/useProjectSessions';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  const isDiscoverySession = session.chat_type === 'test_case_discovery';
  
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

  const handleViewDiscovery = () => {
    router.push(`/dashboard/projects/${session.project_id}/discovery/${session.id}`);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg">{session.title}</CardTitle>
              {isDiscoverySession && (
                <Badge className="bg-purple-100 text-purple-700 border-purple-300">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Discovery
                </Badge>
              )}
            </div>
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
          {isDiscoverySession ? (
            <>
              <Button
                size="sm"
                onClick={handleViewDiscovery}
                className="bg-purple-500 text-white hover:bg-purple-600"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                View Discovery
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onViewTestCases(session.id)}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                View Test Cases
              </Button>
            </>
          ) : (
            <>
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
            </>
          )}
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
