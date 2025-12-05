"use client";

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';

interface TestCasesPaginationProps {
  currentPage: number;
  totalPages: number;
  pageNumbers: (number | string)[];
  canGoPrev: boolean;
  canGoNext: boolean;
  from: number;
  to: number;
  total: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export function TestCasesPagination({
  currentPage,
  totalPages,
  pageNumbers,
  canGoPrev,
  canGoNext,
  from,
  to,
  total,
  pageSize,
  pageSizeOptions = [10, 20, 50, 100],
  onPageChange,
  onPageSizeChange
}: TestCasesPaginationProps) {
  return (
    <div className="flex items-center justify-between py-4 px-4 bg-gray-50 rounded-lg border">
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-600">
          Showing <span className="font-medium">{from}</span> to <span className="font-medium">{to}</span> of{' '}
          <span className="font-medium">{total}</span> results
        </div>

        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Items per page:</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="w-16">
                  {pageSize}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {pageSizeOptions.map((size) => (
                  <DropdownMenuItem
                    key={size}
                    onClick={() => onPageSizeChange(size)}
                    className={pageSize === size ? 'bg-accent' : ''}
                  >
                    {size}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canGoPrev}
          variant="outline"
          size="sm"
          className="gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        <div className="flex gap-1">
          {pageNumbers.map((pageNum, idx) => (
            <div key={idx}>
              {pageNum === '...' ? (
                <span className="px-3 py-2 text-gray-600">...</span>
              ) : (
                <Button
                  onClick={() => onPageChange(pageNum as number)}
                  variant={currentPage === pageNum ? 'default' : 'outline'}
                  size="sm"
                  className="w-8 h-8 p-0"
                >
                  {pageNum}
                </Button>
              )}
            </div>
          ))}
        </div>

        <Button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canGoNext}
          variant="outline"
          size="sm"
          className="gap-1"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
