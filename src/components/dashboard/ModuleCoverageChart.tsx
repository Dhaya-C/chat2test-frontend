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
  ResponsiveContainer,
  Cell
} from 'recharts';
import { ModuleCoverage } from '@/types/dashboard';

interface ModuleCoverageChartProps {
  data: ModuleCoverage[] | null;
  loading?: boolean;
}

// Generate colors for bars
const COLORS = [
  'hsl(211, 100%, 43%)',  // Primary blue
  'hsl(199, 89%, 48%)',   // Light blue
  'hsl(173, 58%, 39%)',   // Teal
  'hsl(142, 76%, 36%)',   // Green
  'hsl(38, 92%, 50%)',    // Orange
];

// Truncate long module names
const truncateText = (text: string, maxLength: number = 20) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export function ModuleCoverageChart({ data, loading = false }: ModuleCoverageChartProps) {
  // Sort by test count descending and take top 5
  const chartData = data
    ?.slice()
    .sort((a, b) => b.test_count - a.test_count)
    .slice(0, 5)
    .map(item => ({
      ...item,
      display_name: truncateText(item.module_name, 18),
    })) ?? [];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Module Coverage</CardTitle>
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
        <CardTitle className="text-base">Module Coverage (Top 5)</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            No module data available
          </div>
        ) : (
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={chartData} 
                layout="vertical"
                margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis 
                  type="number"
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  allowDecimals={false}
                />
                <YAxis 
                  type="category"
                  dataKey="display_name" 
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  width={120}
                />
                <Tooltip 
                  formatter={(value: number, name: string, props: any) => [value, 'Test Cases']}
                  labelFormatter={(label: string, payload: any) => {
                    // Show full module name in tooltip
                    if (payload && payload[0]) {
                      return payload[0].payload.module_name;
                    }
                    return label;
                  }}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="test_count" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
