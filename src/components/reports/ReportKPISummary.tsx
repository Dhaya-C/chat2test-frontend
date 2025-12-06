import React from 'react';
import { KPICard } from '@/components/dashboard/KPICard';
import { KPISummary } from '@/types/reports';
import { BarChart3, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';

interface ReportKPISummaryProps {
  kpiSummary: KPISummary | null;
  loading?: boolean;
}

export function ReportKPISummary({ kpiSummary, loading = false }: ReportKPISummaryProps) {
  const cards = [
    {
      title: 'Total Test Cases',
      value: kpiSummary?.total_test_cases ?? 0,
      subtitle: 'Generated',
      icon: BarChart3,
      iconColor: 'text-blue-600',
    },
    {
      title: 'Tests Passed',
      value: kpiSummary?.total_passed ?? 0,
      subtitle: 'Successful',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
    },
    {
      title: 'Tests Failed',
      value: kpiSummary?.total_failed ?? 0,
      subtitle: 'Need attention',
      icon: XCircle,
      iconColor: 'text-red-600',
    },
    {
      title: 'Pass Rate',
      value: `${(kpiSummary?.overall_pass_rate ?? 0).toFixed(1)}%`,
      subtitle: 'Success rate',
      icon: TrendingUp,
      iconColor: 'text-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <KPICard
          key={index}
          title={card.title}
          value={card.value}
          subtitle={card.subtitle}
          icon={card.icon}
          iconColor={card.iconColor}
          loading={loading}
        />
      ))}
    </div>
  );
}
