import { useMemo } from 'react';
import { useSessionUrlFilter } from '@auth/useSessionUrlFilter';
import { useTheme } from '@mui/material/styles';
import { format } from 'date-fns';
import { Box, Tabs, Tab, Card } from '@mui/material';
import { KPICard } from '../../components/charts';
import { useFaturamentoMensal, useFaturamentoMensalReferencia } from '../../hooks/useDashboard';
import WidgetLoading from '../../components/ui/WidgetLoading';

interface FaturamentoMensalWidgetProps {
  initialIsFavorite?: boolean;
}

export function FaturamentoMensalWidget({ initialIsFavorite }: FaturamentoMensalWidgetProps) {
  const theme = useTheme();
  const [selectedDate, setSelectedDate] = useSessionUrlFilter<Date | null>(
    'financeiro_fat_mensal_selectedDate',
    new Date(),
    (d) => (d ? d.toISOString() : ''),
    (s) => (s ? new Date(s) : null)
  );

  const [tabIndex, setTabIndex] = useSessionUrlFilter<number>(
    'financeiro_fat_mensal_tabIndex',
    0,
    String,
    Number
  );

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
    <Card
      elevation={3}
      sx={{
        height: '100%',
        p: 0,
        background: `linear-gradient(135deg, ${kpiData.gradientColors[0]} 0%, ${kpiData.gradientColors[1]} 100%)`,
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) => theme.shadows[8],
        },
      }}
    >
      <Box sx={{ borderBottom: 1, borderColor: 'rgba(255,255,255,0.2)', bgcolor: 'rgba(0,0,0,0.1)' }}>
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          aria-label="faturamento mensal tabs"
          variant="fullWidth"
          textColor="inherit"
          TabIndicatorProps={{ style: { backgroundColor: 'white' } }}
          sx={{
            minHeight: 40,
            '& .MuiTab-root': {
              minHeight: 40,
              py: 0.5,
              fontSize: '0.8125rem',
              color: 'rgba(255,255,255,0.7)',
              '&.Mui-selected': { color: 'white' }
            }
          }}
        >
          <Tab label="Por Vencimento" />
          <Tab label="Por Competência" />
        </Tabs>
      </Box>
      <Box sx={{ flexGrow: 1, height: 'calc(100% - 40px)', '& .MuiCard-root': { boxShadow: 'none', background: 'transparent', height: '100%' } }}>
        <KPICard
          {...kpiData}
          value={kpiData.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          showFilter={true}
          filterDate={selectedDate}
          onFilterChange={setSelectedDate}
          initialIsFavorite={initialIsFavorite}
        />
      </Box>
    </Card>
  );
}
