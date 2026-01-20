'use client';

import { Box, Grid, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import KPICard from '../painel/widgets/KPICard';
import RevenueByConvenioChart from '../painel/widgets/RevenueByConvenioChart';
import LivesByConvenioChart from './widgets/LivesByConvenioChart';
import LivesByAgePerConvenioChart from './widgets/LivesByAgePerConvenioChart';
import LivesByPriceTableChart from './widgets/LivesByPriceTableChart';

function ConveniosDashboard() {
  const theme = useTheme();

  const kpiData = [
    {
      title: 'Faturamento Total',
      value: 'R$ 750k',
      subtitle: 'Por convênio',
      icon: 'heroicons-outline:currency-dollar',
      gradientColors: [theme.palette.primary.main, theme.palette.primary.dark] as [string, string],
      trend: {
        value: '+8.3% vs mês anterior',
        isPositive: true,
      },
    },
    {
      title: 'Total de Vidas',
      value: '7.850',
      subtitle: 'Distribuídas por convênio',
      icon: 'heroicons-outline:users',
      gradientColors: [theme.palette.secondary.main, theme.palette.secondary.dark] as [string, string],
      trend: {
        value: '+12.5% vs mês anterior',
        isPositive: true,
      },
    },
    {
      title: 'Convênio Principal',
      value: 'Unimed',
      subtitle: 'Maior faturamento',
      icon: 'heroicons-outline:star',
      gradientColors: ['#f59e0b', '#d97706'] as [string, string],
      trend: {
        value: '35% do total',
        isPositive: true,
      },
    },
    {
      title: 'Ticket Médio',
      value: 'R$ 485',
      subtitle: 'Geral',
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
          Análise detalhada por operadora
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
        {/* Row 1: Revenue by Convenio + Lives by Convenio */}
        <Grid item xs={12} md={6} lg={6}>
          <RevenueByConvenioChart />
        </Grid>
        <Grid item xs={12} md={6} lg={6}>
          <LivesByConvenioChart />
        </Grid>

        {/* Row 2: Lives by Age per Convenio */}
        <Grid item xs={12} md={12} lg={12}>
          <LivesByAgePerConvenioChart />
        </Grid>

        {/* Row 3: Lives by Price Table */}
        <Grid item xs={12} md={12} lg={12}>
          <LivesByPriceTableChart />
        </Grid>
      </Grid>
    </Box>
  );
}

export default ConveniosDashboard;
