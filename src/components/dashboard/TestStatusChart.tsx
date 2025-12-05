"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { TestsByStatus } from '@/types/dashboard';

interface TestStatusChartProps {
  data: TestsByStatus | null;
  loading?: boolean;
}

const COLORS = {
  passed: 'hsl(142, 76%, 36%)',   // Green - success
  failed: 'hsl(0, 84%, 60%)',     // Red - destructive
  new: 'hsl(38, 92%, 50%)',       // Orange - warning
};

export function TestStatusChart({ data, loading = false }: TestStatusChartProps) {
  const chartData = data ? [
    { name: 'Failed', value: data.failed, color: COLORS.failed },
    { name: 'Passed', value: data.passed, color: COLORS.passed },
    { name: 'New', value: data.pending, color: COLORS.new },
  ] : [];

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Test Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center">
            <div className="h-32 w-32 rounded-full bg-muted animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Test Status</CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            No test data available
          </div>
        ) : (
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [value, 'Tests']}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
