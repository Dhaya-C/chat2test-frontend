// Dashboard related types

export interface KPI {
  total_projects: number;
  active_projects: number;
  total_sessions: number;
  total_test_cases: number;
  tests_passed: number;
  tests_failed: number;
  tests_pending: number;
  pass_rate: number;
}

export interface TestsByStatus {
  passed: number;
  failed: number;
  pending: number;
}

export interface TestsByPriority {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface SessionsByType {
  quick_session: number;
  test_case_discovery: number;
  general_chat: number;
}

export interface SessionsByState {
  testing: number;
  test_case: number;
  final_report: number;
}

export interface ModuleCoverage {
  module_name: string;
  test_count: number;
}

export interface RecentActivityItem {
  id: string;
  type: 'test_case' | 'session';
  title: string;
  status: string;
  created_at: string;
  project_name: string;
}

export interface TestGenerationTrend {
  date: string;
  count: number;
}

export interface DashboardStats {
  kpi: KPI;
  tests_by_status: TestsByStatus;
  tests_by_priority: TestsByPriority;
  sessions_by_type: SessionsByType;
  sessions_by_state: SessionsByState;
  module_coverage: ModuleCoverage[];
  recent_activity: RecentActivityItem[];
  test_generation_trend: TestGenerationTrend[];
}
