import React from 'react';

interface ReportHeaderProps {
  title?: string;
  subtitle?: string;
}

export function ReportHeader({
  title = 'Reports',
  subtitle = 'View and manage your test reports',
}: ReportHeaderProps) {
  return (
    <div className="flex justify-between items-start">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}
