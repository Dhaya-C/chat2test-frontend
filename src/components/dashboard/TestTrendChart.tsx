"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { TestGenerationTrend } from '@/types/dashboard';

type FilterDays = 7 | 30;

const STORAGE_KEY = 'dashboard_trend_filter';

interface TestTrendChartProps {
  data: TestGenerationTrend[] | null;
  loading?: boolean;
}

export function TestTrendChart({ data, loading = false }: TestTrendChartProps) {
  const [filterDays, setFilterDays] = useState<FilterDays>(30);

  // Load saved filter preference from localStorage
  useEffect(() => {
    const savedFilter = localStorage.getItem(STORAGE_KEY);
    if (savedFilter === '7' || savedFilter === '30') {
      setFilterDays(parseInt(savedFilter) as FilterDays);
    }
  }, []);

  // Handle filter change
  const handleFilterChange = (days: FilterDays) => {
    setFilterDays(days);
    localStorage.setItem(STORAGE_KEY, days.toString());
  };

  // Filter and format data based on selected days
  const chartData = React.useMemo(() => {
    if (!data) return [];
    
    // Get the cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - filterDays);
    
    // Filter data and format for display
    return data
      .filter(item => new Date(item.date) >= cutoffDate)
      .map(item => ({
        ...item,
        displayDate: new Date(item.date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
      }));
  }, [data, filterDays]);

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base">Test Generation Trend</CardTitle>
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <div className="px-3 py-1 text-sm bg-muted rounded animate-pulse w-16 h-6" />
            <div className="px-3 py-1 text-sm bg-muted rounded animate-pulse w-16 h-6" />
          </div>
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
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base">Test Generation Trend</CardTitle>
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          <button
            onClick={() => handleFilterChange(7)}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              filterDays === 7 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => handleFilterChange(30)}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              filterDays === 30 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            30 Days
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            No trend data available
          </div>
        ) : (
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(211, 100%, 43%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(211, 100%, 43%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="displayDate" 
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  allowDecimals={false}
                />
                <Tooltip 
                  formatter={(value: number) => [value, 'Tests Generated']}
                  labelFormatter={(label) => `Date: ${label}`}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="hsl(211, 100%, 43%)" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorCount)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
