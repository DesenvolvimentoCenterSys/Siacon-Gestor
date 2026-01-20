'use client';

import { Card, CardContent, Typography, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

function ServiceUtilizationChart() {
  const theme = useTheme();

  const chartData = {
    series: [
      {
        name: 'Taxa de Utilização',
        data: [78, 65, 42, 58],
      },
    ],
    categories: ['Consultas', 'Exames', 'Internações', 'Emergências'],
  };

  const chartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      fontFamily: theme.typography.fontFamily,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 8,
        barHeight: '70%',
        dataLabels: {
          position: 'top',
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val}%`,
      offsetX: 30,
      style: {
        fontSize: '11px',
        fontWeight: 600,
        colors: [theme.palette.text.primary],
      },
    },
    colors: ['#10b981'],
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 3,
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: false,
        },
      },
    },
    xaxis: {
      max: 100,
      labels: {
        style: {
          colors: theme.palette.text.secondary,
          fontSize: '11px',
        },
        formatter: (value) => `${value}%`,
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: theme.palette.text.secondary,
          fontSize: '12px',
          fontWeight: 500,
        },
      },
    },
    tooltip: {
      theme: theme.palette.mode,
      y: {
        formatter: (value) => `${value}%`,
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            height: 250,
          },
        },
      },
    ],
  };

  return (
    <Card elevation={3} sx={{ height: '100%' }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            mb: 2,
            fontSize: { xs: '1rem', sm: '1.25rem' },
          }}
        >
          Utilização por Tipo de Serviço
        </Typography>
        <Box sx={{ height: { xs: 250, sm: 280 } }}>
          <Chart
            options={chartOptions}
            series={chartData.series}
            type="bar"
            height="100%"
          />
        </Box>
      </CardContent>
    </Card>
  );
}

export default ServiceUtilizationChart;
