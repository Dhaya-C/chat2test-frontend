"use client";

import React from 'react';
import { SessionReport } from '@/types/reports';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Eye, Download } from 'lucide-react';

interface ReportTableProps {
  reports: SessionReport[];
  loading?: boolean;
  onViewTests?: (sessionId: string) => void;
  onExport?: (sessionId: string) => void;
  onDownloadTrace?: (sessionId: string) => void;
}

export function ReportTable({
  reports,
  loading = false,
  onViewTests,
  onExport,
  onDownloadTrace,
}: ReportTableProps) {
  // Helper function to get status badge color
  const getStatusColor = (percentage: number) => {
    if (percentage >= 85) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
    if (percentage >= 70) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
  };

  // Loading skeleton
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Test Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (!reports || reports.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Test Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center">
            <p className="text-muted-foreground mb-1 font-medium">No reports found</p>
            <p className="text-xs text-muted-foreground">Try adjusting your filters to see test reports</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Reports</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border">
              <tr className="bg-muted/50">
                <th className="text-left p-3 font-semibold text-foreground">Session</th>
                <th className="text-left p-3 font-semibold text-foreground">Project</th>
                <th className="text-left p-3 font-semibold text-foreground">Type</th>
                <th className="text-left p-3 font-semibold text-foreground">Date</th>
                <th className="text-center p-3 font-semibold text-foreground">Total</th>
                <th className="text-center p-3 font-semibold text-foreground text-green-600">✓</th>
                <th className="text-center p-3 font-semibold text-foreground text-red-600">✗</th>
                <th className="text-center p-3 font-semibold text-foreground text-yellow-600">New</th>
                <th className="text-center p-3 font-semibold text-foreground">Pass %</th>
                <th className="text-left p-3 font-semibold text-foreground">Modules</th>
                <th className="text-center p-3 font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report, index) => (
                <tr key={report.session_id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="p-3">
                    <span className="font-medium text-foreground truncate block max-w-xs">
                      {report.session_name}
                    </span>
                  </td>
                  <td className="p-3 text-muted-foreground">{report.project_name}</td>
                  <td className="p-3">
                    <Badge variant="outline" className="capitalize text-xs">
                      {report.session_type.replace(/_/g, ' ')}
                    </Badge>
                  </td>
                  <td className="p-3 text-muted-foreground text-xs">
                    {new Date(report.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-center font-semibold text-foreground">
                    {report.test_case_metrics.total_test_cases}
                  </td>
                  <td className="p-3 text-center text-green-600 font-semibold">
                    {report.test_case_metrics.test_cases_passed}
                  </td>
                  <td className="p-3 text-center text-red-600 font-semibold">
                    {report.test_case_metrics.test_cases_failed}
                  </td>
                  <td className="p-3 text-center text-yellow-600 font-semibold">
                    {report.test_case_metrics.test_cases_new}
                  </td>
                  <td className="p-3 text-center">
                    <Badge
                      className={`${getStatusColor(report.test_case_metrics.pass_rate_percentage)}`}
                    >
                      {report.test_case_metrics.pass_rate_percentage.toFixed(1)}%
                    </Badge>
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">
                    {report.test_case_metrics.modules_covered.length > 0 ? (
                      <span title={report.test_case_metrics.modules_covered.join(', ')}>
                        {report.test_case_metrics.modules_covered.length} module{report.test_case_metrics.modules_covered.length > 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1 justify-center">
                      {onViewTests && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onViewTests(report.session_id)}
                          title="View test cases"
                          className="h-7 w-7 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      {onDownloadTrace && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDownloadTrace(report.session_id)}
                          title="Download trace"
                          className="h-7 w-7 p-0"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
