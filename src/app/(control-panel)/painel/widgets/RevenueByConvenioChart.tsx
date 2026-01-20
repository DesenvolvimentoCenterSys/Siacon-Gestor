'use client';

import { useState } from 'react';
import { Card, CardContent, Typography, Box, Tab, Tabs, useTheme } from '@mui/material';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

function RevenueByConvenioChart() {
  const theme = useTheme();
  const [period, setPeriod] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setPeriod(newValue);
  };

  const data = [
    {
      name: 'Este Mês',
      data: [45000, 85000, 32000], // Sindical, Unimed, OdontoPrev
    },
    {
      name: 'Últimos 3 Meses',
      data: [135000, 250000, 95000],
    },
    {
      name: 'Semestral',
      data: [280000, 520000, 190000],
    },
    {
      name: 'Este Ano',
      data: [540000, 980000, 380000],
    },
  ];

  const currentData = data[period].data;

  const chartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      fontFamily: theme.typography.fontFamily,
      toolbar: { show: false },
      animations: {
        enabled: true,
        speed: 800,
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: '50%',
        distributed: true, // Different colors for each bar
        dataLabels: {
          position: 'top',
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => {
        if (val >= 1000000) return `R$ ${(val / 1000000).toFixed(1)}M`;
        if (val >= 1000) return `R$ ${(val / 1000).toFixed(0)}k`;
        return `R$ ${val}`;
      },
      offsetY: -20,
      style: {
        fontSize: '14px',
        colors: [theme.palette.text.primary],
        fontWeight: 700,
      },
    },
    colors: [
      '#3b82f6', // Blue for Sindical
      '#10b981', // Green for Unimed
      '#f59e0b', // Amber for OdontoPrev
    ],
    xaxis: {
      categories: ['Contr. Sindical', 'Unimed', 'OdontoPrev'],
      labels: {
        style: {
          colors: theme.palette.text.secondary,
          fontSize: '13px',
          fontWeight: 600,
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        formatter: (val: number) => {
          if (val >= 1000000) return `R$ ${(val / 1000000).toFixed(1)}M`;
          if (val >= 1000) return `R$ ${(val / 1000).toFixed(0)}k`;
          return `R$ ${val}`;
        },
        style: {
          colors: theme.palette.text.secondary,
          fontSize: '12px',
        },
      },
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 4,
      yaxis: { lines: { show: true } },
      xaxis: { lines: { show: false } },
      padding: { top: 20 },
    },
    tooltip: {
      theme: theme.palette.mode,
      y: {
        formatter: (val: number) => `R$ ${val.toLocaleString('pt-BR')}`,
      },
    },
    legend: { show: false },
  };

  return (
    <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.25rem', whiteSpace: 'nowrap' }}>
            Faturamento por Convênio
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
            <Tab label="Mês" />
            <Tab label="Trimestre" />
            <Tab label="Semestral" />
            <Tab label="Ano" />
          </Tabs>
        </Box>

        <Box sx={{ flex: 1, minHeight: { xs: 300, sm: 350, md: 350, lg: 400, xl: 450 } }}>
          <Chart
            options={chartOptions}
            series={[{ name: 'Faturamento', data: currentData }]}
            type="bar"
            height="100%"
          />
        </Box>
      </CardContent>
    </Card>
  );
}

export default RevenueByConvenioChart;
