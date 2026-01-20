'use client';

import { Box, Grid, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import KPICard from '../painel/widgets/KPICard';
import AgeDemographicsChart from '../painel/widgets/AgeDemographicsChart';
import PersonTypeChart from './widgets/PersonTypeChart';
import GenderDistributionChart from './widgets/GenderDistributionChart';

function ClientsDashboard() {
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
      title: 'Pessoa Física',
      value: '5.230',
      subtitle: 'Beneficiários PF',
      icon: 'heroicons-outline:user',
      gradientColors: ['#3b82f6', '#1d4ed8'] as [string, string],
      trend: {
        value: '+5.1% vs mês anterior',
        isPositive: true,
      },
    },
    {
      title: 'Pessoa Jurídica',
      value: '2.620',
      subtitle: 'Beneficiários PJ',
      icon: 'heroicons-outline:building-office',
      gradientColors: ['#8b5cf6', '#6d28d9'] as [string, string],
      trend: {
        value: '+28.4% vs mês anterior',
        isPositive: true,
      },
    },
    {
      title: 'Novas Vidas',
      value: '342',
      subtitle: 'Neste mês',
      icon: 'heroicons-outline:user-plus',
      gradientColors: ['#10b981', '#047857'] as [string, string],
      trend: {
        value: '+2.3% vs mês anterior',
        isPositive: true,
      },
    },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" className="font-bold text-3xl tracking-tight">
          Visão geral da base de beneficiários
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
        {/* Row 1: Age Demographics + Gender Distribution */}
        <Grid item xs={12} md={6} lg={6}>
          <AgeDemographicsChart />
        </Grid>
        <Grid item xs={12} md={6} lg={6}>
          <GenderDistributionChart />
        </Grid>

        {/* Row 2: Person Type (PF vs PJ) */}
        <Grid item xs={12} md={12} lg={12}>
          <PersonTypeChart />
        </Grid>
      </Grid>
    </Box>
  );
}

export default ClientsDashboard;
