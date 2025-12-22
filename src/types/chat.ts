// Chat and Message related types

export type Sender = "user" | "bot";

export type MessageType = "text" | "image" | "pdf" | "audio";

export interface MessageAttachment {
  type: 'image' | 'pdf';
  name: string;
  url: string;
  size?: number;
}

export interface TestCase {
  test_case_id: string;
  test_case_unique_id?: string;
  title: string;
  module_feature: string;
  priority: 'High' | 'Medium' | 'Low' | 'Critical';
  preconditions: string;
  test_steps: string[];
  test_data: string;
  expected_result: string;
  actual_result?: string;
  status: 'Pass' | 'Fail' | 'New' | 'Pending';
  project_id?: string;
  chat_id?: string;
  created_at?: string;
  updated_at?: string;
  error_log?: string | null;
}

export interface Message {
  id?: number;
  chat_id?: number;
  sender: Sender;
  content: string | null;
  file_type?: MessageType;
  file_name?: string;
  file_url?: string;
  invoke_type?: string;
  attachments?: MessageAttachment[]; // Support multiple attachments
  test_case?: TestCase[]; // For test case approval responses
  timestamp: string;
}

export interface Chat {
  id: number;
  user_id?: number;
  title: string;
  chat_type?: 'general_chat' | 'test_case_discovery';
  created_at?: string;
  updated_at?: string;
}

export interface CreateChatRequest {
  title: string;
}

export interface SendMessageRequest {
  type: MessageType;
  content?: string;
  file_name?: string;
  file_url?: string;
  file_size?: number;
}

export interface WebSocketMessage {
  type?: 'text' | 'image' | 'pdf' | 'audio';
  content?: string;
  file_name?: string;
  file_size?: number;
  file_url?: string;
  duration?: number | null;
  files?: File[];
  invokeType?: 'new' | 'resume';
}

export interface ChatBotResponse {
  type: "ai_response" | "user_interrupt" | "test-case-approval";
  response: string;
  test_case?: TestCase[];
  fullResponse?: Message;
}

export interface WebSocketMessageData {
  message?: string | null;
  type?: string;
  test_case?: TestCase[];
  fullResponse?: Message;
  error?: string;
}

export interface UseRestApiReturn {
  ws: null;
  isConnected: boolean;
  sendMessage: (message: WebSocketMessage) => void;
}
