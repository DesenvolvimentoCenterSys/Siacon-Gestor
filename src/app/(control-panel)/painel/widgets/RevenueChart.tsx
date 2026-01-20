'use client';

import { useState } from 'react';
import { Card, CardContent, Typography, Box, Tabs, Tab } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

function RevenueChart() {
  const theme = useTheme();
  const [period, setPeriod] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setPeriod(newValue);
  };

  const chartData = [
    {
      name: 'Este Ano',
      data: [
        450000, 480000, 520000, 510000, 540000, 580000,
        620000, 650000, 630000, 680000, 720000, 750000
      ],
      categories: [
        'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
        'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
      ],
    },
    {
      name: 'Último Trimestre',
      data: [680000, 720000, 750000],
      categories: ['Out', 'Nov', 'Dez'],
    },
    {
      name: 'Semestre Anterior',
      data: [450000, 480000, 520000, 510000, 540000, 580000],
      categories: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
    },
    {
      name: 'Mês Atual',
      data: [750000],
      categories: ['Dez'],
    },
  ];

  const currentData = chartData[period];

  const chartOptions: ApexOptions = {
    chart: {
      type: 'area',
      fontFamily: theme.typography.fontFamily,
      toolbar: { show: false },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
      },
    },
    dataLabels: { enabled: false },
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    colors: [theme.palette.secondary.main],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.6,
        opacityTo: 0.1,
        stops: [0, 90, 100],
      },
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 3,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      padding: { top: 10 },
    },
    xaxis: {
      categories: currentData.categories,
      labels: {
        style: {
          colors: theme.palette.text.secondary,
          fontSize: '11px',
          fontWeight: 500,
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: {
          colors: theme.palette.text.secondary,
          fontSize: '11px',
          fontWeight: 500,
        },
        formatter: (value) => `R$ ${(value / 1000).toFixed(0)}k`,
      },
    },
    tooltip: {
      theme: theme.palette.mode,
      y: {
        formatter: (value) => `R$ ${value.toLocaleString('pt-BR')}`,
      },
      style: {
        fontSize: '12px',
      },
      marker: {
        show: true,
      },
    },
  };

  return (
    <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.25rem', whiteSpace: 'nowrap' }}>
            Evolução de Faturamento
          </Typography>
          <Tabs
            value={period}
            onChange={handleChange}
            textColor="secondary"
            indicatorColor="secondary"
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              minHeight: 40,
              '& .MuiTab-root': {
                minHeight: 40,
                py: 0,
                fontSize: '0.9rem',
                fontWeight: 600,
                minWidth: 'auto',
                px: 2
              }
            }}
          >
            <Tab label="Ano" />
            <Tab label="Trimestre" />
            <Tab label="Semestre" />
            <Tab label="Mês" />
          </Tabs>
        </Box>
        <Box sx={{ flex: 1, minHeight: { xs: 250, sm: 300, md: 350, lg: 400, xl: 450 } }}>
          <Chart
            options={chartOptions}
            series={[{ name: 'Faturamento', data: currentData.data }]}
            type="area"
            height="100%"
          />
        </Box>
      </CardContent>
    </Card>
  );
}

export default RevenueChart;
