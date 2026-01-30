import { useMemo, useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { Card, CardContent, Typography, Box, IconButton, Tooltip, Menu, MenuItem } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useClientesPorFaixaEtaria, useToggleFavoriteWidget } from '../../hooks/useDashboard';
import WidgetLoading from '../ui/WidgetLoading';
import useUser from '@auth/useUser';
import { format } from 'date-fns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { Dialog, DialogContent, DialogActions, Button, Divider, ListItemIcon, ListItemText } from '@mui/material';

interface AgeGroupChartWidgetProps {
  initialIsFavorite?: boolean;
}

export function AgeGroupChartWidget({ initialIsFavorite = false }: AgeGroupChartWidgetProps) {
  const theme = useTheme();
  const { data: user } = useUser();
  const [filterDate, setFilterDate] = useState<Date>(new Date());
  const [refetchCounter, setRefetchCounter] = useState(0);

  const apiDate = useMemo(() => {
    return format(new Date(filterDate.getFullYear(), filterDate.getMonth(), 1), 'yyyy-MM-dd');
  }, [filterDate]);

  // Filter Menu State
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(filterDate);

  const handleClickMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleSelectMonth = (monthsAgo: number) => {
    const newDate = new Date();
    newDate.setMonth(newDate.getMonth() - monthsAgo);
    setFilterDate(newDate);
    setRefetchCounter(prev => prev + 1); // Force refetch
    handleCloseMenu();
  };

  const handleCustomDateClick = () => {
    handleCloseMenu();
    setDatePickerOpen(true);
  };

  const handleDatePickerClose = () => {
    setDatePickerOpen(false);
    setTempDate(filterDate);
  };

  const handleDatePickerConfirm = () => {
    if (tempDate) {
      setFilterDate(tempDate);
      setRefetchCounter(prev => prev + 1); // Force refetch
    }
    setDatePickerOpen(false);
  };

  // Sync tempDate with filterDate when it changes
  useEffect(() => {
    setTempDate(filterDate);
  }, [filterDate]);

  // Data Fetching - include counter in key to force refetch
  const { data: chartData, isLoading } = useClientesPorFaixaEtaria(apiDate + `-${refetchCounter}`);

  // Favorite Logic
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const toggleFavoriteMutation = useToggleFavoriteWidget();

  const handleToggleFavorite = () => {
    if (!user?.id) return;
    const newStatus = !isFavorite;
    setIsFavorite(newStatus);
    toggleFavoriteMutation.mutate(
      { codUsu: Number(user.id), widgetId: 8, isFavorite: newStatus },
      { onError: () => setIsFavorite(!newStatus) }
    );
  };

  const chartSeries = useMemo(() => {
    if (!chartData) return [];
    return [{
      name: 'Quantidade',
      data: chartData.map(item => item.quantidade)
    }];
  }, [chartData]);

  const chartCategories = useMemo(() => {
    if (!chartData) return [];
    return chartData.map(item => item.faixa);
  }, [chartData]);

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
        distributed: true // Use different colors for each bar
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
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.5,
        // gradientToColors: removed to allow intrinsic color gradients
        inverseColors: true,
        opacityFrom: 0.85,
        opacityTo: 0.85,
        stops: [0, 100]
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
          Clientes por Faixa Etária
        </Typography>
        <Box className="flex items-center gap-2">
          {/* Date Filter */}
          <Tooltip title="Filtrar por data">
            <IconButton size="small" onClick={handleClickMenu}>
              <FuseSvgIcon size={20}>heroicons-outline:calendar</FuseSvgIcon>
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleCloseMenu}
          >
            <MenuItem onClick={() => handleSelectMonth(0)}>
              <ListItemIcon>
                <FuseSvgIcon size={18}>heroicons-outline:calendar</FuseSvgIcon>
              </ListItemIcon>
              <ListItemText>Mês atual</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleSelectMonth(1)}>
              <ListItemIcon>
                <FuseSvgIcon size={18}>heroicons-outline:arrow-left</FuseSvgIcon>
              </ListItemIcon>
              <ListItemText>Mês passado</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleSelectMonth(2)}>
              <ListItemIcon>
                <FuseSvgIcon size={18}>heroicons-outline:arrow-left</FuseSvgIcon>
              </ListItemIcon>
              <ListItemText>Há 2 meses</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleSelectMonth(3)}>
              <ListItemIcon>
                <FuseSvgIcon size={18}>heroicons-outline:arrow-left</FuseSvgIcon>
              </ListItemIcon>
              <ListItemText>Há 3 meses</ListItemText>
            </MenuItem>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem onClick={handleCustomDateClick}>
              <ListItemIcon>
                <FuseSvgIcon size={18}>heroicons-outline:adjustments-horizontal</FuseSvgIcon>
              </ListItemIcon>
              <ListItemText>Selecionar data...</ListItemText>
            </MenuItem>
          </Menu>

          {/* Custom Date Picker Dialog */}
          <Dialog
            open={datePickerOpen}
            onClose={handleDatePickerClose}
            PaperProps={{
              sx: {
                borderRadius: 3,
                minWidth: 320,
                zIndex: 1400, // Ensure dialog is above everything
              }
            }}
            sx={{
              zIndex: 1300, // Ensure backdrop is also properly layered
            }}
          >
            <DialogContent sx={{ pt: 3 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                <DatePicker
                  views={['year', 'month']}
                  label="Selecione o mês e ano"
                  value={tempDate}
                  onChange={(newValue) => setTempDate(newValue || filterDate)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      sx: { mb: 2 }
                    },
                    popper: {
                      sx: {
                        zIndex: 9999, // Very high z-index to ensure it's above dialog
                      }
                    }
                  }}
                />
              </LocalizationProvider>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={handleDatePickerClose} color="inherit">
                Cancelar
              </Button>
              <Button onClick={handleDatePickerConfirm} variant="contained" color="primary">
                Confirmar
              </Button>
            </DialogActions>
          </Dialog>

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
          type="bar"
          height={350}
        />
      </CardContent>
    </Card>
  );
}
