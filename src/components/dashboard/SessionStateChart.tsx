"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { SessionsByState } from '@/types/dashboard';

interface SessionStateChartProps {
  data: SessionsByState | null;
  loading?: boolean;
}

export function SessionStateChart({ data, loading = false }: SessionStateChartProps) {
  const chartData = data ? [
    { name: 'Testing', value: data.testing, fill: 'hsl(211, 100%, 43%)' },
    { name: 'Test Case', value: data.test_case, fill: 'hsl(199, 89%, 48%)' },
    { name: 'Final Report', value: data.final_report, fill: 'hsl(142, 76%, 36%)' },
  ] : [];

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sessions by State</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center">
            <div className="h-full w-full bg-muted animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Sessions by State</CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            No session data available
          </div>
        ) : (
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  allowDecimals={false}
                />
                <Tooltip 
                  formatter={(value: number) => [value, 'Sessions']}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[4, 4, 0, 0]}
                  fill="hsl(211, 100%, 43%)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
