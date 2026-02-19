import { useMemo, useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { Card, CardContent, Typography, Box, IconButton, Tooltip, Menu, MenuItem, ListItemIcon, ListItemText, Checkbox } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useFaturamentoPorConvenio, useToggleFavoriteWidget } from '../../hooks/useDashboard';
import WidgetLoading from '../ui/WidgetLoading';
import useUser from '@auth/useUser';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

interface FaturamentoPorConvenioChartWidgetProps {
  initialIsFavorite?: boolean;
}

export function FaturamentoPorConvenioChartWidget({ initialIsFavorite = false }: FaturamentoPorConvenioChartWidgetProps) {
  const theme = useTheme();
  const { data: user } = useUser();
  const [dateRange, setDateRange] = useState({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });

  // Filter Menu State
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const handleClickMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleSelectPeriod = (months: number) => {
    const today = new Date();
    const start = startOfMonth(subMonths(today, months));
    const end = endOfMonth(today);

    setDateRange({
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(end, 'yyyy-MM-dd')
    });
    handleCloseMenu();
  };

  // Data Fetching
  const { data: chartData, isLoading } = useFaturamentoPorConvenio(dateRange.startDate, dateRange.endDate);

  // Favorite Logic
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const toggleFavoriteMutation = useToggleFavoriteWidget();

  const handleToggleFavorite = () => {
    if (!user?.id) return;
    const newStatus = !isFavorite;
    setIsFavorite(newStatus);
    toggleFavoriteMutation.mutate(
      { codUsu: Number(user.id), widgetId: 9, isFavorite: newStatus },
      { onError: () => setIsFavorite(!newStatus) }
    );
  };

  // Sort data by value (descending)
  const sortedData = useMemo(() => {
    if (!chartData) return [];
    return [...chartData].sort((a, b) => b.valorTotalFaturado - a.valorTotalFaturado);
  }, [chartData]);

  const chartSeries = useMemo(() => {
    if (!sortedData) return [];

    return [{
      name: 'Valor Faturado',
      data: sortedData.map(item => item.valorTotalFaturado)
    }];
  }, [sortedData]);

  const chartCategories = useMemo(() => {
    if (!sortedData) return [];
    return sortedData.map(item => item.nomeConvenio);
  }, [sortedData]);

  const chartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      fontFamily: 'inherit'
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '40%',
        distributed: true, // Use different colors for each bar
        horizontal: true // Horizontal columns (Bar Chart)
      }
    },
    colors: [
      '#BBDEFB', // Blue 100
      '#90CAF9', // Blue 200
      '#64B5F6', // Blue 300
      '#42A5F5', // Blue 400
      '#2196F3', // Blue 500
      '#1E88E5', // Blue 600
      '#1976D2', // Blue 700
      '#1565C0', // Blue 800
      '#0D47A1', // Blue 900
      '#01579B', // Light Blue 900 (Deep rich blue)
    ],
    dataLabels: {
      enabled: false
    },
    xaxis: {
      categories: chartCategories,
      labels: {
        style: {
          colors: theme.palette.text.secondary,
          fontSize: '12px'
        },
        formatter: (value) => {
          if (typeof value === 'string' && value.length > 10) {
            return value.substring(0, 10) + '...';
          }
          return value;
        }
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: {
        enabled: true // Show full text on hover of the label if supported, or rely on main tooltip
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: theme.palette.text.secondary,
          fontSize: '12px'
        },
        formatter: (value) => {
          if (typeof value !== 'number') return value;
          if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1)}M`;
          if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}k`;
          return `R$ ${value.toFixed(0)}`;
        }
      }
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 4,
      yaxis: {
        lines: { show: true }
      }
    },
    legend: {
      show: false // Hide legend as bars are labeled on x-axis
    },
    tooltip: {
      theme: theme.palette.mode,
      y: {
        formatter: function (val) {
          return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        }
      },
      x: {
        formatter: function (val) {
          return String(val);
        }
      }
    }
  };

  if (isLoading) return <WidgetLoading height={350} />;

  return (
    <Card
      className="w-full shadow-sm rounded-2xl overflow-hidden"
      elevation={0}
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box className="flex items-center justify-between px-6 py-4 border-b">
        <Typography className="text-lg font-semibold truncate text-primary">
          Faturamento por Convênio
        </Typography>
        <Box className="flex items-center gap-2">
          {/* Period Filter */}
          <Tooltip title="Filtrar por período">
            <IconButton size="small" onClick={handleClickMenu}>
              <FuseSvgIcon size={20}>heroicons-outline:calendar</FuseSvgIcon>
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleCloseMenu}
          >
            <MenuItem onClick={() => handleSelectPeriod(0)}>
              <ListItemText>Mês Atual</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleSelectPeriod(1)}>
              <ListItemText>Últimos 2 Meses</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleSelectPeriod(2)}>
              <ListItemText>Últimos 3 Meses</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleSelectPeriod(5)}>
              <ListItemText>Últimos 6 Meses</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleSelectPeriod(11)}>
              <ListItemText>Último Ano</ListItemText>
            </MenuItem>
          </Menu>

          {/* Favorite Toggle */}
          <Tooltip title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}>
            <IconButton onClick={handleToggleFavorite} size="small">
              <FuseSvgIcon sx={{ color: isFavorite ? "#FFD700" : "inherit" }} size={20}>
                {isFavorite ? 'heroicons-solid:star' : 'heroicons-outline:star'}
              </FuseSvgIcon>
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <CardContent className="p-6" sx={{ flexGrow: 1 }}>
        <ReactApexChart
          options={chartOptions}
          series={chartSeries}
          type="bar" // Using column chart
          height={320}
        />
      </CardContent>
    </Card>
  );
}
