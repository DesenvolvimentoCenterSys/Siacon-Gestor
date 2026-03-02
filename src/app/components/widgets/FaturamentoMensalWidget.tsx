import { useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { format } from 'date-fns';
import { Box, Tabs, Tab } from '@mui/material';
import { KPICard } from '../../components/charts';
import { useFaturamentoMensal, useFaturamentoMensalReferencia } from '../../hooks/useDashboard';
import WidgetLoading from '../../components/ui/WidgetLoading';

interface FaturamentoMensalWidgetProps {
  initialIsFavorite?: boolean;
}

export function FaturamentoMensalWidget({ initialIsFavorite }: FaturamentoMensalWidgetProps) {
  const theme = useTheme();
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const apiDate = useMemo(() => {
    if (!selectedDate) return undefined;
    return format(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1), 'yyyy-MM-dd');
  }, [selectedDate]);

  const { data: faturamentoDataVencimento, isLoading: isLoadingVencimento } = useFaturamentoMensal(apiDate);
  const { data: faturamentoDataCompetencia, isLoading: isLoadingCompetencia } = useFaturamentoMensalReferencia(apiDate);

  const faturamentoData = tabIndex === 0 ? faturamentoDataVencimento : faturamentoDataCompetencia;
  const isLoading = tabIndex === 0 ? isLoadingVencimento : isLoadingCompetencia;

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
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          aria-label="faturamento mensal tabs"
          variant="fullWidth"
          sx={{ minHeight: 40, '& .MuiTab-root': { minHeight: 40, py: 0.5, fontSize: '0.8125rem' } }}
        >
          <Tab label="Por Vencimento" />
          <Tab label="Por Competência" />
        </Tabs>
      </Box>
      <Box sx={{ flexGrow: 1, mt: 1 }}>
        <KPICard
          {...kpiData}
          value={kpiData.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          showFilter={true}
          filterDate={selectedDate}
          onFilterChange={setSelectedDate}
          initialIsFavorite={initialIsFavorite}
        />
      </Box>
    </Box>
  );
}
