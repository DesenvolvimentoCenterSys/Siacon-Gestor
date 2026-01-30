import { useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { format } from 'date-fns';
import { KPICard } from '../../components/charts';
import { useTotalEmpresas } from '../../hooks/useDashboard';
import WidgetLoading from '../../components/ui/WidgetLoading';

interface TotalEmpresasWidgetProps {
  initialIsFavorite?: boolean;
}

export function TotalEmpresasWidget({ initialIsFavorite }: TotalEmpresasWidgetProps) {
  const theme = useTheme();
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const apiDate = useMemo(() => {
    if (!selectedDate) return undefined;
    return format(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1), 'yyyy-MM-dd');
  }, [selectedDate]);

  const { data: totalEmpresasData, isLoading } = useTotalEmpresas(apiDate);

  const kpiData = useMemo(() => {
    if (!totalEmpresasData) return null;

    return {
      title: 'Total de Empresas',
      value: totalEmpresasData.total || 0,
      subtitle: totalEmpresasData.message || 'empresas ativas',
      icon: 'heroicons-outline:building-office-2',
      gradientColors: [theme.palette.info.main, theme.palette.info.dark] as [string, string],
      trend: {
        value: `${totalEmpresasData.percentageChange > 0 ? '+' : ''}${totalEmpresasData.percentageChange}% vs mês anterior`,
        isPositive: totalEmpresasData.percentageChange >= 0,
      },
      widgetId: 3,
    };
  }, [totalEmpresasData, theme]);

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
