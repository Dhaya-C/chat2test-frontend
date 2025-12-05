"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { FolderOpen } from 'lucide-react';
import { NotificationBell } from '@/components/ui/NotificationBell';
import { useDashboard } from '@/hooks/useDashboard';
import {
  KPICards,
  TestStatusChart,
  TestPriorityChart,
  TestTrendChart,
  ModuleCoverageChart,
  SessionStateChart,
  SessionTypeChart,
  RecentActivity,
} from '@/components/dashboard';

export default function DashboardPage() {
  const { stats, loading, error } = useDashboard();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your TestSamurAI dashboard</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/projects">
            <Button className="flex items-center gap-2">
              <FolderOpen size={16} />
              View Projects
            </Button>
          </Link>
          <NotificationBell />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive text-sm">Failed to load dashboard data. Please try again later.</p>
        </div>
      )}

      {/* KPI Cards */}
      <KPICards kpi={stats?.kpi ?? null} loading={loading} />

      {/* Charts Row 1: Test Status & Priority */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TestStatusChart data={stats?.tests_by_status ?? null} loading={loading} />
        <TestPriorityChart data={stats?.tests_by_priority ?? null} loading={loading} />
      </div>

      {/* Charts Row 2: Test Generation Trend (Full Width) */}
      <TestTrendChart data={stats?.test_generation_trend ?? null} loading={loading} />

      {/* Charts Row 3: Module Coverage & Session State */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ModuleCoverageChart data={stats?.module_coverage ?? null} loading={loading} />
        <SessionStateChart data={stats?.sessions_by_state ?? null} loading={loading} />
      </div>

      {/* Charts Row 4: Session Type & Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SessionTypeChart data={stats?.sessions_by_type ?? null} loading={loading} />
        <RecentActivity data={stats?.recent_activity ?? null} loading={loading} />
      </div>
    </div>
  );
}