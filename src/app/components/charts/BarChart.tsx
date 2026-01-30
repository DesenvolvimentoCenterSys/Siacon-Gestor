import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, useTheme, IconButton, Tooltip } from '@mui/material';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import useUser from '@auth/useUser';
import { useToggleFavoriteWidget } from '../../hooks/useDashboard';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

type BarChartProps = {
  title?: string;
  series: {
    name: string;
    data: number[];
  }[];
  categories: string[];
  height?: number | string;
  colors?: string[];
  horizontal?: boolean;
  stacked?: boolean;
  yAxisFormatter?: (val: number) => string;
  widgetId?: number;
  initialIsFavorite?: boolean;
};

export default function BarChart({
  title,
  series,
  categories,
  height = 350,
  colors,
  horizontal = false,
  stacked = false,
  yAxisFormatter,
  widgetId,
  initialIsFavorite = false
}: BarChartProps) {
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
    setIsFavorite(newStatus);

    toggleFavoriteMutation.mutate(
      { codUsu: Number(user.id), widgetId, isFavorite: newStatus },
      {
        onError: () => {
          setIsFavorite(!newStatus);
        }
      }
    );
  };

  const chartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      stacked: stacked,
      fontFamily: theme.typography.fontFamily,
      toolbar: { show: false },
      background: 'transparent',
    },
    plotOptions: {
      bar: {
        horizontal: horizontal,
        columnWidth: '55%',
        borderRadius: 4,
        dataLabels: {
          position: 'top',
        },
      },
    },
    colors: colors || [theme.palette.primary.main, theme.palette.secondary.main, theme.palette.warning.main],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 3,
      xaxis: { lines: { show: horizontal } },
      yaxis: { lines: { show: !horizontal } },
      padding: { top: 0, right: 0, bottom: 0, left: 10 },
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
      y: {
        formatter: yAxisFormatter,
      },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      labels: { colors: theme.palette.text.primary },
    },
  };

  return (
    <Card elevation={3} sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          {title && (
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {title}
            </Typography>
          )}
          {widgetId && (
            <Tooltip title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}>
              <IconButton onClick={handleToggleFavorite} size="small">
                <FuseSvgIcon sx={{ color: isFavorite ? "#FFD700" : "inherit" }}>
                  {isFavorite ? 'heroicons-solid:star' : 'heroicons-outline:star'}
                </FuseSvgIcon>
              </IconButton>
            </Tooltip>
          )}
        </Box>
        <Box sx={{ flex: 1, minHeight: height }}>
          <Chart options={chartOptions} series={series} type="bar" height="100%" />
        </Box>
      </CardContent>
    </Card>
  );
}
