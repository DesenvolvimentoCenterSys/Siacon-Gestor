import { useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { format } from 'date-fns';
import { KPICard } from '../../components/charts';
import { useMensalidadeMedia } from '../../hooks/useDashboard';
import WidgetLoading from '../../components/ui/WidgetLoading';

interface MensalidadeMediaWidgetProps {
  initialIsFavorite?: boolean;
}

export function MensalidadeMediaWidget({ initialIsFavorite }: MensalidadeMediaWidgetProps) {
  const theme = useTheme();
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const apiDate = useMemo(() => {
    if (!selectedDate) return undefined;
    return format(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1), 'yyyy-MM-dd');
  }, [selectedDate]);

  const { data: mensalidadeData, isLoading } = useMensalidadeMedia(apiDate);

  const kpiData = useMemo(() => {
    if (!mensalidadeData) return null;

    return {
      title: 'Mensalidade Média',
      value: mensalidadeData.average || 0,
      subtitle: mensalidadeData.message || 'média mensal',
      icon: 'heroicons-outline:currency-dollar',
      // Using info (blue) as requested
      gradientColors: [theme.palette.info.main, theme.palette.info.dark] as [string, string],
      trend: {
        value: `${mensalidadeData.percentageChange > 0 ? '+' : ''}${mensalidadeData.percentageChange}% vs mês anterior`,
        isPositive: mensalidadeData.percentageChange >= 0,
      },
      widgetId: 6,
    };
  }, [mensalidadeData, theme]);

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
