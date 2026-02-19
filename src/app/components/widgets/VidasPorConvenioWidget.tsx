import { useMemo, useState, useEffect } from 'react';
import { useTheme, alpha } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { Card, CardContent, Typography, Box, IconButton, Tooltip, Menu, MenuItem, Tabs, Tab, Divider, ListItemIcon, ListItemText, Button, Dialog, DialogContent, DialogActions } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import useUser from '@auth/useUser';
import { useVidasPorConvenio, useToggleFavoriteWidget, useUserFavoriteWidgets } from '../../hooks/useDashboard';
import WidgetLoading from '../ui/WidgetLoading';
import { format } from 'date-fns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';

interface VidasPorConvenioWidgetProps {
  initialIsFavorite?: boolean;
}

export function VidasPorConvenioWidget({ initialIsFavorite = false }: VidasPorConvenioWidgetProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const { data: user } = useUser();
  const toggleFavoriteMutation = useToggleFavoriteWidget();
  const { data: favoriteWidgets } = useUserFavoriteWidgets(user?.id ? Number(user.id) : undefined);
  const widgetId = 10;
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
    setRefetchCounter(prev => prev + 1);
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
      setRefetchCounter(prev => prev + 1);
    }
    setDatePickerOpen(false);
  };

  useEffect(() => {
    setTempDate(filterDate);
  }, [filterDate]);

  // Data Fetching
  const { data: conveniosData, isLoading } = useVidasPorConvenio(apiDate);

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
    setOptimisticStatus(newStatus);

    toggleFavoriteMutation.mutate(
      { codUsu: Number(user.id), widgetId, isFavorite: newStatus },
      {
        onError: () => {
          setOptimisticStatus(null);
        }
      }
    );
  };

  // --- DATA FILTERING & PREPARATION ---

  // 1. Overview Filtering (Total > 0)
  const vidasPFData = useMemo(() => conveniosData?.filter(c => c.quantidadeVidasPF > 0) || [], [conveniosData]);
  const empresasData = useMemo(() => conveniosData?.filter(c => c.quantidadeEmpresas > 0) || [], [conveniosData]);

  // 2. Crescimento Filtering (Difference != 0)
  const crescimentoPFData = useMemo(() => conveniosData?.filter(c => c.diferencaVidasPF !== 0) || [], [conveniosData]);
  const crescimentoEmpresasData = useMemo(() => conveniosData?.filter(c => c.diferencaEmpresas !== 0) || [], [conveniosData]);

  // --- CHARTS CONFIGURATION ---

  // Blue Palettes
  const bluePalettePF = [
    '#90CAF9', '#64B5F6', '#42A5F5', '#2196F3', '#1E88E5', '#1976D2', '#1565C0', '#0D47A1'
  ]; // Light to Medium Blue

  const bluePaletteEmpresas = [
    '#81D4FA', '#4FC3F7', '#29B6F6', '#039BE5', '#0288D1', '#0277BD', '#01579B'
  ]; // Cyan/Light Blue to Deep Blue (Distinct tone)

  // Chart 1A: Overview - Vidas PF
  const overviewVidasPFSeries = useMemo(() => [{
    name: 'Vidas PF',
    data: vidasPFData.map(c => c.quantidadeVidasPF)
  }], [vidasPFData]);

  // Chart 1B: Overview - Empresas
  const overviewEmpresasSeries = useMemo(() => [{
    name: 'Empresas',
    data: empresasData.map(c => c.quantidadeEmpresas)
  }], [empresasData]);

  const baseOverviewOptions: ApexOptions = {
    chart: { type: 'bar', fontFamily: 'inherit', toolbar: { show: false }, zoom: { enabled: false }, stacked: false },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        barHeight: '60%',
        distributed: true, // Enable distributed colors like the example
        dataLabels: { position: 'right' }
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'horizontal', // Horizontal for horizontal bars
        shadeIntensity: 0.5,
        inverseColors: true,
        opacityFrom: 0.85,
        opacityTo: 0.85,
        stops: [0, 100]
      }
    },
    dataLabels: {
      enabled: true,
      textAnchor: 'start',
      style: { colors: [theme.palette.text.primary] },
      formatter: (val: number) => val.toLocaleString('pt-BR'),
      offsetX: 10
    },
    yaxis: {
      labels: {
        style: { colors: theme.palette.text.secondary, fontSize: '13px', fontFamily: 'inherit', fontWeight: 500 },
        maxWidth: 200,
        formatter: (value) => {
          const str = String(value);
          return str.length > 25 ? str.substring(0, 25) + '...' : str;
        }
      }
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 4,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } },
      padding: { top: 0, right: 0, bottom: 0, left: 10 }
    },
    stroke: { show: false },
    legend: { show: false } // Hide legend for distributed
  };

  const overviewVidasPFOptions: ApexOptions = {
    ...baseOverviewOptions,
    xaxis: {
      categories: vidasPFData.map(c => c.nomeConvenio),
      labels: { style: { colors: theme.palette.text.secondary } }
    },
    colors: bluePalettePF,
    tooltip: { y: { formatter: (val) => `${val.toLocaleString('pt-BR')} Vidas` } }
  };

  const overviewEmpresasOptions: ApexOptions = {
    ...baseOverviewOptions,
    xaxis: {
      categories: empresasData.map(c => c.nomeConvenio),
      labels: { style: { colors: theme.palette.text.secondary } }
    },
    colors: bluePaletteEmpresas,
    tooltip: { y: { formatter: (val) => `${val.toLocaleString('pt-BR')} Empresas` } }
  };

  // Chart 2A: Crescimento PF
  const crescimentoPFSeries = useMemo(() => [{
    name: 'Diferença Vidas PF',
    data: crescimentoPFData.map(c => c.diferencaVidasPF)
  }], [crescimentoPFData]);

  // Chart 2B: Crescimento Empresas
  const crescimentoEmpresasSeries = useMemo(() => [{
    name: 'Diferença Empresas',
    data: crescimentoEmpresasData.map(c => c.diferencaEmpresas)
  }], [crescimentoEmpresasData]);

  const baseCrescimentoOptions: ApexOptions = {
    chart: { type: 'bar', fontFamily: 'inherit', toolbar: { show: false }, zoom: { enabled: false }, stacked: false },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 6,
        barHeight: '60%',
        colors: {
          ranges: [
            { from: -10000, to: -0.01, color: theme.palette.error.main },
            { from: 0.01, to: 10000, color: theme.palette.info.main }, // Blue for positive
            { from: -0.0001, to: 0.0001, color: theme.palette.text.disabled }
          ]
        }
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'horizontal',
        shadeIntensity: 0.5,
        inverseColors: true,
        opacityFrom: 0.85,
        opacityTo: 0.85,
        stops: [0, 100]
      }
    },
    dataLabels: { enabled: false },
    yaxis: {
      labels: {
        style: { colors: theme.palette.text.secondary, fontSize: '13px', fontWeight: 500 },
        maxWidth: 200,
        formatter: (value) => {
          const str = String(value);
          return str.length > 25 ? str.substring(0, 25) + '...' : str;
        }
      }
    },
    grid: { borderColor: theme.palette.divider, strokeDashArray: 4, xaxis: { lines: { show: true } } },
    stroke: { show: false }
  };

  const crescimentoPFOptions: ApexOptions = {
    ...baseCrescimentoOptions,
    xaxis: {
      categories: crescimentoPFData.map(c => c.nomeConvenio),
      labels: {
        style: { colors: theme.palette.text.secondary },
        formatter: (val) => Math.floor(Number(val)).toString()
      }
    },
    tooltip: {
      y: {
        formatter: (val) => val > 0 ? `+${val}` : `${val}`
      }
    }
  };

  const crescimentoEmpresasOptions: ApexOptions = {
    ...baseCrescimentoOptions,
    xaxis: {
      categories: crescimentoEmpresasData.map(c => c.nomeConvenio),
      labels: {
        style: { colors: theme.palette.text.secondary },
        formatter: (val) => Math.floor(Number(val)).toString()
      }
    },
    tooltip: {
      y: {
        formatter: (val) => val > 0 ? `+${val}` : `${val}`
      }
    }
  };

  // Chart 3: Tendência
  const conveniosComMudancaSignificativa = useMemo(() => {
    if (!conveniosData) return [];
    const THRESHOLD_VIDAS_PF = 10;
    const THRESHOLD_EMPRESAS = 2;

    return conveniosData.filter(convenio => {
      const hasSignificantPFChange = Math.abs(convenio.diferencaVidasPF) >= THRESHOLD_VIDAS_PF;
      const hasSignificantEmpresasChange = Math.abs(convenio.diferencaEmpresas) >= THRESHOLD_EMPRESAS;
      return hasSignificantPFChange || hasSignificantEmpresasChange;
    }).sort((a, b) => {
      const changeA = Math.abs(a.diferencaVidasPF) + Math.abs(a.diferencaEmpresas) * 0.1;
      const changeB = Math.abs(b.diferencaVidasPF) + Math.abs(b.diferencaEmpresas) * 0.1;
      return changeB - changeA;
    });
  }, [conveniosData]);

  const tendenciaSeries = useMemo(() => {
    if (!conveniosComMudancaSignificativa || conveniosComMudancaSignificativa.length === 0) return [];
    const series: any[] = [];
    conveniosComMudancaSignificativa.forEach((convenio) => {
      if (convenio.quantidadeVidasPF !== convenio.quantidadeVidasPFAnterior) {
        series.push({
          name: `${convenio.nomeConvenio} - PF`,
          data: [{ x: 'Anterior', y: convenio.quantidadeVidasPFAnterior }, { x: 'Atual', y: convenio.quantidadeVidasPF }]
        });
      }
      if (convenio.quantidadeEmpresas !== convenio.quantidadeEmpresasAnterior) {
        series.push({
          name: `${convenio.nomeConvenio} - Empresas`,
          data: [{ x: 'Anterior', y: convenio.quantidadeEmpresasAnterior }, { x: 'Atual', y: convenio.quantidadeEmpresas }]
        });
      }
    });
    return series;
  }, [conveniosComMudancaSignificativa]);

  const tendenciaOptions: ApexOptions = {
    chart: { type: 'line', fontFamily: 'inherit', toolbar: { show: false }, zoom: { enabled: false } },
    stroke: { width: 3, curve: 'smooth' }, // Smoother line
    xaxis: {
      categories: ['Anterior', 'Atual'],
      labels: { style: { colors: theme.palette.text.secondary, fontSize: '13px', fontWeight: 600 } }
    },
    yaxis: { labels: { style: { colors: theme.palette.text.secondary } } },
    legend: { position: 'top', horizontalAlign: 'left', labels: { colors: theme.palette.text.secondary } },
    grid: { borderColor: theme.palette.divider, strokeDashArray: 4 },
    tooltip: {
      shared: true,
      intersect: false,
      y: { formatter: (value) => value?.toLocaleString('pt-BR') || '0' }
    },
    markers: { size: 6, hover: { size: 8 } },
    colors: [
      '#2196F3', // Blue
      '#9C27B0', // Purple
      '#4CAF50', // Green
      '#FF9800', // Orange
      '#F44336', // Red
      '#00BCD4', // Cyan
      '#E91E63', // Pink
      '#8BC34A', // Light Green
      '#FF5722', // Deep Orange
      '#673AB7', // Deep Purple
      '#009688', // Teal
      '#FFC107', // Amber
    ]
  };

  if (isLoading) return <WidgetLoading height={500} />;

  return (
    <Card
      className="w-full shadow-sm rounded-2xl overflow-hidden"
      elevation={0}
      sx={{ border: `1px solid ${theme.palette.divider}`, height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <Box className="flex items-center justify-between border-b" sx={{ px: isMobile ? 2 : 3, py: isMobile ? 2 : 3 }}>
        <Typography sx={{ fontSize: isMobile ? '1rem' : '1.125rem', fontWeight: 600 }} className="truncate text-primary">Vidas por Convênio</Typography>
        <Box className="flex items-center gap-2">
          <Tooltip title="Filtrar por data">
            <IconButton size="small" onClick={handleClickMenu}>
              <FuseSvgIcon size={20}>heroicons-outline:calendar</FuseSvgIcon>
            </IconButton>
          </Tooltip>
          <Menu anchorEl={anchorEl} open={openMenu} onClose={handleCloseMenu}>
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

          <Dialog open={datePickerOpen} onClose={handleDatePickerClose} PaperProps={{ sx: { borderRadius: 3, minWidth: 320, zIndex: 1400 } }} sx={{ zIndex: 1300 }}>
            <DialogContent sx={{ pt: 3 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                <DatePicker
                  views={['year', 'month']}
                  label="Selecione o mês e ano"
                  value={tempDate}
                  onChange={(newValue) => setTempDate(newValue || filterDate)}
                  slotProps={{ textField: { fullWidth: true, sx: { mb: 2 } }, popper: { sx: { zIndex: 9999 } } }}
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

      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        textColor="primary"
        indicatorColor="primary"
        variant={isMobile || isTablet ? 'scrollable' : 'fullWidth'}
        scrollButtons={isMobile || isTablet ? 'auto' : false}
        allowScrollButtonsMobile
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          minHeight: isMobile ? 42 : 48,
          '& .MuiTab-root': {
            minWidth: isMobile ? 80 : 100,
            fontSize: isMobile ? '0.75rem' : '0.875rem',
            px: isMobile ? 1 : 2
          }
        }}
      >
        <Tab label={isMobile ? "PF" : "Vidas PF"} sx={{ textTransform: 'none', fontWeight: 600 }} />
        <Tab label="Empresas" sx={{ textTransform: 'none', fontWeight: 600 }} />
        <Tab label={isMobile ? "↑ PF" : "Cresc. PF"} sx={{ textTransform: 'none', fontWeight: 600 }} />
        <Tab label={isMobile ? "↑ Emp" : "Cresc. Empresas"} sx={{ textTransform: 'none', fontWeight: 600 }} />
        <Tab label="Tendência" sx={{ textTransform: 'none', fontWeight: 600 }} />
        <Tab label="Painel" sx={{ textTransform: 'none', fontWeight: 600 }} />
      </Tabs>

      <CardContent className="p-0" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 0, '&:last-child': { pb: 0 } }}>
        {/* Tab 0: Overview - Vidas PF */}
        {tabValue === 0 && (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: isMobile ? 1 : 2, minHeight: isMobile ? 350 : 500 }}>
            {vidasPFData && vidasPFData.length > 0 ? (
              <Box sx={{ flex: 1, width: '100%' }}>
                <ReactApexChart options={overviewVidasPFOptions} series={overviewVidasPFSeries} type="bar" height="100%" />
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Typography variant="body2" color="text.secondary">Sem dados de Vidas PF para exibir.</Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Tab 1: Overview - Empresas */}
        {tabValue === 1 && (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: isMobile ? 1 : 2, minHeight: isMobile ? 350 : 500 }}>
            {empresasData && empresasData.length > 0 ? (
              <Box sx={{ flex: 1, width: '100%' }}>
                <ReactApexChart options={overviewEmpresasOptions} series={overviewEmpresasSeries} type="bar" height="100%" />
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Typography variant="body2" color="text.secondary">Sem dados de Empresas para exibir.</Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Tab 2: Crescimento - Vidas PF */}
        {tabValue === 2 && (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: isMobile ? 1 : 2, minHeight: isMobile ? 350 : 500 }}>
            {crescimentoPFData && crescimentoPFData.length > 0 ? (
              <Box sx={{ flex: 1, width: '100%' }}>
                <ReactApexChart options={crescimentoPFOptions} series={crescimentoPFSeries} type="bar" height="100%" />
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Typography variant="body2" color="text.secondary">Sem variações em Vidas PF no período.</Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Tab 3: Crescimento - Empresas */}
        {tabValue === 3 && (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: isMobile ? 1 : 2, minHeight: isMobile ? 350 : 500 }}>
            {crescimentoEmpresasData && crescimentoEmpresasData.length > 0 ? (
              <Box sx={{ flex: 1, width: '100%' }}>
                <ReactApexChart options={crescimentoEmpresasOptions} series={crescimentoEmpresasSeries} type="bar" height="100%" />
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Typography variant="body2" color="text.secondary">Sem variações em Empresas no período.</Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Tab 4: Tendência */}
        {tabValue === 4 && (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: isMobile ? 1 : 2, minHeight: isMobile ? 350 : 500 }}>
            {conveniosComMudancaSignificativa && conveniosComMudancaSignificativa.length > 0 ? (
              <Box sx={{ flex: 1, width: '100%' }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>Mostrando convênios com aumento ou queda significativos</Typography>
                <ReactApexChart options={tendenciaOptions} series={tendenciaSeries} type="line" height="90%" />
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Typography variant="body2" color="text.secondary">Sem dados para tendência.</Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Tab 5: Painel */}
        {tabValue === 5 && conveniosData && (
          <Box sx={{ p: isMobile ? 1.5 : 3, display: 'flex', flexDirection: 'column', gap: isMobile ? 1.5 : 2, height: isMobile ? 350 : 500, overflowY: 'auto' }}>
            {conveniosData.map((convenio) => (
              <Box key={convenio.nomeConvenio} sx={{ p: isMobile ? 1.5 : 2, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 2 }}>
                <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight={700} color="primary" sx={{ mb: isMobile ? 1 : 2 }}>{convenio.nomeConvenio}</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 1.5 : 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Vidas PF</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                      <Typography variant="h5" fontWeight={700}>{convenio.quantidadeVidasPF}</Typography>
                      <Typography variant="body2" color={convenio.diferencaVidasPF >= 0 ? 'success.main' : 'error.main'}>
                        {convenio.diferencaVidasPF > 0 ? '+' : ''}{convenio.diferencaVidasPF}
                      </Typography>
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Empresas</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                      <Typography variant="h5" fontWeight={700}>{convenio.quantidadeEmpresas}</Typography>
                      <Typography variant="body2" color={convenio.diferencaEmpresas >= 0 ? 'success.main' : 'error.main'}>
                        {convenio.diferencaEmpresas > 0 ? '+' : ''}{convenio.diferencaEmpresas}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            ))}
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">Data de Referência: {format(new Date(filterDate), 'MMMM/yyyy', { locale: ptBR })}</Typography>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
