// Central export for all types

export * from './auth';
export * from './chat';
export * from './notification';
export * from './dashboard';
export * from './reports';

// Re-export from hooks for convenience
export type { ChatBotResponse } from '../hooks/useRestApi';
