"use client";

import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTraceDownload } from '@/hooks/useTraceDownload';

interface TraceDownloadButtonProps {
  chatId: string;
  testCaseUniqueId: string;
}

export function TraceDownloadButton({ chatId, testCaseUniqueId }: TraceDownloadButtonProps) {
  const { downloadTrace, loading } = useTraceDownload();

  const handleClick = () => {
    downloadTrace(chatId, testCaseUniqueId);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={loading}
      className="gap-1 h-8 px-2"
      title="Download trace video"
    >
      <Download className="w-4 h-4" />
      {loading ? 'Downloading...' : 'Trace'}
    </Button>
  );
}
