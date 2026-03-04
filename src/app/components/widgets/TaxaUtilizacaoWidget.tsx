import { useMemo } from 'react';
import { useSessionUrlFilter } from '@auth/useSessionUrlFilter';
import { useTheme } from '@mui/material/styles';
import { format } from 'date-fns';
import { KPICard } from '../../components/charts';
import { useTaxaUtilizacao } from '../../hooks/useDashboard';
import WidgetLoading from '../../components/ui/WidgetLoading';

interface TaxaUtilizacaoWidgetProps {
  initialIsFavorite?: boolean;
}

export function TaxaUtilizacaoWidget({ initialIsFavorite }: TaxaUtilizacaoWidgetProps) {
  const theme = useTheme();

  const [selectedDate, setSelectedDate] = useSessionUrlFilter<Date | null>(
    'convenios_taxa_selectedDate',
    new Date(),
    (d) => (d ? d.toISOString() : ''),
    (s) => (s ? new Date(s) : null)
  );

  const apiDate = useMemo(() => {
    if (!selectedDate) return undefined;
    return format(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1), 'yyyy-MM-dd');
  }, [selectedDate]);

  const { data: taxaData, isLoading } = useTaxaUtilizacao(apiDate);

  const kpiData = useMemo(() => {
    if (!taxaData) return null;

    return {
      title: 'Taxa de Utilização',
      value: taxaData.rate ? `${taxaData.rate.toFixed(1)}%` : '0.0%',
      subtitle: taxaData.message || 'taxa de uso mensal',
      icon: 'heroicons-outline:chart-bar',
      gradientColors: [theme.palette.info.main, theme.palette.info.dark] as [string, string],
      trend: {
        value: `${taxaData.percentageChange > 0 ? '+' : ''}${taxaData.percentageChange}% vs mês anterior`,
        isPositive: taxaData.percentageChange >= 0,
      },
      widgetId: 5,
    };
  }, [taxaData, theme]);

  if (isLoading) {
    return <WidgetLoading height={160} />;
  }

  if (!kpiData) {
    return null;
  }

  return (
    <KPICard
      {...kpiData}
      value={kpiData.value as string}
      showFilter={true}
      filterDate={selectedDate}
      onFilterChange={setSelectedDate}
      initialIsFavorite={initialIsFavorite}
    />
  );
}
