// Reports page related types

export interface ReportFilter {
  project_ids: number[] | null;
  session_ids: string[] | null;
  test_case_status: string[] | null; // ["pass", "fail", "new"]
  priority: string[] | null; // ["Critical", "High", "Medium", "Low"]
  modules: string[] | null;
  date_from: string; // YYYY-MM-DD
  date_to: string; // YYYY-MM-DD
  page: number;
  page_size: number;
}

export interface FilterOptions {
  projects: { project_id: number; project_name: string; session_count: number }[];
  sessions: {
    session_id: string;
    session_name: string;
    project_id: number;
    session_type: string;
    created_at: string;
    test_case_count: number;
  }[];
  modules: string[];
  priorities: string[];
  statuses: string[];
}

export interface KPISummary {
  total_test_cases: number;
  total_passed: number;
  total_failed: number;
  total_new: number;
  overall_pass_rate: number;
}

export interface TestCaseMetrics {
  total_test_cases: number;
  test_cases_passed: number;
  test_cases_failed: number;
  test_cases_new: number;
  pass_rate_percentage: number;
  modules_covered: string[];
  module_count: number;
}

export interface SessionReport {
  session_id: string;
  session_name: string;
  project_id: number;
  project_name: string;
  session_type: string;
  created_at: string;
  test_case_metrics: TestCaseMetrics;
}

export interface PaginationInfo {
  current_page: number;
  total_pages: number;
  total_records: number;
  page_size: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ReportResponse {
  kpi_summary: KPISummary;
  reports: SessionReport[];
  pagination: PaginationInfo;
}

export interface ReportTestCase {
  test_case_id: string;
  title: string;
  module: string;
  priority: string;
  status: string;
  expected_result: string;
  actual_result: string;
  execution_time_seconds: number;
  trace_available: boolean;
  trace_url: string;
  created_at: string;
}

export interface SessionInfo {
  session_id: string;
  session_name: string;
  project_name: string;
  created_at: string;
  total_test_cases: number;
}

export interface SessionTestCasesResponse {
  session_info: SessionInfo;
  test_cases: ReportTestCase[];
  pagination: PaginationInfo;
}

// Hook return types
export interface UseReportFiltersReturn {
  filterOptions: FilterOptions | null;
  filteredSessions: FilterOptions['sessions'];
  loading: boolean;
  error: string | null;
  updateSelectedProjects: (projectIds: number[] | null) => void;
}

export interface UseReportsReturn {
  reports: SessionReport[];
  kpiSummary: KPISummary | null;
  pagination: PaginationInfo | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseSessionTestCasesReturn {
  testCases: ReportTestCase[];
  sessionInfo: SessionInfo | null;
  pagination: PaginationInfo | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}
