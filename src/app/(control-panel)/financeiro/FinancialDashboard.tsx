'use client';

import { Box, Grid, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import KPICard from '../painel/widgets/KPICard';
import RevenueChart from '../painel/widgets/RevenueChart';
import RevenueForecastChart from './widgets/RevenueForecastChart';

function FinancialDashboard() {
  const theme = useTheme();

  const kpiData = [
    {
      title: 'Faturamento Total',
      value: 'R$ 750.450',
      subtitle: 'Acumulado no ano',
      icon: 'heroicons-outline:currency-dollar',
      gradientColors: [theme.palette.primary.main, theme.palette.primary.dark] as [string, string],
      trend: {
        value: '+15.3% vs ano anterior',
        isPositive: true,
      },
    },
    {
      title: 'Recebíveis Futuros',
      value: 'R$ 2.1M',
      subtitle: 'Próximos 3 meses',
      icon: 'heroicons-outline:calendar-days',
      gradientColors: ['#8b5cf6', '#6d28d9'] as [string, string],
      trend: {
        value: 'Previsão estável',
        isPositive: true,
      },
    },
    {
      title: 'Inadimplência',
      value: '2.4%',
      subtitle: 'Taxa atual',
      icon: 'heroicons-outline:exclamation-triangle',
      gradientColors: ['#ef4444', '#b91c1c'] as [string, string],
      trend: {
        value: '-0.5% vs mês anterior',
        isPositive: true,
      },
    },
    {
      title: 'Ticket Médio',
      value: 'R$ 485',
      subtitle: 'Por vida',
      icon: 'heroicons-outline:calculator',
      gradientColors: ['#10b981', '#059669'] as [string, string],
      trend: {
        value: '+2.1% vs mês anterior',
        isPositive: true,
      },
    },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" className="font-bold text-3xl tracking-tight">
          Acompanhamento de receitas e previsões
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 2, sm: 3 } }}>
        {kpiData.map((kpi, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <KPICard {...kpi} />
          </Grid>
        ))}
      </Grid>

      {/* Charts Grid */}
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {/* Row 1: Revenue History (Existing) */}
        <Grid item xs={12} md={12} lg={12}>
          <RevenueChart />
        </Grid>

        {/* Row 2: Revenue Forecast */}
        <Grid item xs={12} md={12} lg={12}>
          <RevenueForecastChart />
        </Grid>
      </Grid>
    </Box>
  );
}

export default FinancialDashboard;
