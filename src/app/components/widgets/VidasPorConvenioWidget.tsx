import { useMemo, useState, useEffect } from 'react';
import { useTheme, alpha } from '@mui/material/styles';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { Card, CardContent, Typography, Box, IconButton, Tooltip, Menu, MenuItem, Tabs, Tab, Divider, ListItemIcon, ListItemText, Button, Dialog, DialogContent, DialogActions } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useVidasPorConvenio } from '../../hooks/useDashboard';
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

  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  // Chart 1: Overview - Horizontal Grouped Bars
  const overviewSeries = useMemo(() => {
    if (!conveniosData) return [];
    return [
      {
        name: 'Vidas PF',
        data: conveniosData.map(c => c.quantidadeVidasPF)
      },
      {
        name: 'Empresas',
        data: conveniosData.map(c => c.quantidadeEmpresas)
      }
    ];
  }, [conveniosData]);

  const overviewOptions: ApexOptions = {
    chart: {
      type: 'bar',
      fontFamily: 'inherit',
      toolbar: { show: false },
      stacked: false
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 8,
        dataLabels: {
          position: 'top'
        }
      }
    },
    colors: [theme.palette.info.main, theme.palette.warning.main],
    dataLabels: {
      enabled: false
    },
    xaxis: {
      categories: conveniosData?.map(c => c.nomeConvenio) || [],
      labels: {
        style: {
          colors: theme.palette.text.secondary
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: theme.palette.text.secondary,
          fontSize: '12px'
        },
        maxWidth: 200,
        formatter: (value) => {
          const str = String(value);
          if (str.length > 25) {
            return str.substring(0, 25) + '...';
          }
          return str;
        }
      }
    },
    tooltip: {
      custom: function ({ series, seriesIndex, dataPointIndex, w }) {
        const convenioName = w.globals.labels[dataPointIndex];
        const value1 = series[0][dataPointIndex];
        const value2 = series[1]?.[dataPointIndex];

        return `<div class="apexcharts-tooltip-custom" style="padding: 8px; background: white; border: 1px solid #e0e0e0; border-radius: 4px;">
          <div style="font-weight: 600; margin-bottom: 4px;">${convenioName}</div>
          <div style="color: ${theme.palette.info.main};">Vidas PF: ${value1}</div>
          ${value2 !== undefined ? `<div style="color: ${theme.palette.warning.main};">Empresas: ${value2}</div>` : ''}
        </div>`;
      }
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
    }
  };

  // Chart 2: Crescimento/Queda - Divergent Bars
  const crescimentoSeries = useMemo(() => {
    if (!conveniosData) return [];
    return [
      {
        name: 'Diferença Vidas PF',
        data: conveniosData.map(c => c.diferencaVidasPF)
      },
      {
        name: 'Diferença Empresas',
        data: conveniosData.map(c => c.diferencaEmpresas)
      }
    ];
  }, [conveniosData]);

  const crescimentoOptions: ApexOptions = {
    chart: {
      type: 'bar',
      fontFamily: 'inherit',
      toolbar: { show: false },
      stacked: false
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 8,
        colors: {
          ranges: [
            {
              from: -10000,
              to: 0,
              color: theme.palette.error.main
            },
            {
              from: 0,
              to: 10000,
              color: theme.palette.success.main
            }
          ]
        }
      }
    },
    dataLabels: {
      enabled: false
    },
    xaxis: {
      categories: conveniosData?.map(c => c.nomeConvenio) || [],
      labels: {
        style: {
          colors: theme.palette.text.secondary
        },
        formatter: (val) => Math.floor(Number(val)).toString()
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: theme.palette.text.secondary,
          fontSize: '12px'
        },
        maxWidth: 200,
        formatter: (value) => {
          const str = String(value);
          if (str.length > 25) {
            return str.substring(0, 25) + '...';
          }
          return str;
        }
      }
    },
    tooltip: {
      custom: function ({ series, seriesIndex, dataPointIndex, w }) {
        const convenioName = w.globals.labels[dataPointIndex];
        const value1 = series[0][dataPointIndex];
        const value2 = series[1]?.[dataPointIndex];

        const diff1 = value1 > 0 ? `+${value1}` : value1;
        const diff2 = value2 !== undefined ? (value2 > 0 ? `+${value2}` : value2) : undefined;

        return `<div class="apexcharts-tooltip-custom" style="padding: 8px; background: white; border: 1px solid #e0e0e0; border-radius: 4px;">
          <div style="font-weight: 600; margin-bottom: 4px;">${convenioName}</div>
          <div style="color: ${value1 >= 0 ? theme.palette.success.main : theme.palette.error.main};">Diferença Vidas PF: ${diff1}</div>
          ${diff2 !== undefined ? `<div style="color: ${value2 >= 0 ? theme.palette.success.main : theme.palette.error.main};">Diferença Empresas: ${diff2}</div>` : ''}
        </div>`;
      }
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
      strokeDashArray: 3,
      xaxis: {
        lines: {
          show: true
        }
      }
    }
  };

  // Chart 3: Tendência - Slope Chart (top 6 by total PF vidas)
  const top6Convenios = useMemo(() => {
    if (!conveniosData) return [];
    return [...conveniosData]
      .sort((a, b) => b.quantidadeVidasPF - a.quantidadeVidasPF)
      .slice(0, 6);
  }, [conveniosData]);

  const tendenciaSeries = useMemo(() => {
    if (!top6Convenios || top6Convenios.length === 0) return [];

    const series: any[] = [];

    top6Convenios.forEach((convenio, index) => {
      series.push({
        name: `${convenio.nomeConvenio} - PF`,
        data: [
          { x: 'Anterior', y: convenio.quantidadeVidasPFAnterior },
          { x: 'Atual', y: convenio.quantidadeVidasPF }
        ]
      });
      series.push({
        name: `${convenio.nomeConvenio} - Empresas`,
        data: [
          { x: 'Anterior', y: convenio.quantidadeEmpresasAnterior },
          { x: 'Atual', y: convenio.quantidadeEmpresas }
        ]
      });
    });

    return series;
  }, [top6Convenios]);

  const tendenciaOptions: ApexOptions = {
    chart: {
      type: 'line',
      fontFamily: 'inherit',
      toolbar: { show: false }
    },
    stroke: {
      width: 2,
      curve: 'straight'
    },
    xaxis: {
      categories: ['Anterior', 'Atual'],
      labels: {
        style: {
          colors: theme.palette.text.secondary,
          fontSize: '12px',
          fontWeight: 600
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: theme.palette.text.secondary
        }
      }
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
      shared: false
    }
  };

  if (isLoading) return <WidgetLoading height={500} />;

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
          Vidas por Convênio
        </Typography>
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
              <FuseSvgIcon sx={{ color: isFavorite ? "#FFD700" : "inherit" }} size={20}>
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
        <Tab label="Overview" sx={{ textTransform: 'none', fontWeight: 600 }} />
        <Tab label="Crescimento" sx={{ textTransform: 'none', fontWeight: 600 }} />
        <Tab label="Tendência" sx={{ textTransform: 'none', fontWeight: 600 }} />
        <Tab label="Painel" sx={{ textTransform: 'none', fontWeight: 600 }} />
      </Tabs>

      <CardContent className="p-0" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 0, '&:last-child': { pb: 0 } }}>
        {tabValue === 0 && (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2, minHeight: 500 }}>
            {conveniosData && conveniosData.length > 0 ? (
              <Box sx={{ flex: 1, width: '100%' }}>
                <ReactApexChart
                  options={overviewOptions}
                  series={overviewSeries}
                  type="bar"
                  height="100%"
                />
              </Box>
            ) : (
              <Typography>Sem dados</Typography>
            )}
          </Box>
        )}

        {tabValue === 1 && (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2, minHeight: 500 }}>
            {conveniosData && conveniosData.length > 0 ? (
              <Box sx={{ flex: 1, width: '100%' }}>
                <ReactApexChart
                  options={crescimentoOptions}
                  series={crescimentoSeries}
                  type="bar"
                  height="100%"
                />
              </Box>
            ) : (
              <Typography>Sem dados</Typography>
            )}
          </Box>
        )}

        {tabValue === 2 && (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2, minHeight: 500 }}>
            {top6Convenios && top6Convenios.length > 0 ? (
              <Box sx={{ flex: 1, width: '100%' }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                  Mostrando os 6 convênios com maior número de vidas PF
                </Typography>
                <ReactApexChart
                  options={tendenciaOptions}
                  series={tendenciaSeries}
                  type="line"
                  height="90%"
                />
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Typography variant="body2" color="text.secondary">
                  Sem dados disponíveis para análise de tendência.
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {tabValue === 3 && conveniosData && (
          <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2, height: 500, overflowY: 'auto' }}>
            {conveniosData.map((convenio) => (
              <Box key={convenio.nomeConvenio} sx={{ p: 2, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 2 }}>
                <Typography variant="h6" fontWeight={700} color="primary" sx={{ mb: 2 }}>
                  {convenio.nomeConvenio}
                </Typography>
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
              <Typography variant="caption" color="text.secondary">
                Data de Referência: {format(new Date(filterDate), 'MMMM/yyyy', { locale: ptBR })}
              </Typography>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
