"use client";

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { useProjectSessions, useSessionStats } from '@/hooks';
import { SessionCard } from '@/components/testing/SessionCard';
import { TestingSessionModal } from '@/components/testing/TestingSessionModal';
import { NotificationBell } from '@/components/ui/NotificationBell';

export default function ProjectSessionsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = parseInt(params.id as string);

  // Load sessions and project details
  const { sessions, loading, projectName, deleteSession, refreshSessions } = useProjectSessions(projectId);

  // Calculate stats
  const stats = useSessionStats(sessions);

  // Modal state
  const [isNewSessionModalOpen, setIsNewSessionModalOpen] = useState(false);

  const handleBackToProjects = () => {
    router.push('/dashboard/projects');
  };

  const handleResumeSession = (chatId: number) => {
    router.push(`/dashboard/projects/${projectId}/testing?chatId=${chatId}`);
  };

  const handleViewTestCases = (chatId: number) => {
    router.push(`/dashboard/projects/${projectId}/test-cases?chatId=${chatId}`);
  };

  const handleDeleteSession = async (chatId: number) => {
    const success = await deleteSession(chatId);
    if (!success) {
      alert('Failed to delete session. Please try again.');
    }
  };

  const handleNewSessionCreated = () => {
    refreshSessions();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-y-auto">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBackToProjects}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {projectName ? `${projectName} - ` : ''}Testing Sessions
              </h1>
              <p className="text-muted-foreground">View and manage your testing sessions</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsNewSessionModalOpen(true)}
              className="bg-blue-500 text-white"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              New Session
            </Button>
            <NotificationBell />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {sessions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Testing Sessions</h3>
              <p className="text-muted-foreground text-center mb-4">
                You haven't created any testing sessions for this project yet.
              </p>
              <Button onClick={() => setIsNewSessionModalOpen(true)}>
                <MessageSquare className="w-4 h-4 mr-2" />
                Start Your First Session
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-foreground">{stats.total}</div>
                  <p className="text-xs text-muted-foreground">Total Sessions</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-blue-600">{stats.thisWeek}</div>
                  <p className="text-xs text-muted-foreground">This Week</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-green-600">{stats.today}</div>
                  <p className="text-xs text-muted-foreground">Today</p>
                </CardContent>
              </Card>
            </div>

            {/* Sessions List */}
            <div className="space-y-4">
              {sessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onResume={handleResumeSession}
                  onViewTestCases={handleViewTestCases}
                  onDelete={handleDeleteSession}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* New Session Modal */}
      <TestingSessionModal
        projectId={projectId}
        open={isNewSessionModalOpen}
        onClose={() => setIsNewSessionModalOpen(false)}
        onSessionCreated={handleNewSessionCreated}
      />
    </div>
  );
}