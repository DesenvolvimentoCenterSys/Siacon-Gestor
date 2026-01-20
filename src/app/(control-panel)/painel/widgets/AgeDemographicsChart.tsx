'use client';

import { useState } from 'react';
import { Card, CardContent, Typography, Box, Tabs, Tab } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

function AgeDemographicsChart() {
  const theme = useTheme();
  const [filter, setFilter] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setFilter(newValue);
  };

  const chartData = [
    {
      name: 'Todos',
      series: [18, 22, 28, 20, 12],
    },
    {
      name: 'Masculino',
      series: [20, 25, 25, 18, 12],
    },
    {
      name: 'Feminino',
      series: [16, 19, 31, 22, 12],
    },
  ];

  const currentSeries = chartData[filter].series;
  const labels = ['0-18 anos', '19-30 anos', '31-45 anos', '46-60 anos', '60+ anos'];

  const chartOptions: ApexOptions = {
    chart: {
      type: 'donut',
      fontFamily: theme.typography.fontFamily,
      toolbar: { show: false },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
      },
    },
    labels: labels,
    colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
    legend: {
      position: 'bottom',
      fontSize: '12px',
      labels: {
        colors: theme.palette.text.primary,
      },
      itemMargin: {
        horizontal: 10,
        vertical: 5,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val.toFixed(0)}%`,
      style: {
        fontSize: '12px',
        fontWeight: 600,
        colors: ['#fff'],
      },
      dropShadow: { enabled: false },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              fontSize: '14px',
              fontWeight: 600,
              color: theme.palette.text.secondary,
              formatter: () => '100%',
            },
            value: {
              fontSize: '24px',
              fontWeight: 700,
              color: theme.palette.text.primary,
              offsetY: 5,
            },
          },
        },
      },
    },
    stroke: {
      show: false,
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: { height: 300 },
          legend: { position: 'bottom' },
        },
      },
    ],
  };

  return (
    <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.25rem' }}>
            Faixa Etária
          </Typography>
          <Tabs
            value={filter}
            onChange={handleChange}
            textColor="secondary"
            indicatorColor="secondary"
            sx={{
              minHeight: 40,
              '& .MuiTab-root': {
                minHeight: 40,
                py: 0,
                fontSize: '0.85rem',
                fontWeight: 600,
                px: 1.5, // Reduced padding
                minWidth: 'auto' // Allow tabs to shrink
              }
            }}
          >
            <Tab label="Geral" />
            <Tab label="Masc" />
            <Tab label="Fem" />
          </Tabs>
        </Box>
        <Box sx={{ flex: 1, minHeight: { xs: 300, sm: 350, md: 350, lg: 400, xl: 450 }, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Chart options={chartOptions} series={currentSeries} type="donut" height="100%" width="100%" />
        </Box>
      </CardContent>
    </Card>
  );
}

export default AgeDemographicsChart;
