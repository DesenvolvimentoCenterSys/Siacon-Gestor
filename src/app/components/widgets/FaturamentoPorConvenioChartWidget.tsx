import { useMemo, useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { Card, CardContent, Typography, Box, IconButton, Tooltip, Menu, MenuItem, ListItemIcon, ListItemText, Checkbox, Tabs, Tab, Dialog, DialogContent, DialogActions, Button, Divider } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { useFaturamentoPorConvenio, useFaturamentoPorConvenioReferencia, useToggleFavoriteWidget } from '../../hooks/useDashboard';
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

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const handleClickMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(new Date());

  const handleCustomDateClick = () => {
    handleCloseMenu();
    setDatePickerOpen(true);
  };

  const handleDatePickerClose = () => {
    setDatePickerOpen(false);
    setTempDate(new Date(`${dateRange.startDate}T00:00:00`));
  };

  const handleDatePickerConfirm = () => {
    if (tempDate) {
      setDateRange({
        startDate: format(startOfMonth(tempDate), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(tempDate), 'yyyy-MM-dd')
      });
    }
    setDatePickerOpen(false);
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

  const { data: vencimentoData, isLoading: isVencimentoLoading } = useFaturamentoPorConvenio(dateRange.startDate, dateRange.endDate);
  const { data: competenciaData, isLoading: isCompetenciaLoading } = useFaturamentoPorConvenioReferencia(dateRange.startDate, dateRange.endDate);

  const chartData = tabIndex === 0 ? vencimentoData : competenciaData;
  const isLoading = tabIndex === 0 ? isVencimentoLoading : isCompetenciaLoading;

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
      zoom: { enabled: false },
      fontFamily: 'inherit'
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '40%',
        distributed: true,
        horizontal: true
      }
    },
    colors: [
      '#BBDEFB',
      '#90CAF9',
      '#64B5F6',
      '#42A5F5',
      '#2196F3',
      '#1E88E5',
      '#1976D2',
      '#1565C0',
      '#0D47A1',
      '#01579B',
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
        enabled: true
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
      show: false
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
            <Divider sx={{ my: 0.5 }} />
            <MenuItem onClick={handleCustomDateClick}>
              <ListItemText>Selecionar data...</ListItemText>
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

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 6 }}>
        <Tabs value={tabIndex} onChange={handleTabChange} aria-label="faturamento tabs">
          <Tab label="Por Vencimento" />
          <Tab label="Por Competência" />
        </Tabs>
      </Box>

      <CardContent className="p-6" sx={{ flexGrow: 1 }}>
        <ReactApexChart
          options={chartOptions}
          series={chartSeries}
          type="bar"
          height={320}
        />
      </CardContent>

      <Dialog
        open={datePickerOpen}
        onClose={handleDatePickerClose}
        PaperProps={{
          sx: {
            borderRadius: 3,
            minWidth: 320,
          }
        }}
      >
        <DialogContent sx={{ pt: 3 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
            <DatePicker
              views={['year', 'month']}
              label="Selecione o mês e ano"
              value={tempDate}
              onChange={(newValue) => setTempDate(newValue || new Date())}
              slotProps={{
                textField: {
                  fullWidth: true,
                  sx: { mb: 2 }
                },
                popper: {
                  sx: {
                    zIndex: 99999,
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
    </Card>
  );
}
