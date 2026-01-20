'use client';

import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

function LivesByAgePerConvenioChart() {
  const theme = useTheme();

  const chartOptions: ApexOptions = {
    chart: {
      type: 'heatmap',
      toolbar: { show: false },
      fontFamily: 'inherit',
      animations: {
        enabled: true,
        speed: 800,
      },
    },
    dataLabels: {
      enabled: true,
      style: {
        colors: ['#fff'],
        fontSize: '12px',
        fontWeight: 600,
      }
    },
    xaxis: {
      categories: ['0-18', '19-29', '30-44', '45-59', '60-74', '75+'],
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
          fontSize: '12px',
          fontWeight: 600
        }
      }
    },
    colors: ['#3b82f6'],
    plotOptions: {
      heatmap: {
        shadeIntensity: 0.5,
        radius: 6,
        useFillColorAsStroke: true,
        colorScale: {
          ranges: [
            {
              from: 0,
              to: 100,
              name: 'Baixo',
              color: '#60a5fa' // Blue 400
            },
            {
              from: 101,
              to: 300,
              name: 'Médio',
              color: '#3b82f6' // Blue 500
            },
            {
              from: 301,
              to: 500,
              name: 'Alto',
              color: '#2563eb' // Blue 600
            },
            {
              from: 501,
              to: 1000,
              name: 'Muito Alto',
              color: '#1e40af' // Blue 800
            }
          ]
        }
      }
    },
    tooltip: {
      theme: theme.palette.mode,
      y: {
        formatter: (val) => `${val} vidas`,
      },
    },
  };

  const series = [
    {
      name: 'Unimed',
      data: [450, 620, 890, 540, 210, 140],
    },
    {
      name: 'Bradesco',
      data: [320, 410, 580, 390, 150, 70],
    },
    {
      name: 'SulAmérica',
      data: [210, 340, 420, 280, 120, 80],
    },
    {
      name: 'Amil',
      data: [150, 220, 290, 180, 90, 50],
    },
    {
      name: 'NotreDame',
      data: [90, 140, 180, 120, 70, 50],
    },
  ];

  return (
    <Card sx={{ height: '100%', boxShadow: 3, borderRadius: 4 }}>
      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
          Distribuição de Vidas por Faixa Etária e Convênio
        </Typography>
        <Box sx={{ flex: 1, minHeight: { xs: 350, sm: 400, md: 450, lg: 500 } }}>
          <Chart options={chartOptions} series={series} type="heatmap" height="100%" />
        </Box>
      </CardContent>
    </Card>
  );
}

export default LivesByAgePerConvenioChart;
