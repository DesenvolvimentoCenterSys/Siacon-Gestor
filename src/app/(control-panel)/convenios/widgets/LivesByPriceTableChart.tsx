'use client';

import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

function LivesByPriceTableChart() {
  const theme = useTheme();

  const chartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      stacked: true,
      toolbar: { show: false },
      fontFamily: 'inherit',
      animations: {
        enabled: true,
        speed: 800,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 4,
        columnWidth: '50%',
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: ['Unimed', 'Bradesco', 'SulAmérica', 'Amil', 'NotreDame'],
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
        }
      }
    },
    colors: ['#3b82f6', '#10b981', '#f59e0b'],
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
        formatter: (val) => `${val} vidas`,
      },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
    }
  };

  const series = [
    {
      name: 'Enfermaria',
      data: [1500, 800, 600, 500, 400],
    },
    {
      name: 'Apartamento',
      data: [1000, 900, 700, 400, 200],
    },
    {
      name: 'VIP',
      data: [350, 220, 150, 80, 50],
    },
  ];

  return (
    <Card sx={{ height: '100%', boxShadow: 3, borderRadius: 4 }}>
      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
          Vidas por Tabela de Preço
        </Typography>
        <Box sx={{ flex: 1, minHeight: { xs: 300, sm: 350, md: 400, lg: 450 } }}>
          <Chart options={chartOptions} series={series} type="bar" height="100%" />
        </Box>
      </CardContent>
    </Card>
  );
}

export default LivesByPriceTableChart;
