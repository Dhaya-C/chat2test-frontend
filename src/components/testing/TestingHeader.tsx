"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, FolderOpen } from 'lucide-react';
import { NotificationBell } from '@/components/ui/NotificationBell';

interface TestingHeaderProps {
  projectId: number;
  projectName?: string;
  chatTitle?: string;
  onBack: () => void;
}

export function TestingHeader({ projectId, projectName, chatTitle, onBack }: TestingHeaderProps) {
  const router = useRouter();

  return (
    <header className="bg-card border-b border-border px-3 py-2 md:px-4 md:py-3 lg:px-6 lg:py-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div className="flex items-center gap-2 md:gap-4 w-full sm:w-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm h-8 md:h-9"
          >
            <ArrowLeft className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Back to Projects</span>
            <span className="sm:hidden">Back</span>
          </Button>

          <div className="h-4 md:h-6 w-px bg-border hidden sm:block"></div>

          <div className="flex items-center gap-1.5 md:gap-2 min-w-0 flex-1">
            <FolderOpen className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h1 className="text-sm md:text-base lg:text-lg font-semibold text-foreground truncate">{chatTitle || 'Testing Studio'}</h1>
              <p className="text-xs md:text-sm text-muted-foreground truncate">{projectName || `Project #${projectId}`}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-xs md:text-sm text-muted-foreground hidden md:block">
            AI-Powered Test Generation
          </div>
          <NotificationBell />
        </div>
      </div>
    </header>
  );
}