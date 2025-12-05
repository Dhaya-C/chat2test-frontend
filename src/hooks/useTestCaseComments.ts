"use client";

import { useState, useCallback } from 'react';

export function useTestCaseComments() {
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const setCommentInput = useCallback((testCaseId: string, comment: string) => {
    setCommentInputs(prev => ({
      ...prev,
      [testCaseId]: comment
    }));
  }, []);

  const getCommentInput = useCallback((testCaseId: string) => {
    return commentInputs[testCaseId] || '';
  }, [commentInputs]);

  const clearCommentInput = useCallback((testCaseId: string) => {
    setCommentInputs(prev => {
      const newInputs = { ...prev };
      delete newInputs[testCaseId];
      return newInputs;
    });
  }, []);

  return {
    commentInputs,
    setCommentInput,
    getCommentInput,
    clearCommentInput
  };
}
