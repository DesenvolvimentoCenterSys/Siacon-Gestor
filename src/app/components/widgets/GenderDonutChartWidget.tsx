import { useMemo, useState, useEffect } from 'react';
import { useTheme, alpha } from '@mui/material/styles';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { Card, CardContent, Typography, Box, IconButton, Tooltip, Menu, MenuItem, Tabs, Tab } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useClientesPorSexo, useToggleFavoriteWidget } from '../../hooks/useDashboard';
import WidgetLoading from '../ui/WidgetLoading';
import useUser from '@auth/useUser';
import { format } from 'date-fns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { Dialog, DialogContent, DialogActions, Button, Divider, ListItemIcon, ListItemText } from '@mui/material';

interface GenderDonutChartWidgetProps {
  initialIsFavorite?: boolean;
}

export function GenderDonutChartWidget({ initialIsFavorite = false }: GenderDonutChartWidgetProps) {
  const theme = useTheme();
  const { data: user } = useUser();
  const [filterDate, setFilterDate] = useState<Date>(new Date());
  const [refetchCounter, setRefetchCounter] = useState(0);

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
  const { data: chartData, isLoading } = useClientesPorSexo(apiDate + `-${refetchCounter}`);

  // Favorite Logic
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const toggleFavoriteMutation = useToggleFavoriteWidget();

  const handleToggleFavorite = () => {
    if (!user?.id) return;
    const newStatus = !isFavorite;
    setIsFavorite(newStatus);
    toggleFavoriteMutation.mutate(
      { codUsu: Number(user.id), widgetId: 24, isFavorite: newStatus },
      { onError: () => setIsFavorite(!newStatus) }
    );
  };

  const chartSeries = useMemo(() => {
    if (!chartData) return [];
    return [
      chartData.quantidadeMasculino,
      chartData.quantidadeFeminino,
      chartData.quantidadeOutros
    ];
  }, [chartData]);

  const chartOptions: ApexOptions = {
    chart: {
      type: 'donut',
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: 'inherit'
    },
    labels: ['Masculino', 'Feminino', 'Outros'],
    colors: [
      '#1e88e5', // Blue 600 - Masculine
      '#42a5f5', // Blue 400 - Feminine
      '#90caf9', // Blue 200 - Others
    ],
    dataLabels: {
      enabled: true,
      formatter: function (val: number) {
        return val.toFixed(1) + "%"
      }
    },
    legend: {
      position: 'bottom',
      labels: {
        colors: theme.palette.text.secondary
      }
    },
    stroke: {
      show: true,
      colors: [theme.palette.background.paper],
      width: 2
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '14px',
              fontWeight: 600,
              color: theme.palette.text.primary
            },
            value: {
              show: true,
              fontSize: '24px',
              fontWeight: 700,
              color: theme.palette.text.primary,
              formatter: function (val) {
                return val.toString();
              }
            },
            total: {
              show: true,
              label: 'Total',
              fontSize: '14px', fontWeight: 600,
              color: theme.palette.text.secondary,
              formatter: function (w) {
                const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
                return total.toString();
              }
            }
          }
        }
      }
    },
    tooltip: {
      y: {
        formatter: function (value) {
          return value.toString();
        }
      }
    }
  };

  // List View Rows
  const rows = useMemo(() => {
    if (!chartData) return [];
    return [
      {
        label: 'Masculino',
        value: chartData.quantidadeMasculino,
        diff: chartData.diferencaMasculino,
        color: '#1e88e5', // Blue 600
        icon: 'heroicons-outline:user'
      },
      {
        label: 'Feminino',
        value: chartData.quantidadeFeminino,
        diff: chartData.diferencaFeminino,
        color: '#42a5f5', // Blue 400
        icon: 'heroicons-outline:user'
      },
      {
        label: 'Outros',
        value: chartData.quantidadeOutros,
        diff: chartData.diferencaOutros,
        color: '#90caf9', // Blue 200
        icon: 'heroicons-outline:users'
      }
    ];
  }, [chartData]);


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
          Distribuição por Gênero
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
                zIndex: 1400,
              }
            }}
            sx={{
              zIndex: 1300,
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
                        zIndex: 9999,
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

      {/* Tabs */}
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        textColor="primary"
        indicatorColor="primary"
        variant="fullWidth"
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          minHeight: 48,
        }}
      >
        <Tab label="Gráfico" sx={{ textTransform: 'none', fontWeight: 600 }} />
        <Tab label="Painel" sx={{ textTransform: 'none', fontWeight: 600 }} />
      </Tabs>

      <CardContent className="p-0" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 0, '&:last-child': { pb: 0 } }}>
        {tabValue === 0 && (
          <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: 350 }}>
            <ReactApexChart
              options={chartOptions}
              series={chartSeries}
              type="donut"
              height={320}
              width="100%"
            />
          </Box>
        )}
        {tabValue === 1 && (
          <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {rows.map((row) => (
              <Box key={row.label} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '12px',
                      backgroundColor: alpha(row.color, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: row.color
                    }}
                  >
                    <FuseSvgIcon size={24}>{row.icon}</FuseSvgIcon>
                  </Box>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 500, color: theme.palette.text.secondary }}>
                      {row.label}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {row.value.toLocaleString('pt-BR')}
                    </Typography>
                  </Box>
                </Box>

                {/* Trend */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <FuseSvgIcon
                      size={18}
                      sx={{
                        color: row.diff >= 0 ? theme.palette.success.main : theme.palette.error.main,
                      }}
                    >
                      {row.diff >= 0 ? 'heroicons-solid:trending-up' : 'heroicons-solid:trending-down'}
                    </FuseSvgIcon>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 900,
                        color: row.diff >= 0 ? theme.palette.success.main : theme.palette.error.main,
                      }}
                    >
                      {row.diff > 0 ? '+' : ''}{row.diff}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: theme.palette.text.disabled, fontSize: '1.25rem' }}>
                    vs mês ant.
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
