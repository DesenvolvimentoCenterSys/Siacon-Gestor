'use client';

import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

function GenderDistributionChart() {
  const theme = useTheme();

  const chartOptions: ApexOptions = {
    chart: {
      type: 'donut',
      fontFamily: 'inherit',
      animations: {
        enabled: true,
        speed: 800,
      },
    },
    labels: ['Masculino', 'Feminino'],
    colors: ['#3b82f6', '#ec4899'],
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '14px',
              fontWeight: 600,
              color: theme.palette.text.secondary,
            },
            value: {
              show: true,
              fontSize: '28px',
              fontWeight: 700,
              color: theme.palette.text.primary,
            },
            total: {
              show: true,
              label: 'Total',
              color: theme.palette.text.secondary,
              formatter: function (w) {
                return w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0).toString();
              },
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number) {
        return val.toFixed(1) + "%";
      },
    },
    legend: {
      position: 'bottom',
      fontFamily: 'inherit',
      labels: {
        colors: theme.palette.text.secondary,
      },
    },
    stroke: {
      show: false,
    },
    tooltip: {
      theme: theme.palette.mode,
      y: {
        formatter: (val) => `${val} vidas`,
      },
    },
  };

  const series = [3689, 4161]; // Mock data

  return (
    <Card sx={{ height: '100%', boxShadow: 3, borderRadius: 4 }}>
      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
          Distribuição por Sexo
        </Typography>
        <Box sx={{ flex: 1, minHeight: { xs: 300, sm: 350, md: 350, lg: 400, xl: 450 }, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Chart options={chartOptions} series={series} type="donut" height="100%" width="100%" />
        </Box>
      </CardContent>
    </Card>
  );
}

export default GenderDistributionChart;
