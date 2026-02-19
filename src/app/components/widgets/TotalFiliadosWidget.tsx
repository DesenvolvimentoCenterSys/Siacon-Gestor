import { useMemo, useState, useEffect } from 'react';
import { useTheme, alpha } from '@mui/material/styles';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { Card, CardContent, Typography, Box, IconButton, Tooltip, Menu, MenuItem, Tabs, Tab, Divider, ListItemIcon, ListItemText, Button, Dialog, DialogContent, DialogActions } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useTotalFiliados, useToggleFavoriteWidget, useUserFavoriteWidgets } from '../../hooks/useDashboard';
import WidgetLoading from '../ui/WidgetLoading';
import useUser from '@auth/useUser';
import { format } from 'date-fns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';

interface TotalFiliadosWidgetProps {
  initialIsFavorite?: boolean;
}

export function TotalFiliadosWidget({ initialIsFavorite = false }: TotalFiliadosWidgetProps) {
  const theme = useTheme();
  const { data: user } = useUser();
  const [filterDate, setFilterDate] = useState<Date>(new Date());
  const [refetchCounter, setRefetchCounter] = useState(0);
  const widgetId = 14;

  const apiDate = useMemo(() => {
    return format(new Date(filterDate.getFullYear(), filterDate.getMonth(), 1), 'yyyy-MM-dd');
  }, [filterDate]);

  // Tab State
  const [tabValue, setTabValue] = useState(0);
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

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

  // Data Fetching
  const { data: widgetData, isLoading } = useTotalFiliados(apiDate);
  const { data: favoriteWidgets } = useUserFavoriteWidgets(user?.id ? Number(user.id) : undefined);
  const toggleFavoriteMutation = useToggleFavoriteWidget();

  // Derive backend status
  const backendIsFavorite = useMemo(() => {
    if (!favoriteWidgets) return initialIsFavorite;
    return favoriteWidgets.some((w: any) => w.dashboardWidgetId === widgetId && w.isFavorite);
  }, [favoriteWidgets, widgetId, initialIsFavorite]);

  // Local state initialized with backend status
  const [optimisticStatus, setOptimisticStatus] = useState<boolean | null>(null);
  const isFavorite = optimisticStatus !== null ? optimisticStatus : backendIsFavorite;

  useEffect(() => {
    if (optimisticStatus !== null && backendIsFavorite === optimisticStatus) {
      setOptimisticStatus(null);
    }
  }, [backendIsFavorite, optimisticStatus]);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.id || !widgetId) return;

    const newStatus = !isFavorite;
    setOptimisticStatus(newStatus); // Optimistic UI update

    toggleFavoriteMutation.mutate(
      { codUsu: Number(user.id), widgetId, isFavorite: newStatus },
      {
        onError: () => {
          setOptimisticStatus(null); // Revert on error
        }
      }
    );
  };

  const chartSeries = useMemo(() => {
    if (!widgetData) return [];
    return [
      {
        name: 'Quantidade',
        type: 'column',
        data: [widgetData.totalNovos, widgetData.totalDesligados]
      },
      {
        name: 'Valor (R$)',
        type: 'line',
        data: [widgetData.valorNovos, widgetData.valorDesligados]
      }
    ];
  }, [widgetData]);

  const chartOptions: ApexOptions = {
    chart: {
      type: 'line',
      fontFamily: 'inherit',
      toolbar: { show: false },
      zoom: { enabled: false },
      stacked: false,
      width: '100%'
    },
    responsive: [
      {
        breakpoint: 9999,
        options: {
          chart: {
            width: '100%'
          }
        }
      }
    ],
    stroke: {
      width: [0, 4],
      curve: 'smooth'
    },
    plotOptions: {
      bar: {
        columnWidth: '50%',
        borderRadius: 8,
        distributed: true // Use distributed colors for bars
      }
    },
    // Colors: Bar1 (Light Blue), Bar2 (Dark Blue), Line (Orange)
    colors: [
      '#42A5F5', // Bar 1: Novos - Light Blue
      '#0D47A1', // Bar 2: Desligados - Deep Blue
      '#FF9800'  // Line: Valor - Orange
    ],
    fill: {
      type: ['gradient', 'solid'], // Gradient for bars, solid for line? Default assumes gradient for all if single string
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.5,
        inverseColors: true,
        opacityFrom: 0.85,
        opacityTo: 0.85,
        stops: [0, 100]
      }
    },
    labels: ['Novos', 'Desligados'],
    xaxis: {
      labels: {
        style: {
          colors: theme.palette.text.secondary,
          fontSize: '12px',
          fontWeight: 600
        }
      }
    },
    yaxis: [
      {
        title: {
          text: 'Quantidade de Pessoas',
          style: {
            color: theme.palette.text.secondary,
            fontSize: '12px',
            fontWeight: 600
          }
        },
        labels: {
          style: {
            colors: theme.palette.text.secondary
          },
          formatter: (val) => Math.floor(val).toString()
        }
      },
      {
        opposite: true,
        title: {
          text: 'Impacto Financeiro (R$)',
          style: {
            color: theme.palette.text.secondary,
            fontSize: '12px',
            fontWeight: 600
          }
        },
        labels: {
          style: {
            colors: theme.palette.text.secondary
          },
          formatter: (val) => {
            if (val >= 1000) {
              return 'R$ ' + (val / 1000).toFixed(1) + 'k';
            }
            return 'R$ ' + val.toFixed(0);
          }
        }
      }
    ],
    dataLabels: {
      enabled: false
    },
    legend: {
      position: 'top',
      horizontalAlign: 'left',
      labels: {
        colors: theme.palette.text.secondary
      }
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 3
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (val, opts) => {
          if (opts.seriesIndex === 0) { // Column series
            return val.toString() + ' pessoas';
          }
          return formatCurrency(val); // Line series
        }
      }
    }
  };

  if (isLoading) return <WidgetLoading height={400} />;

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

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
          Impacto Financeiro — Novos vs Desligados
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
              <ListItemIcon><FuseSvgIcon size={18}>heroicons-outline:calendar</FuseSvgIcon></ListItemIcon>
              <ListItemText>Mês atual</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleSelectMonth(1)}>
              <ListItemIcon><FuseSvgIcon size={18}>heroicons-outline:arrow-left</FuseSvgIcon></ListItemIcon>
              <ListItemText>Mês passado</ListItemText>
            </MenuItem>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem onClick={handleCustomDateClick}>
              <ListItemIcon><FuseSvgIcon size={18}>heroicons-outline:adjustments-horizontal</FuseSvgIcon></ListItemIcon>
              <ListItemText>Selecionar data...</ListItemText>
            </MenuItem>
          </Menu>

          <Dialog
            open={datePickerOpen}
            onClose={handleDatePickerClose}
            PaperProps={{ sx: { borderRadius: 3, minWidth: 320, zIndex: 1400 } }}
            sx={{ zIndex: 1300 }}
          >
            <DialogContent sx={{ pt: 3 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                <DatePicker
                  views={['year', 'month']}
                  label="Selecione o mês e ano"
                  value={tempDate}
                  onChange={(newValue) => setTempDate(newValue || filterDate)}
                  slotProps={{
                    textField: { fullWidth: true, sx: { mb: 2 } },
                    popper: { sx: { zIndex: 9999 } }
                  }}
                />
              </LocalizationProvider>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={handleDatePickerClose} color="inherit">Cancelar</Button>
              <Button onClick={handleDatePickerConfirm} variant="contained" color="primary">Confirmar</Button>
            </DialogActions>
          </Dialog>

          <Tooltip title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}>
            <IconButton onClick={handleToggleFavorite} size="small">
              <FuseSvgIcon sx={{ color: isFavorite ? "#FFD700" : "action.active" }} size={20}>
                {isFavorite ? 'heroicons-solid:star' : 'heroicons-outline:star'}
              </FuseSvgIcon>
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Tabs */}
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        textColor="primary"
        indicatorColor="primary"
        variant="fullWidth"
        sx={{ borderBottom: 1, borderColor: 'divider', minHeight: 48 }}
      >
        <Tab label="Gráfico" sx={{ textTransform: 'none', fontWeight: 600 }} />
        <Tab label="Painel" sx={{ textTransform: 'none', fontWeight: 600 }} />
      </Tabs>

      <CardContent className="p-0" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 0, '&:last-child': { pb: 0 } }}>
        {tabValue === 0 && (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2, minHeight: 500 }}>
            {widgetData ? (
              <Box sx={{ flex: 1, width: '100%' }}>
                <ReactApexChart
                  options={chartOptions}
                  series={chartSeries}
                  type="line"
                  height="100%"
                />
              </Box>
            ) : (
              <Typography>Sem dados</Typography>
            )}
          </Box>
        )}
        {tabValue === 1 && widgetData && (
          <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2, height: 400, overflowY: 'auto' }}>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, bgcolor: alpha(theme.palette.success.main, 0.05), borderRadius: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Total Ativos</Typography>
                <Typography variant="h5" fontWeight={700} color="success.main">{widgetData.totalAtivos}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" align="right">Faturamento Total</Typography>
                <Typography variant="h6" fontWeight={700} color="success.main">{formatCurrency(widgetData.faturamentoTotal)}</Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Total Novos</Typography>
                <Typography variant="h5" fontWeight={700} color="info.main">{widgetData.totalNovos}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" align="right">Valor Novos</Typography>
                <Typography variant="h6" fontWeight={700} color="info.main">{formatCurrency(widgetData.valorNovos)}</Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, bgcolor: alpha(theme.palette.error.main, 0.05), borderRadius: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Total Desligados</Typography>
                <Typography variant="h5" fontWeight={700} color="error.main">{widgetData.totalDesligados}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" align="right">Valor Desligados</Typography>
                <Typography variant="h6" fontWeight={700} color="error.main">{formatCurrency(widgetData.valorDesligados)}</Typography>
              </Box>
            </Box>

            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                Data de Referência: {format(new Date(widgetData.dataReferencia), 'MMMM/yyyy', { locale: ptBR })}
              </Typography>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
