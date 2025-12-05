"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { SessionsByType } from '@/types/dashboard';

interface SessionTypeChartProps {
  data: SessionsByType | null;
  loading?: boolean;
}

const COLORS = {
  quick_session: 'hsl(211, 100%, 43%)',       // Primary blue
  test_case_discovery: 'hsl(173, 58%, 39%)',  // Teal
  general_chat: 'hsl(38, 92%, 50%)',          // Orange
};

export function SessionTypeChart({ data, loading = false }: SessionTypeChartProps) {
  // Order: Test Discovery, Quick Session, General Chat
  const chartData = data ? [
    { name: 'Test Discovery', value: data.test_case_discovery, color: COLORS.test_case_discovery },
    { name: 'Quick Session', value: data.quick_session, color: COLORS.quick_session },
    { name: 'General Chat', value: data.general_chat, color: COLORS.general_chat },
  ].filter(item => item.value > 0) : [];

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  // Explicit legend payload to control order and colors in the legend
  const legendPayload = chartData.map(item => ({ value: item.name, type: 'square', color: item.color }));

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sessions by Type</CardTitle>
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
        <CardTitle className="text-base">Sessions by Type</CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            No session data available
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
                  formatter={(value: number) => [value, 'Sessions']}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend 
                  {...({ payload: legendPayload } as any)}
                  itemSorter={() => 0}
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
