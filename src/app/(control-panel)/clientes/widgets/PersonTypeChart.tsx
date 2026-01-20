'use client';

import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

function PersonTypeChart() {
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
        barHeight: '50%',
        distributed: true,
      },
    },
    dataLabels: {
      enabled: true,
      textAnchor: 'start',
      style: {
        colors: ['#fff'],
        fontSize: '14px',
        fontWeight: 600,
      },
      formatter: function (val, opt) {
        return opt.w.globals.labels[opt.dataPointIndex] + ":  " + val;
      },
      offsetX: 0,
    },
    xaxis: {
      categories: ['Pessoa Física', 'Pessoa Jurídica'],
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
    colors: ['#3b82f6', '#8b5cf6'],
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
      data: [5230, 2620],
    },
  ];

  return (
    <Card sx={{ height: '100%', boxShadow: 3, borderRadius: 4 }}>
      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Pessoa Física vs Jurídica
          </Typography>
        </Box>
        <Box sx={{ flex: 1, minHeight: { xs: 250, sm: 300, md: 350 } }}>
          <Chart options={chartOptions} series={series} type="bar" height="100%" />
        </Box>
      </CardContent>
    </Card>
  );
}

export default PersonTypeChart;
