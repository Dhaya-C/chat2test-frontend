/**
 * Redirect utility for auto-navigation based on message/response data
 * Centralizes redirect logic to avoid duplication
 */

import { Message } from '@/types/chat';

/**
 * Check if should auto-redirect to test cases page based on message content
 * Redirects when test cases are generated (returned as array or test-case-approval type)
 * @param message - Message/response to check
 * @returns true if should redirect to test cases, false otherwise
 */
export function shouldRedirectToTestCases(message: any): boolean {
  if (!message) {
    return false;
  }

  // Check if content is an array (test cases returned)
  if (Array.isArray(message.content)) {
    return true;
  }

  // Check if invoke_type is test-case-approval
  if (message.invoke_type === 'test-case-approval') {
    return true;
  }

  return false;
}

/**
 * Check if last message indicates we should redirect to test cases
 * @param messages - Array of messages
 * @returns true if last message indicates redirect, false otherwise
 */
export function shouldRedirectFromMessages(messages: Message[]): boolean {
  if (messages.length === 0) {
    return false;
  }

  const lastMessage = messages[messages.length - 1];
  return shouldRedirectToTestCases(lastMessage);
}
