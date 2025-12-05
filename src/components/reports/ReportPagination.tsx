"use client";

import React from 'react';
import { PaginationInfo } from '@/types/reports';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ReportPaginationProps {
  pagination: PaginationInfo | null;
  loading?: boolean;
  onPageChange?: (page: number) => Promise<void>;
}

export function ReportPagination({
  pagination,
  loading = false,
  onPageChange,
}: ReportPaginationProps) {
  if (!pagination) return null;

  const [isChanging, setIsChanging] = React.useState(false);

  const handlePrevious = async () => {
    if (pagination.has_prev && onPageChange) {
      setIsChanging(true);
      try {
        await onPageChange(pagination.current_page - 1);
      } finally {
        setIsChanging(false);
      }
    }
  };

  const handleNext = async () => {
    if (pagination.has_next && onPageChange) {
      setIsChanging(true);
      try {
        await onPageChange(pagination.current_page + 1);
      } finally {
        setIsChanging(false);
      }
    }
  };

  const handlePageClick = async (page: number) => {
    if (page !== pagination.current_page && onPageChange) {
      setIsChanging(true);
      try {
        await onPageChange(page);
      } finally {
        setIsChanging(false);
      }
    }
  };

  // Generate page numbers array
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, pagination.current_page - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(pagination.total_pages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push('...');
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < pagination.total_pages) {
      if (endPage < pagination.total_pages - 1) pages.push('...');
      pages.push(pagination.total_pages);
    }

    return pages;
  };

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Left section: Items info */}
          <div className="text-sm text-muted-foreground">
            Showing{' '}
            <span className="font-semibold text-foreground">
              {pagination.total_records > 0
                ? (pagination.current_page - 1) * pagination.page_size + 1
                : 0}
            </span>
            {' to '}
            <span className="font-semibold text-foreground">
              {Math.min(pagination.current_page * pagination.page_size, pagination.total_records)}
            </span>
            {' of '}
            <span className="font-semibold text-foreground">{pagination.total_records}</span> records
          </div>

          {/* Center section: Page buttons */}
          <div className="flex items-center gap-1">
            <Button
              onClick={handlePrevious}
              disabled={!pagination.has_prev || loading || isChanging}
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {getPageNumbers().map((page, index) => (
              page === '...' ? (
                <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                  {page}
                </span>
              ) : (
                <Button
                  key={page}
                  onClick={() => handlePageClick(page as number)}
                  variant={page === pagination.current_page ? 'default' : 'outline'}
                  size="sm"
                  disabled={loading || isChanging}
                  className="h-8 w-8 p-0"
                >
                  {page}
                </Button>
              )
            ))}

            <Button
              onClick={handleNext}
              disabled={!pagination.has_next || loading || isChanging}
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Right section: Page size */}
          <div className="text-sm text-muted-foreground">
            Page {pagination.current_page} of {pagination.total_pages}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
