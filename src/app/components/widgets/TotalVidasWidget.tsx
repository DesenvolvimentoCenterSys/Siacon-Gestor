import { useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { format } from 'date-fns';
import { KPICard } from '../../components/charts';
import { useTotalVidas } from '../../hooks/useDashboard';
import WidgetLoading from '../../components/ui/WidgetLoading';

interface TotalVidasWidgetProps {
  initialIsFavorite?: boolean;
}

export function TotalVidasWidget({ initialIsFavorite }: TotalVidasWidgetProps) {
  const theme = useTheme();
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const apiDate = useMemo(() => {
    if (!selectedDate) return undefined;
    return format(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1), 'yyyy-MM-dd');
  }, [selectedDate]);

  const { data: totalVidasData, isLoading } = useTotalVidas(apiDate);

  const kpiData = useMemo(() => {
    if (!totalVidasData) return null;

    return {
      title: 'Total de Clientes Cadastrados',
      value: totalVidasData.total || 0,
      subtitle: totalVidasData.message || 'clientes ativos',
      icon: 'heroicons-outline:users',
      gradientColors: [theme.palette.secondary.main, theme.palette.secondary.dark] as [string, string],
      trend: {
        value: `${totalVidasData.percentageChange > 0 ? '+' : ''}${totalVidasData.percentageChange}% vs mês anterior`,
        isPositive: totalVidasData.percentageChange >= 0,
      },
      widgetId: 2,
    };
  }, [totalVidasData, theme]);

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
