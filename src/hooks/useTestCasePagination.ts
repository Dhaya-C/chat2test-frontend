"use client";

import { useMemo, useCallback } from 'react';

export function useTestCasePagination(total: number, pageSize: number, currentPage: number) {
  const totalPages = Math.ceil(total / pageSize);

  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      if (startPage > 2) {
        pages.push('...');
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages - 1) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  }, [totalPages, currentPage]);

  const getPageRange = useCallback(() => {
    const from = (currentPage - 1) * pageSize + 1;
    const to = Math.min(currentPage * pageSize, total);
    return { from, to };
  }, [currentPage, pageSize, total]);

  return {
    totalPages,
    pageNumbers,
    getPageRange,
    canGoNext: currentPage < totalPages,
    canGoPrev: currentPage > 1
  };
}
