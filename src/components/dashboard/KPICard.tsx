import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  loading?: boolean;
}

export function KPICard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  iconColor = 'text-primary',
  loading = false 
}: KPICardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div className="text-2xl font-bold text-foreground">
          {loading ? (
            <div className="h-8 w-16 bg-muted animate-pulse rounded" />
          ) : (
            value
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}
