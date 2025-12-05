import React from 'react';
import { KPICard } from './KPICard';
import { KPI } from '@/types/dashboard';
import { 
  FolderOpen, 
  MessageCircle, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  Clock 
} from 'lucide-react';

interface KPICardsProps {
  kpi: KPI | null;
  loading?: boolean;
}

export function KPICards({ kpi, loading = false }: KPICardsProps) {
  const cards = [
    {
      title: 'Total Projects',
      value: kpi?.total_projects ?? 0,
      subtitle: `${kpi?.active_projects ?? 0} active`,
      icon: FolderOpen,
      iconColor: 'text-blue-600',
    },
    {
      title: 'Total Sessions',
      value: kpi?.total_sessions ?? 0,
      subtitle: 'Conversations',
      icon: MessageCircle,
      iconColor: 'text-green-600',
    },
    {
      title: 'Total Test Cases',
      value: kpi?.total_test_cases ?? 0,
      subtitle: 'Generated',
      icon: TestTube,
      iconColor: 'text-purple-600',
    },
    {
      title: 'Pass Rate',
      value: `${kpi?.pass_rate ?? 0}%`,
      subtitle: 'Success rate',
      icon: CheckCircle,
      iconColor: 'text-emerald-600',
    },
    {
      title: 'Failed Tests',
      value: kpi?.tests_failed ?? 0,
      subtitle: 'Need attention',
      icon: XCircle,
      iconColor: 'text-red-600',
    },
    {
      title: 'New Tests',
      value: kpi?.tests_pending ?? 0,
      subtitle: 'Not executed',
      icon: Clock,
      iconColor: 'text-orange-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
