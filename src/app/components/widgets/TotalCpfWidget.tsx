import { useMemo, useState } from 'react';
import { useSessionUrlFilter } from '@auth/useSessionUrlFilter';
import { useTheme } from '@mui/material/styles';
import { format } from 'date-fns';
import { KPICard } from '../../components/charts';
import { useTotalCpf } from '../../hooks/useDashboard';
import WidgetLoading from '../../components/ui/WidgetLoading';

interface TotalCpfWidgetProps {
  initialIsFavorite?: boolean;
}

export function TotalCpfWidget({ initialIsFavorite }: TotalCpfWidgetProps) {
  const theme = useTheme();
  const [selectedDate, setSelectedDate] = useSessionUrlFilter<Date | null>(
    'pessoas_cad_total_cpf_selectedDate',
    new Date(),
    (d) => (d ? d.toISOString() : ''),
    (s) => (s ? new Date(s) : null)
  );

  const apiDate = useMemo(() => {
    if (!selectedDate) return undefined;
    return format(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1), 'yyyy-MM-dd');
  }, [selectedDate]);

  const { data: totalCpfData, isLoading } = useTotalCpf(apiDate);

  const kpiData = useMemo(() => {
    if (!totalCpfData) return null;

    return {
      title: 'Total de Pessoas Físicas',
      value: totalCpfData.total || 0,
      subtitle: totalCpfData.message || 'pessoas físicas ativas',
      icon: 'heroicons-outline:identification',
      gradientColors: [theme.palette.info.main, theme.palette.info.dark] as [string, string],
      trend: {
        value: `${totalCpfData.percentageChange > 0 ? '+' : ''}${totalCpfData.percentageChange}% vs mês anterior`,
        isPositive: totalCpfData.percentageChange >= 0,
      },
      widgetId: 23,
    };
  }, [totalCpfData, theme]);

  if (isLoading) {
    return <WidgetLoading height={160} />;
  }

  if (!kpiData) {
    return null;
  }

  return (
    <KPICard
      {...kpiData}
      value={kpiData.value.toLocaleString('pt-BR')}
      showFilter={true}
      filterDate={selectedDate}
      onFilterChange={setSelectedDate}
      initialIsFavorite={initialIsFavorite}
    />
  );
}
