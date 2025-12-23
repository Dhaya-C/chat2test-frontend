// Custom Hooks
export { useAuth } from './useAuth';
export { useChat } from './useChat';
export { useRestApi as useApi } from './useRestApi'; // REST API hook with REST-like interface
export { useToast } from './useToast';
export { useNotifications } from './useNotifications';
export { useBrowserNotifications } from './useBrowserNotifications';
export { useDashboard } from './useDashboard';
export { useExploreEvents } from './useExploreEvents';
export { useDiscoverySession } from './useDiscoverySession';

// Layout & UI Hooks
export { useSidebarNav } from './useSidebarNav';
export { useUserInfo } from './useUserInfo';

// Test Cases Hooks
export { useTestCases } from './useTestCases';
export { useTestCasesCount } from './useTestCasesCount';
export { useTestCaseExecutor } from './useTestCaseExecutor';
export { useJiraIntegration } from './useJiraIntegration';
export { useTestCasePagination } from './useTestCasePagination';
export { useTestCaseSelection } from './useTestCaseSelection';
export { useTestCaseComments } from './useTestCaseComments';
export { useTraceDownload } from './useTraceDownload';
export { useTestCaseExporter } from './useTestCaseExporter';

// Testing Hooks
export { useTestingSession } from './useTestingSession';
export { useTestingResponses } from './useTestingResponses';
export { useTestingSubmit } from './useTestingSubmit';

// Sessions Hooks
export { useProjectSessions } from './useProjectSessions';
export { useSessionStats } from './useSessionStats';

// Reports Hooks
export { useReportFilters } from './useReportFilters';
export { useReports } from './useReports';
export { useSessionTestCases } from './useSessionTestCases';

// Type exports
export type { UseChatReturn } from './useChat';
export type { UseRestApiReturn as UseApiReturn, WebSocketMessage as ApiMessage, ChatBotResponse, WebSocketMessageData } from '@/types/chat';
export type { TestCase } from './useTestCases';
export type { TestingResponse } from './useTestingResponses';
export type { InputPanelRef } from './useTestingSubmit';
export type { ChatSession } from './useProjectSessions';
export type { SessionStats } from './useSessionStats';
