import { useMemo, useState } from 'react';
import { useTheme, alpha } from '@mui/material/styles';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { Card, CardContent, Typography, Box, IconButton, Tooltip, Menu, MenuItem, ListItemIcon, ListItemText, Button } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useEvolucaoFaturamento, useToggleFavoriteWidget } from '../../hooks/useDashboard';
import WidgetLoading from '../ui/WidgetLoading';
import useUser from '@auth/useUser';

interface EvolucaoFaturamentoChartWidgetProps {
  initialIsFavorite?: boolean;
}

export function EvolucaoFaturamentoChartWidget({ initialIsFavorite = false }: EvolucaoFaturamentoChartWidgetProps) {
  const theme = useTheme();
  const { data: user } = useUser();
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Year Filter Menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const handleClickMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleSelectYear = (year: number) => {
    setSelectedYear(year);
    handleCloseMenu();
  };

  // Generate last 5 years for filter
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  }, []);

  // Data Fetching
  const { data: chartData, isLoading } = useEvolucaoFaturamento(selectedYear);

  // Favorite Logic
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const toggleFavoriteMutation = useToggleFavoriteWidget();

  const handleToggleFavorite = () => {
    if (!user?.id) return;
    const newStatus = !isFavorite;
    setIsFavorite(newStatus);
    toggleFavoriteMutation.mutate(
      { codUsu: Number(user.id), widgetId: 7, isFavorite: newStatus },
      { onError: () => setIsFavorite(!newStatus) }
    );
  };

  const chartSeries = useMemo(() => {
    if (!chartData?.meses) return [];

    // Sort months to ensure correct order
    const sortedData = [...chartData.meses].sort((a, b) => a.mes - b.mes);

    return [
      {
        name: 'Valor Pago',
        data: sortedData.map(item => item.valorPago)
      },
      {
        name: 'Valor Previsto',
        data: sortedData.map(item => item.valorPrevisto)
      }
    ];
  }, [chartData]);

  const chartCategories = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    if (!chartData?.meses) return months;

    const sortedData = [...chartData.meses].sort((a, b) => a.mes - b.mes);
    return sortedData.map(item => months[item.mes - 1]);
  }, [chartData]);

  const chartOptions: ApexOptions = {
    chart: {
      type: 'area', // Changed to area for better visualization of evolution
      toolbar: { show: false },
      fontFamily: 'inherit',
      animations: {
        enabled: true
      }
    },
    colors: [theme.palette.success.main, theme.palette.info.main],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.9,
        stops: [0, 90, 100]
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    xaxis: {
      categories: chartCategories,
      labels: {
        style: {
          colors: theme.palette.text.secondary,
          fontSize: '12px'
        }
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: {
        style: {
          colors: theme.palette.text.secondary,
          fontSize: '12px'
        },
        formatter: (value) => {
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
      },
      xaxis: {
        lines: { show: false }
      }
    },
    tooltip: {
      theme: theme.palette.mode,
      y: {
        formatter: function (val) {
          return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        }
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      offsetY: 10,  // Added margin for legend
      itemMargin: {
        horizontal: 10,
        vertical: 5
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
          Evolução do Faturamento
        </Typography>
        <Box className="flex items-center gap-2">
          {/* Year Filter */}
          <Tooltip title="Filtrar por ano">
            <Button
              size="small"
              onClick={handleClickMenu}
              endIcon={<FuseSvgIcon size={16}>heroicons-outline:calendar</FuseSvgIcon>}
              sx={{
                mr: 2,
                borderRadius: 2,
                backgroundColor: (theme) => alpha(theme.palette.info.main, 0.1),
                color: 'info.main',
                textTransform: 'none',
                minWidth: 'auto',
                px: 2,
                '&:hover': {
                  backgroundColor: (theme) => alpha(theme.palette.info.main, 0.2),
                }
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {selectedYear}
              </Typography>
            </Button>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleCloseMenu}
          >
            {availableYears.map((year) => (
              <MenuItem key={year} onClick={() => handleSelectYear(year)} selected={year === selectedYear}>
                <ListItemText>{year}</ListItemText>
              </MenuItem>
            ))}
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
          type="area"
          height={320}
        />
      </CardContent>
    </Card>
  );
}
