import { useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { format } from 'date-fns';
import { KPICard } from '../../components/charts';
import { useFaturamentoMensal } from '../../hooks/useDashboard';
import WidgetLoading from '../../components/ui/WidgetLoading';

interface FaturamentoMensalWidgetProps {
  initialIsFavorite?: boolean;
}

export function FaturamentoMensalWidget({ initialIsFavorite }: FaturamentoMensalWidgetProps) {
  const theme = useTheme();
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const apiDate = useMemo(() => {
    if (!selectedDate) return undefined;
    return format(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1), 'yyyy-MM-dd');
  }, [selectedDate]);

  const { data: faturamentoData, isLoading } = useFaturamentoMensal(apiDate);

  const kpiData = useMemo(() => {
    if (!faturamentoData) return null;

    return {
      title: 'Faturamento Mensal',
      value: faturamentoData.total || 0,
      subtitle: faturamentoData.message || 'faturamento do mês',
      icon: 'heroicons-outline:currency-dollar',
      gradientColors: [theme.palette.info.main, theme.palette.info.dark] as [string, string],
      trend: {
        value: `${faturamentoData.percentageChange > 0 ? '+' : ''}${faturamentoData.percentageChange}% vs mês anterior`,
        isPositive: faturamentoData.percentageChange >= 0,
      },
      widgetId: 4,
    };
  }, [faturamentoData, theme]);

  if (isLoading) {
    return <WidgetLoading height={160} />;
  }

  if (!kpiData) {
    return null;
  }

  return (
    <KPICard
      {...kpiData}
      value={kpiData.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
      showFilter={true}
      filterDate={selectedDate}
      onFilterChange={setSelectedDate}
      initialIsFavorite={initialIsFavorite}
    />
  );
}
