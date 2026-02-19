'use client';

import { useMemo, useState, useEffect } from 'react';
import { useTheme, alpha } from '@mui/material/styles';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import {
  Card, CardContent, Typography, Box, IconButton, Tooltip,
  Menu, MenuItem, ListItemIcon, ListItemText, Divider,
  Button, Dialog, DialogContent, DialogActions, Chip
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useFinancialEvolution, useToggleFavoriteWidget, useUserFavoriteWidgets } from '../../hooks/useDashboard';
import { FinancialEvolutionDto } from '../../services/dashboardService';
import WidgetLoading from '../ui/WidgetLoading';
import useUser from '@auth/useUser';
import { format, subMonths, startOfMonth } from 'date-fns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';

interface FinancialEvolutionWidgetProps {
  initialIsFavorite?: boolean;
}

const WIDGET_ID = 18;

export function FinancialEvolutionWidget({ initialIsFavorite = false }: FinancialEvolutionWidgetProps) {
  const theme = useTheme();
  const { data: user } = useUser();

  // Filter state
  const [filterDate, setFilterDate] = useState<Date>(new Date());
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(filterDate);
  const [selectedBank, setSelectedBank] = useState<string>('Todos');

  const apiDate = useMemo(() => {
    return format(new Date(filterDate.getFullYear(), filterDate.getMonth(), 1), 'yyyy-MM-dd');
  }, [filterDate]);

  useEffect(() => { setTempDate(filterDate); }, [filterDate]);

  // Filter menu handlers
  const handleClickMenu = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);
  const handleSelectMonth = (monthsAgo: number) => {
    const d = new Date();
    d.setMonth(d.getMonth() - monthsAgo);
    setFilterDate(d);
    handleCloseMenu();
  };
  const handleCustomDateClick = () => { handleCloseMenu(); setDatePickerOpen(true); };
  const handleDatePickerClose = () => { setDatePickerOpen(false); setTempDate(filterDate); };
  const handleDatePickerConfirm = () => {
    if (tempDate) setFilterDate(tempDate);
    setDatePickerOpen(false);
  };

  // Data
  const { data: widgetData, isLoading } = useFinancialEvolution(apiDate);
  const { data: favoriteWidgets } = useUserFavoriteWidgets(user?.id ? Number(user.id) : undefined);
  const toggleFavoriteMutation = useToggleFavoriteWidget();

  // Favorite logic
  const backendIsFavorite = useMemo(() => {
    if (!favoriteWidgets) return initialIsFavorite;
    return favoriteWidgets.some((w: any) => w.dashboardWidgetId === WIDGET_ID && w.isFavorite);
  }, [favoriteWidgets, initialIsFavorite]);

  const [optimisticStatus, setOptimisticStatus] = useState<boolean | null>(null);
  const isFavorite = optimisticStatus !== null ? optimisticStatus : backendIsFavorite;

  useEffect(() => {
    if (optimisticStatus !== null && backendIsFavorite === optimisticStatus) setOptimisticStatus(null);
  }, [backendIsFavorite, optimisticStatus]);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.id) return;
    const newStatus = !isFavorite;
    setOptimisticStatus(newStatus);
    toggleFavoriteMutation.mutate(
      { codUsu: Number(user.id), widgetId: WIDGET_ID, isFavorite: newStatus },
      { onError: () => setOptimisticStatus(null) }
    );
  };

  // Derived data
  const banks = useMemo(() => {
    if (!widgetData) return [];
    return ['Todos', ...Array.from(new Set(widgetData.map((d: FinancialEvolutionDto) => d.nomeBanco)))];
  }, [widgetData]);

  const filteredData = useMemo(() => {
    if (!widgetData) return [];
    if (selectedBank === 'Todos') return widgetData;
    return widgetData.filter((d: FinancialEvolutionDto) => d.nomeBanco === selectedBank);
  }, [widgetData, selectedBank]);

  const processedData = useMemo(() => {
    const categories = filteredData.map((d: FinancialEvolutionDto) =>
      format(new Date(d.data), 'dd/MM', { locale: ptBR })
    );
    const seriesReceber = filteredData.map((d: FinancialEvolutionDto) => Math.abs(d.totalReceber));
    const seriesPagar = filteredData.map((d: FinancialEvolutionDto) => Math.abs(d.totalPagar));
    const seriesSaldo = filteredData.map((d: FinancialEvolutionDto) => d.saldoAcumulado);

    const totals = filteredData.reduce(
      (acc, d: FinancialEvolutionDto) => ({
        receber: acc.receber + Math.abs(d.totalReceber),
        pagar: acc.pagar + Math.abs(d.totalPagar),
        saldoDia: filteredData.length > 0 ? filteredData[filteredData.length - 1].saldoDoDia : 0,
        saldoAcumulado: filteredData.length > 0 ? filteredData[filteredData.length - 1].saldoAcumulado : 0,
      }),
      { receber: 0, pagar: 0, saldoDia: 0, saldoAcumulado: 0 }
    );

    return { categories, seriesReceber, seriesPagar, seriesSaldo, totals };
  }, [filteredData]);

  // Colors
  const colorReceber = '#2E7D32';  // verde metálico
  const colorPagar = '#C62828';  // vermelho metálico
  const colorSaldo = theme.palette.secondary.main;

  const chartOptions: ApexOptions = {
    chart: {
      type: 'line',
      stacked: false,
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: 'inherit',
      animations: { enabled: true }
    },
    colors: [colorReceber, colorPagar, colorSaldo],
    stroke: {
      width: [0, 0, 3],
      curve: 'smooth',
      colors: ['transparent', 'transparent', colorSaldo]
    },
    plotOptions: {
      bar: { columnWidth: '55%', borderRadius: 3 }
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: processedData.categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
      labels: { style: { colors: theme.palette.text.secondary } }
    },
    yaxis: [
      {
        seriesName: 'A Receber',
        min: 0,
        forceNiceScale: true,
        title: {
          text: 'Movimentação',
          style: { color: theme.palette.text.secondary }
        },
        labels: {
          style: { colors: theme.palette.text.secondary },
          formatter: (v) => {
            if (v >= 1000) return `R$${(v / 1000).toFixed(0)}k`;
            return `R$${v.toFixed(0)}`;
          }
        }
      },
      {
        seriesName: 'A Pagar',
        show: false,
        min: 0,
        forceNiceScale: true,
      },
      {
        seriesName: 'Saldo Acumulado',
        opposite: true,
        title: {
          text: 'Saldo Acumulado',
          style: { color: colorSaldo }
        },
        labels: {
          style: { colors: colorSaldo },
          formatter: (v) => {
            if (Math.abs(v) >= 1000) return `R$${(v / 1000).toFixed(0)}k`;
            return `R$${v.toFixed(0)}`;
          }
        }
      }
    ],
    tooltip: {
      y: {
        formatter: (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      },
      theme: theme.palette.mode
    },
    legend: { position: 'top', horizontalAlign: 'center' },
    grid: { borderColor: theme.palette.divider, strokeDashArray: 3 }
  };

  const chartSeries = [
    { name: 'A Receber', type: 'column', data: processedData.seriesReceber },
    { name: 'A Pagar', type: 'column', data: processedData.seriesPagar },
    { name: 'Saldo Acumulado', type: 'line', data: processedData.seriesSaldo }
  ];

  const formatCurrency = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const metricCards = [
    { label: 'A Receber', value: processedData.totals.receber, color: colorReceber, icon: 'heroicons-outline:arrow-trending-up' },
    { label: 'A Pagar', value: processedData.totals.pagar, color: colorPagar, icon: 'heroicons-outline:arrow-trending-down' },
    { label: 'Saldo do Dia', value: processedData.totals.saldoDia, color: theme.palette.warning.main, icon: 'heroicons-outline:calendar-days' },
    { label: 'Saldo Acumulado', value: processedData.totals.saldoAcumulado, color: colorSaldo, icon: 'heroicons-outline:chart-bar-square' },
  ];

  if (isLoading) return <WidgetLoading height={500} />;

  return (
    <Card
      className="w-full shadow-sm rounded-2xl overflow-hidden"
      elevation={0}
      sx={{ border: `1px solid ${theme.palette.divider}`, height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      {/* Header */}
      <Box className="flex items-center justify-between px-6 py-4 border-b">
        <Typography className="text-lg font-semibold truncate text-primary">
          Evolução Financeira por Banco
        </Typography>
        <Box className="flex items-center gap-2">
          {/* Date filter */}
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
            <MenuItem onClick={() => handleSelectMonth(2)}>
              <ListItemIcon><FuseSvgIcon size={18}>heroicons-outline:arrow-left</FuseSvgIcon></ListItemIcon>
              <ListItemText>Há 2 meses</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleSelectMonth(3)}>
              <ListItemIcon><FuseSvgIcon size={18}>heroicons-outline:arrow-left</FuseSvgIcon></ListItemIcon>
              <ListItemText>Há 3 meses</ListItemText>
            </MenuItem>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem onClick={handleCustomDateClick}>
              <ListItemIcon><FuseSvgIcon size={18}>heroicons-outline:adjustments-horizontal</FuseSvgIcon></ListItemIcon>
              <ListItemText>Selecionar data...</ListItemText>
            </MenuItem>
          </Menu>

          {/* Date Picker Dialog */}
          <Dialog open={datePickerOpen} onClose={handleDatePickerClose}
            PaperProps={{ sx: { borderRadius: 3, minWidth: 320, zIndex: 1400 } }}
            sx={{ zIndex: 1300 }}
          >
            <DialogContent sx={{ pt: 3 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                <DatePicker
                  views={['year', 'month']}
                  label="Selecione o mês e ano"
                  value={tempDate}
                  onChange={(v) => setTempDate(v || filterDate)}
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

          {/* Favorite toggle */}
          <Tooltip title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}>
            <IconButton onClick={handleToggleFavorite} size="small">
              <FuseSvgIcon sx={{ color: isFavorite ? '#FFD700' : 'action.active' }} size={20}>
                {isFavorite ? 'heroicons-solid:star' : 'heroicons-outline:star'}
              </FuseSvgIcon>
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3, '&:last-child': { pb: 3 } }}>
        {/* Bank filter chips */}
        {banks.length > 1 && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            {banks.map((bank) => (
              <Chip
                key={bank}
                label={bank}
                size="small"
                onClick={() => setSelectedBank(bank)}
                variant={selectedBank === bank ? 'filled' : 'outlined'}
                color={selectedBank === bank ? 'primary' : 'default'}
                sx={{ fontWeight: selectedBank === bank ? 700 : 400 }}
              />
            ))}
          </Box>
        )}

        {/* Metric summary cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
          {metricCards.map((m) => (
            <Box
              key={m.label}
              sx={{
                p: 2, borderRadius: 2,
                backgroundColor: alpha(m.color, 0.08),
                border: `1px solid ${alpha(m.color, 0.2)}`
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <FuseSvgIcon size={16} sx={{ color: m.color }}>{m.icon}</FuseSvgIcon>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                  {m.label}
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: m.color, fontSize: '0.95rem' }}>
                {formatCurrency(m.value)}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Chart */}
        {filteredData.length === 0 ? (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography color="text.secondary">Nenhum dado encontrado para o período selecionado.</Typography>
          </Box>
        ) : (
          <Box sx={{ flex: 1, minHeight: 320 }}>
            <ReactApexChart
              options={chartOptions}
              series={chartSeries}
              type="line"
              height={340}
            />
          </Box>
        )}

        {/* Footer info */}
        <Box sx={{ mt: 1, textAlign: 'right' }}>
          <Typography variant="caption" color="text.disabled">
            Referência: {format(filterDate, 'MMMM/yyyy', { locale: ptBR })}
            {selectedBank !== 'Todos' ? ` · ${selectedBank}` : ''}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
