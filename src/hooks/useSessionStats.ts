"use client";

import { useMemo } from 'react';
import type { ChatSession } from './useProjectSessions';

export interface SessionStats {
  total: number;
  thisWeek: number;
  today: number;
}

export function useSessionStats(sessions: ChatSession[]): SessionStats {
  const stats = useMemo(() => {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    return {
      total: sessions.length,
      thisWeek: sessions.filter(s => new Date(s.created_at).getTime() > sevenDaysAgo).length,
      today: sessions.filter(s => new Date(s.created_at).getTime() > oneDayAgo).length
    };
  }, [sessions]);

  return stats;
}
