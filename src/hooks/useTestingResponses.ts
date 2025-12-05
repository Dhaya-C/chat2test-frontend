"use client";

import { useState, useCallback } from 'react';

export interface TestingResponse {
  id?: string;
  type: 'ai' | 'user' | 'error';
  content: any;
  timestamp: string;
  invoke_type?: string;
  test_case?: any;
  files?: Array<{
    name: string;
    type: string;
    url: string;
  }>;
}

export function useTestingResponses() {
  const [responses, setResponses] = useState<TestingResponse[]>([]);

  const formatResponse = useCallback((message: any): TestingResponse => {
    return {
      id: message.id,
      type: message.sender === 'bot' ? 'ai' : 'user',
      content: message.content,
      timestamp: message.timestamp,
      invoke_type: message.invoke_type,
      test_case: message.test_case,
      files: message.file_name ? [{
        name: message.file_name,
        type: message.file_type,
        url: message.file_url
      }] : []
    };
  }, []);

  const addResponse = useCallback((response: TestingResponse) => {
    setResponses(prev => [...prev, response]);
  }, []);

  const addErrorResponse = useCallback((errorMessage: string) => {
    setResponses(prev => [...prev, {
      type: 'error',
      content: errorMessage,
      timestamp: new Date().toISOString()
    }]);
  }, []);

  const setFormattedResponses = useCallback((messages: any[]) => {
    const aiMessages = messages.filter((msg: any) => msg.sender === 'bot');
    const formattedResponses = aiMessages.map(formatResponse);
    setResponses(formattedResponses);
  }, [formatResponse]);

  return {
    responses,
    setResponses,
    formatResponse,
    addResponse,
    addErrorResponse,
    setFormattedResponses
  };
}
