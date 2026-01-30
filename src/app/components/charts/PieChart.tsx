import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, useTheme, IconButton, Tooltip } from '@mui/material';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import useUser from '@auth/useUser';
import { useToggleFavoriteWidget } from '../../hooks/useDashboard';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

type PieChartProps = {
  title?: string;
  series: number[];
  labels: string[];
  height?: number | string;
  colors?: string[];
  type?: 'pie' | 'donut';
  isDonut?: boolean;
  widgetId?: number;
  initialIsFavorite?: boolean;
};

export default function PieChart({
  title,
  series,
  labels,
  height = 350,
  colors,
  type,
  isDonut = false,
  widgetId,
  initialIsFavorite = false
}: PieChartProps) {
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

  const chartType = type || (isDonut ? 'donut' : 'pie');

  const chartOptions: ApexOptions = {
    chart: {
      type: chartType,
      fontFamily: theme.typography.fontFamily,
      background: 'transparent',
    },
    labels: labels,
    colors: colors || [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.warning.main,
      theme.palette.error.main,
      theme.palette.success.main,
      theme.palette.info.main
    ],
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: { fontSize: '14px', color: theme.palette.text.secondary },
            value: {
              fontSize: '20px',
              fontWeight: 700,
              color: theme.palette.text.primary,
              formatter: (val) => val.toString()
            },
            total: {
              show: chartType === 'donut',
              label: 'Total',
              color: theme.palette.text.secondary,
              formatter: function (w) {
                return w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0).toString()
              }
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: true,
      dropShadow: { enabled: false },
    },
    stroke: {
      show: true,
      colors: [theme.palette.background.paper],
      width: 2
    },
    legend: {
      position: 'bottom',
      labels: { colors: theme.palette.text.primary },
      markers: { size: 12 },
    },
    tooltip: {
      theme: theme.palette.mode,
      style: { fontSize: '12px' },
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
        <Box sx={{ flex: 1, minHeight: height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Chart options={chartOptions} series={series} type={chartType} height="100%" width="100%" />
        </Box>
      </CardContent>
    </Card>
  );
}
