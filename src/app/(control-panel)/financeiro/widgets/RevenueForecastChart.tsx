'use client';

import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

function RevenueForecastChart() {
  const theme = useTheme();

  const chartOptions: ApexOptions = {
    chart: {
      type: 'area',
      toolbar: { show: false },
      fontFamily: 'inherit',
      animations: {
        enabled: true,
        speed: 800,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
      width: 3,
      dashArray: [0, 5] // Solid line for actual, dashed for forecast
    },
    xaxis: {
      categories: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
      labels: {
        style: {
          colors: theme.palette.text.secondary,
          fontSize: '12px',
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: theme.palette.text.secondary,
        },
        formatter: (val) => `R$ ${(val / 1000).toFixed(0)}k`
      }
    },
    colors: ['#10b981', '#6366f1'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 90, 100]
      }
    },
    grid: {
      borderColor: theme.palette.divider,
      xaxis: {
        lines: { show: false },
      },
      yaxis: {
        lines: { show: true },
      },
    },
    tooltip: {
      theme: theme.palette.mode,
      y: {
        formatter: (val) => `R$ ${val.toLocaleString('pt-BR')}`,
      },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
    },
    annotations: {
      xaxis: [
        {
          x: 'Set',
          borderColor: '#999',
          label: {
            style: {
              color: '#fff',
              background: '#775DD0',
            },
            text: 'Previsão',
          }
        }
      ]
    }
  };

  const series = [
    {
      name: 'Realizado',
      data: [550000, 580000, 610000, 630000, 650000, 680000, 700000, 720000, 750000, null, null, null],
    },
    {
      name: 'Previsto',
      data: [null, null, null, null, null, null, null, null, 750000, 780000, 810000, 850000],
    },
  ];

  return (
    <Card sx={{ height: '100%', boxShadow: 3, borderRadius: 4 }}>
      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
          Previsão de Faturamento (Recebíveis)
        </Typography>
        <Box sx={{ flex: 1, minHeight: { xs: 300, sm: 350, md: 400, lg: 450 } }}>
          <Chart options={chartOptions} series={series} type="area" height="100%" />
        </Box>
      </CardContent>
    </Card>
  );
}

export default RevenueForecastChart;
