"use client";

import { useState, useCallback, useMemo } from 'react';
import type { TestCase } from './useTestCases';

export function useTestCaseSelection(testCases: TestCase[]) {
  const [selectedCases, setSelectedCases] = useState<Set<string>>(new Set());
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const selectTestCase = useCallback((testCaseId: string) => {
    setSelectedCases(prev => {
      const newSet = new Set(prev);
      if (newSet.has(testCaseId)) {
        newSet.delete(testCaseId);
      } else {
        newSet.add(testCaseId);
      }
      return newSet;
    });
  }, []);

  const selectAllTestCases = useCallback(() => {
    if (selectedCases.size === testCases.length) {
      setSelectedCases(new Set());
    } else {
      setSelectedCases(new Set(testCases.map(tc => tc.test_case_id)));
    }
  }, [testCases, selectedCases.size]);

  const toggleRowExpansion = useCallback((testCaseId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(testCaseId)) {
        newSet.delete(testCaseId);
      } else {
        newSet.add(testCaseId);
      }
      return newSet;
    });
  }, []);

  const getSelectedTestCases = useCallback(() => {
    return testCases.filter(tc => selectedCases.has(tc.test_case_id));
  }, [testCases, selectedCases]);

  const isAllSelected = useMemo(() => {
    return testCases.length > 0 && selectedCases.size === testCases.length;
  }, [testCases.length, selectedCases.size]);

  return {
    selectedCases,
    expandedRows,
    selectTestCase,
    selectAllTestCases,
    toggleRowExpansion,
    getSelectedTestCases,
    isAllSelected,
    clearSelection: () => setSelectedCases(new Set())
  };
}
