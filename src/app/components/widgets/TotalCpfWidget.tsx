import { useMemo, useState } from 'react';
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
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

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
      subtitle: totalCpfData.message || 'registros ativos',
      icon: 'heroicons-outline:identification',
      gradientColors: [theme.palette.success.main, theme.palette.success.dark] as [string, string],
      trend: {
        value: `${totalCpfData.percentageChange > 0 ? '+' : ''}${totalCpfData.percentageChange}% vs mês anterior`,
        isPositive: totalCpfData.percentageChange >= 0,
      },
      widgetId: 4,
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
