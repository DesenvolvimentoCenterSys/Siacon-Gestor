import { useMemo, useState, useEffect } from 'react';
import { useTheme, alpha } from '@mui/material/styles';
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
    chart: { type: 'bar', fontFamily: 'inherit', toolbar: { show: false }, stacked: false },
    plotOptions: {
      bar: { horizontal: true, borderRadius: 4, barHeight: '70%', dataLabels: { position: 'right' } }
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
        style: { colors: theme.palette.text.secondary, fontSize: '12px' },
        maxWidth: 200,
        formatter: (value) => {
          const str = String(value);
          return str.length > 25 ? str.substring(0, 25) + '...' : str;
        }
      }
    },
    grid: { xaxis: { lines: { show: true } }, yaxis: { lines: { show: false } } }
  };

  const overviewVidasPFOptions: ApexOptions = {
    ...baseOverviewOptions,
    xaxis: {
      categories: vidasPFData.map(c => c.nomeConvenio),
      labels: { style: { colors: theme.palette.text.secondary } }
    },
    colors: [theme.palette.info.main],
    tooltip: { y: { formatter: (val) => `${val.toLocaleString('pt-BR')} Vidas` } }
  };

  const overviewEmpresasOptions: ApexOptions = {
    ...baseOverviewOptions,
    xaxis: {
      categories: empresasData.map(c => c.nomeConvenio),
      labels: { style: { colors: theme.palette.text.secondary } }
    },
    colors: [theme.palette.warning.main],
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
    chart: { type: 'bar', fontFamily: 'inherit', toolbar: { show: false }, stacked: false },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 8,
        colors: {
          ranges: [
            { from: -10000, to: -0.01, color: theme.palette.error.main },
            { from: 0.01, to: 10000, color: theme.palette.success.main },
            { from: -0.0001, to: 0.0001, color: theme.palette.text.secondary } // Zero fallback
          ]
        }
      }
    },
    dataLabels: { enabled: false },
    yaxis: {
      labels: {
        style: { colors: theme.palette.text.secondary, fontSize: '12px' },
        maxWidth: 200,
        formatter: (value) => {
          const str = String(value);
          return str.length > 25 ? str.substring(0, 25) + '...' : str;
        }
      }
    },
    grid: { borderColor: theme.palette.divider, strokeDashArray: 3, xaxis: { lines: { show: true } } }
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
    chart: { type: 'line', fontFamily: 'inherit', toolbar: { show: false } },
    stroke: { width: 2, curve: 'straight' },
    xaxis: {
      categories: ['Anterior', 'Atual'],
      labels: { style: { colors: theme.palette.text.secondary, fontSize: '12px', fontWeight: 600 } }
    },
    yaxis: { labels: { style: { colors: theme.palette.text.secondary } } },
    legend: { position: 'top', horizontalAlign: 'left', labels: { colors: theme.palette.text.secondary } },
    grid: { borderColor: theme.palette.divider, strokeDashArray: 3 },
    tooltip: {
      shared: true,
      intersect: false,
      y: { formatter: (value) => value?.toLocaleString('pt-BR') || '0' }
    },
    markers: { size: 6, hover: { size: 8 } }
  };

  if (isLoading) return <WidgetLoading height={500} />;

  return (
    <Card
      className="w-full shadow-sm rounded-2xl overflow-hidden"
      elevation={0}
      sx={{ border: `1px solid ${theme.palette.divider}`, height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <Box className="flex items-center justify-between px-6 py-4 border-b">
        <Typography className="text-lg font-semibold truncate text-primary">Vidas por Convênio</Typography>
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
        variant="fullWidth"
        sx={{ borderBottom: 1, borderColor: 'divider', minHeight: 48 }}
      >
        <Tab label="Vidas PF" sx={{ textTransform: 'none', fontWeight: 600 }} />
        <Tab label="Empresas" sx={{ textTransform: 'none', fontWeight: 600 }} />
        <Tab label="Cresc. PF" sx={{ textTransform: 'none', fontWeight: 600 }} />
        <Tab label="Cresc. Empresas" sx={{ textTransform: 'none', fontWeight: 600 }} />
        <Tab label="Tendência" sx={{ textTransform: 'none', fontWeight: 600 }} />
        <Tab label="Painel" sx={{ textTransform: 'none', fontWeight: 600 }} />
      </Tabs>

      <CardContent className="p-0" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 0, '&:last-child': { pb: 0 } }}>
        {/* Tab 0: Overview - Vidas PF */}
        {tabValue === 0 && (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2, minHeight: 500 }}>
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
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2, minHeight: 500 }}>
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
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2, minHeight: 500 }}>
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
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2, minHeight: 500 }}>
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
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2, minHeight: 500 }}>
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
          <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2, height: 500, overflowY: 'auto' }}>
            {conveniosData.map((convenio) => (
              <Box key={convenio.nomeConvenio} sx={{ p: 2, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 2 }}>
                <Typography variant="h6" fontWeight={700} color="primary" sx={{ mb: 2 }}>{convenio.nomeConvenio}</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
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
