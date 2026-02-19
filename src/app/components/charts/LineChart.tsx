import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, useTheme, IconButton, Tooltip } from '@mui/material';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import useUser from '@auth/useUser';
import { useToggleFavoriteWidget } from '../../hooks/useDashboard';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

type LineChartProps = {
  title?: string;
  series: {
    name: string;
    data: number[];
  }[];
  categories: string[];
  height?: number | string;
  colors?: string[];
  type?: 'line' | 'area';
  showGrid?: boolean;
  curve?: 'smooth' | 'straight' | 'stepline';
  yAxisFormatter?: (val: number) => string;
  widgetId?: number;
  initialIsFavorite?: boolean;
};

export default function LineChart({
  title,
  series,
  categories,
  height = 350,
  colors,
  type = 'area',
  showGrid = true,
  curve = 'smooth',
  yAxisFormatter,
  widgetId,
  initialIsFavorite = false
}: LineChartProps) {
  const theme = useTheme();
  const { data: user } = useUser();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const toggleFavoriteMutation = useToggleFavoriteWidget();

  useEffect(() => {
    setIsFavorite(initialIsFavorite);
  }, [initialIsFavorite]);

  const handleToggleFavorite = () => {
    if (!user?.id || !widgetId) return;

    const newStatus = !isFavorite;
    setIsFavorite(newStatus); // Optimistic update

    toggleFavoriteMutation.mutate(
      { codUsu: Number(user.id), widgetId, isFavorite: newStatus },
      {
        onError: () => {
          setIsFavorite(!newStatus); // Revert on error
        }
      }
    );
  };

  const chartOptions: ApexOptions = {
    chart: {
      type: type,
      fontFamily: theme.typography.fontFamily,
      toolbar: { show: false },
      animations: {
        enabled: true,
        speed: 800,
      },
      background: 'transparent',
    },
    colors: colors || [theme.palette.primary.main, theme.palette.secondary.main],
    fill: {
      type: type === 'area' ? 'gradient' : 'solid',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.6,
        opacityTo: 0.1,
        stops: [0, 90, 100],
      },
    },
    dataLabels: { enabled: false },
    stroke: {
      curve: curve,
      width: 3,
    },
    grid: {
      show: showGrid,
      borderColor: theme.palette.divider,
      strokeDashArray: 3,
      padding: { top: 0, right: 0, bottom: 0, left: 10 },
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    xaxis: {
      categories: categories,
      labels: {
        style: {
          colors: theme.palette.text.secondary,
          fontSize: '12px',
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: {
          colors: theme.palette.text.secondary,
          fontSize: '12px',
        },
        formatter: yAxisFormatter || ((val) => val.toString()),
      },
    },
    tooltip: {
      theme: theme.palette.mode,
      style: { fontSize: '12px' },
      x: { show: true },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      labels: { colors: theme.palette.text.primary },
      itemMargin: { horizontal: 10, vertical: 5 },
    },
    responsive: [
      {
        breakpoint: 600,
        options: {
          legend: {
            position: 'bottom',
            horizontalAlign: 'center',
          },
          xaxis: {
            labels: {
              style: {
                fontSize: '10px',
              },
            },
          },
        },
      },
    ],
  };

  return (
    <Card elevation={3} sx={{ height: '100%' }}>
      <CardContent sx={{ p: { xs: 2, md: 3 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          {title && (
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '1rem', md: '1.25rem' } }}>
              {title}
            </Typography>
          )}
          {widgetId && (
            <Tooltip title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}>
              <IconButton onClick={handleToggleFavorite} size="small" sx={{ minWidth: 44, minHeight: 44 }}>
                <FuseSvgIcon sx={{ color: isFavorite ? "#FFD700" : "inherit" }}>
                  {isFavorite ? 'heroicons-solid:star' : 'heroicons-outline:star'}
                </FuseSvgIcon>
              </IconButton>
            </Tooltip>
          )}
        </Box>
        <Box sx={{ flex: 1, minHeight: { xs: 300, md: height } }}>
          <Chart options={chartOptions} series={series} type={type} height="100%" />
        </Box>
      </CardContent>
    </Card>
  );
}
