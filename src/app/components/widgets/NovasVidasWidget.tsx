import { useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { format } from 'date-fns';
import { KPICard } from '../../components/charts';
import { useNovasVidas } from '../../hooks/useDashboard';
import WidgetLoading from '../../components/ui/WidgetLoading';

interface NovasVidasWidgetProps {
  initialIsFavorite?: boolean;
}

export function NovasVidasWidget({ initialIsFavorite }: NovasVidasWidgetProps) {
  const theme = useTheme();
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const apiDate = useMemo(() => {
    if (!selectedDate) return undefined;
    return format(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1), 'yyyy-MM-dd');
  }, [selectedDate]);

  const { data: novasVidasData, isLoading } = useNovasVidas(apiDate);

  const kpiData = useMemo(() => {
    if (novasVidasData === undefined) return null;

    return {
      title: 'Novos Cadastros',
      value: novasVidasData.total || 0,
      subtitle: `PF: ${novasVidasData.quantidadePF} | PJ: ${novasVidasData.quantidadePJ}`,
      icon: 'heroicons-outline:user-plus',
      gradientColors: [theme.palette.info.main, theme.palette.info.dark] as [string, string],
      // No trend data provided in DTO
      trend: {
        value: 'novos cadastros',
        isPositive: true, // Neutral/Positive indicator
      },
      widgetId: 12,
    };
  }, [novasVidasData, theme]);

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
