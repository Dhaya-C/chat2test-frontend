import { useRef, useCallback, useEffect } from 'react';
import { api } from '@/lib/api';
import { Message, WebSocketMessage, WebSocketMessageData, UseRestApiReturn, ChatBotResponse } from '@/types/chat';

// Re-export from types for backward compatibility
export type { WebSocketMessage, WebSocketMessageData, UseRestApiReturn as UseWebSocketReturn, ChatBotResponse };

export function useRestApi(
  chatId: number | null,
  onMessage?: (data: WebSocketMessageData) => void,
  messages: Message[] = []
): UseRestApiReturn {
  // Store the callback in a ref to avoid issues
  const onMessageRef = useRef(onMessage);
  
  // Update ref in useEffect to avoid updating during render
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const sendMessage = useCallback(async (message: WebSocketMessage) => {
    if (!chatId) {
      console.warn('No chat selected for sending message');
      return;
    }

    try {
      // Determine invoke_type based on last message's invoke_type
      const lastMessage = messages[messages.length - 1];
      const invokeType = lastMessage?.invoke_type === 'user_interrupt' ? 'resume' : 'new';
      
      // Prepare FormData for the REST API call
      const formData = new FormData();
      
      if (message.content) {
        formData.append('content', message.content);
      }
      
      // Handle file uploads
      if (message.files && message.files.length > 0) {
        message.files.forEach((file) => {
          formData.append('files', file);
        });
      }

      // Call the new REST API endpoint with invoke_type as query parameter
      const response = await api.post(
        `/chat/${chatId}/send-message?invoke_type=${invokeType}`, 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const messageResponse: Message = response.data;

      // Simulate the same WebSocket callback behavior
      if (onMessageRef.current) {
        if (messageResponse.invoke_type === 'test-case-approval') {
          // For test case approval, pass the full response data
          onMessageRef.current({
            message: messageResponse.content,
            type: messageResponse.invoke_type,
            test_case: messageResponse.test_case,
            fullResponse: messageResponse
          });
        } else {
          onMessageRef.current({
            message: messageResponse.content,
            type: messageResponse.invoke_type, // Use invoke_type from the response
          });
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Send error callback just like WebSocket would
      if (onMessageRef.current) {
        onMessageRef.current({
          error: 'Failed to send message. Please try again.',
        });
      }
    }
  }, [chatId, messages]);

  return {
    ws: null, // No WebSocket needed
    isConnected: true, // Always "connected" for REST API
    sendMessage,
  };
}