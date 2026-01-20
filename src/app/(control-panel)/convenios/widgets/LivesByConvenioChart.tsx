'use client';

import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

function LivesByConvenioChart() {
  const theme = useTheme();

  const chartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      fontFamily: 'inherit',
      animations: {
        enabled: true,
        speed: 800,
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 6,
        barHeight: '60%',
        distributed: true,
      },
    },
    dataLabels: {
      enabled: true,
      textAnchor: 'start',
      style: {
        colors: ['#fff'],
        fontSize: '12px',
        fontWeight: 600,
      },
      formatter: function (val, opt) {
        return opt.w.globals.labels[opt.dataPointIndex] + ":  " + val;
      },
      offsetX: 0,
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
        show: false
      }
    },
    colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
    grid: {
      borderColor: theme.palette.divider,
      xaxis: {
        lines: { show: true },
      },
      yaxis: {
        lines: { show: false },
      },
    },
    tooltip: {
      theme: theme.palette.mode,
      y: {
        formatter: (val) => `${val} vidas`,
      },
    },
    legend: {
      show: false
    }
  };

  const series = [
    {
      name: 'Vidas',
      data: [2850, 1920, 1450, 980, 650],
    },
  ];

  return (
    <Card sx={{ height: '100%', boxShadow: 3, borderRadius: 4 }}>
      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
          Total de Vidas por Convênio
        </Typography>
        <Box sx={{ flex: 1, minHeight: { xs: 300, sm: 350, md: 350, lg: 400, xl: 450 } }}>
          <Chart options={chartOptions} series={series} type="bar" height="100%" />
        </Box>
      </CardContent>
    </Card>
  );
}

export default LivesByConvenioChart;
