"use client";

import { FileUp, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface TestCasesHeaderProps {
  loading: boolean;
  onRefresh: () => void;
}

export function TestCasesHeader({ loading, onRefresh }: TestCasesHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Test Cases</h1>
        <p className="text-gray-600 mt-1">Manage and execute your test cases</p>
      </div>

      <Button
        onClick={onRefresh}
        disabled={loading}
        variant="outline"
        className="gap-2"
      >
        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        {loading ? 'Loading...' : 'Refresh'}
      </Button>
    </div>
  );
}
