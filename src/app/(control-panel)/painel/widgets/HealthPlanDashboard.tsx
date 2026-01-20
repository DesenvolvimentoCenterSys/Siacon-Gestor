'use client';

import { Box, Grid } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import KPICard from './KPICard';
import AgeDemographicsChart from './AgeDemographicsChart';
import RevenueChart from './RevenueChart';
import MonthlyFeeDistribution from './MonthlyFeeDistribution';
import RevenueByConvenioChart from './RevenueByConvenioChart';

function HealthPlanDashboard() {
  const theme = useTheme();

  const kpiData = [
    {
      title: 'Total de Vidas',
      value: '7.850',
      subtitle: 'Beneficiários ativos',
      icon: 'heroicons-outline:users',
      gradientColors: [theme.palette.secondary.main, theme.palette.secondary.dark] as [string, string],
      trend: {
        value: '+12.5% vs mês anterior',
        isPositive: true,
      },
    },
    {
      title: 'Faturamento Mensal',
      value: 'R$ 750k',
      subtitle: 'Mensalidades recebidas',
      icon: 'heroicons-outline:currency-dollar',
      gradientColors: ['#10b981', '#059669'] as [string, string],
      trend: {
        value: '+8.3% vs mês anterior',
        isPositive: true,
      },
    },
    {
      title: 'Taxa de Utilização',
      value: '68%',
      subtitle: 'Índice de sinistralidade',
      icon: 'heroicons-outline:chart-bar',
      gradientColors: ['#f59e0b', '#d97706'] as [string, string],
      trend: {
        value: '-2.1% vs mês anterior',
        isPositive: true,
      },
    },
    {
      title: 'Mensalidade Média',
      value: 'R$ 485',
      subtitle: 'Por beneficiário',
      icon: 'heroicons-outline:calculator',
      gradientColors: ['#8b5cf6', '#7c3aed'] as [string, string],
      trend: {
        value: '+5.2% vs mês anterior',
        isPositive: true,
      },
    },
  ];

  return (
    <Box sx={{ width: '100%' }}>
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
        {/* Row 1: Revenue (Wide) + Age (Compact) */}
        <Grid item xs={12} md={12} lg={8}>
          <RevenueChart />
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <AgeDemographicsChart />
        </Grid>

        {/* Row 2: Monthly + Convenio (Equal width) */}
        <Grid item xs={12} md={6} lg={6}>
          <MonthlyFeeDistribution />
        </Grid>
        <Grid item xs={12} md={6} lg={6}>
          <RevenueByConvenioChart />
        </Grid>
      </Grid>
    </Box>
  );
}

export default HealthPlanDashboard;
