import { useMemo, useState } from 'react';
import { useTheme, alpha } from '@mui/material/styles';
import { Card, Typography, Box, IconButton, Tooltip, Menu, MenuItem, ListItemIcon, ListItemText, Divider, Dialog, DialogContent, DialogActions, Button, Avatar } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useCashFlowEvolution, useToggleFavoriteWidget } from '../../hooks/useDashboard';
import WidgetLoading from '../ui/WidgetLoading';
import useUser from '@auth/useUser';
import { format, subDays, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

interface CashFlowEvolutionWidgetProps {
  initialIsFavorite?: boolean;
}

function MetricItem({ label, value, color, money = false, bold = false }: { label: string, value: number, color: string, money?: boolean, bold?: boolean }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Typography variant="caption" color="text.secondary" fontWeight={500}>
        {label}
      </Typography>
      <Typography variant="body1" fontWeight={bold ? 700 : 600} sx={{ color: color }}>
        {money
          ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
          : value.toLocaleString('pt-BR')}
      </Typography>
    </Box>
  );
}

export function CashFlowEvolutionWidget({ initialIsFavorite = false }: CashFlowEvolutionWidgetProps) {
  const theme = useTheme();
  const { data: user } = useUser();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);

  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(endOfMonth(new Date()));

  const apiStartDate = useMemo(() => format(startDate, 'yyyy-MM-dd'), [startDate]);
  const apiEndDate = useMemo(() => format(endDate, 'yyyy-MM-dd'), [endDate]);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const [tempStart, setTempStart] = useState<Date>(startDate);
  const [tempEnd, setTempEnd] = useState<Date>(endDate);

  const handleClickMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => setAnchorEl(null);

  const handleSelectPredefined = (days: number | 'current_month') => {
    const today = new Date();
    if (days === 'current_month') {
      setStartDate(startOfMonth(today));
      setEndDate(endOfMonth(today));
    } else {
      setStartDate(subDays(today, days));
      setEndDate(today);
    }
    handleCloseMenu();
  };

  const handleCustomRangeClick = () => {
    handleCloseMenu();
    setDateRangeOpen(true);
  };

  const handleDateRangeClose = () => {
    setDateRangeOpen(false);
    setTempStart(startDate);
    setTempEnd(endDate);
  };

  const handleDateRangeConfirm = () => {
    if (tempStart && tempEnd) {
      setStartDate(tempStart);
      setEndDate(tempEnd);
    }
    setDateRangeOpen(false);
  };

  const getFilterLabel = () => {
    const start = startDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    const end = endDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    return `${start} - ${end}`;
  };

  const { data: widgetData, isLoading } = useCashFlowEvolution(apiStartDate, apiEndDate);

  const toggleFavoriteMutation = useToggleFavoriteWidget();

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.id) return;
    const newStatus = !isFavorite;
    setIsFavorite(newStatus);
    toggleFavoriteMutation.mutate(
      { codUsu: Number(user.id), widgetId: 17, isFavorite: newStatus },
      { onError: () => setIsFavorite(!newStatus) }
    );
  };

  const processedData = useMemo(() => {
    if (!widgetData || widgetData.length === 0) return { series: [], categories: [], totals: { entrada: 0, saida: 0, saldo: 0 } };

    const groupedByDate = widgetData.reduce((acc, curr) => {
      const dateKey = curr.data.split('T')[0];
      if (!acc[dateKey]) {
        acc[dateKey] = { date: dateKey, totalEntrada: 0, totalSaida: 0, saldoDoDia: 0, saldoAcumulado: curr.saldoAcumulado };
      }
      acc[dateKey].totalEntrada += curr.totalEntrada;
      // Garantir que saída seja sempre valor positivo (Math.abs)
      acc[dateKey].totalSaida += Math.abs(curr.totalSaida);
      acc[dateKey].saldoDoDia += curr.saldoDoDia;
      acc[dateKey].saldoAcumulado = curr.saldoAcumulado;
      return acc;
    }, {} as Record<string, any>);

    const sortedDates = Object.keys(groupedByDate).sort();
    const categories = sortedDates.map(d => format(parseISO(d), 'dd/MM'));
    const seriesEntrada = sortedDates.map(d => Math.abs(groupedByDate[d].totalEntrada));
    const seriesSaida = sortedDates.map(d => Math.abs(groupedByDate[d].totalSaida));
    const seriesSaldo = sortedDates.map(d => groupedByDate[d].saldoAcumulado);

    const totals = widgetData.reduce((acc, curr) => ({
      entrada: acc.entrada + Math.abs(curr.totalEntrada),
      saida: acc.saida + Math.abs(curr.totalSaida),
      saldo: acc.saldo + curr.totalEntrada - Math.abs(curr.totalSaida)
    }), { entrada: 0, saida: 0, saldo: 0 });

    // Calcular o máximo para o eixo Y esquerdo para garantir que min=0 funcione
    const maxBarValue = Math.max(...seriesEntrada, ...seriesSaida, 1);

    return {
      series: [
        { name: 'Entradas', type: 'column', data: seriesEntrada },
        { name: 'Saídas', type: 'column', data: seriesSaida },
        { name: 'Saldo Acumulado', type: 'line', data: seriesSaldo }
      ], categories, totals, maxBarValue
    };
  }, [widgetData]);

  // Cores metálicas
  const colorEntradas = '#2E7D32'; // Verde metálico escuro
  const colorSaidas = '#C62828';   // Vermelho metálico escuro
  const colorSaldo = theme.palette.secondary.main; // Saldo (cor secundária do tema)

  const chartOptions: ApexOptions = {
    chart: {
      // CRITICAL: usar 'bar' como tipo base para grouped bars + line overlay
      type: 'line',
      stacked: false,
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: 'inherit',
      animations: { enabled: false } // Desabilitar para debug visual
    },
    colors: [colorEntradas, colorSaidas, colorSaldo],
    stroke: {
      // 0 = sem linha (bar), 0 = sem linha (bar), 3 = linha para Saldo
      width: [0, 0, 3],
      curve: 'smooth',
      colors: ['transparent', 'transparent', colorSaldo]
    },
    plotOptions: {
      bar: {
        columnWidth: '55%',
        borderRadius: 3,
        // NÃO usar distributed nem dataLabels com posição top para barras
      }
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: processedData.categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false }
    },
    yaxis: [
      {
        // Eixo Y ESQUERDO para Entradas e Saídas
        // CRITICAL FIX: min: 0 garante que barras comecem do zero
        // e não afeta o zero visual quando o eixo direito tem negativos
        seriesName: 'Entradas',
        min: 0,
        forceNiceScale: true,
        title: {
          text: 'Movimentação',
          style: { color: theme.palette.text.secondary }
        },
        labels: {
          style: { colors: theme.palette.text.secondary },
          formatter: (value) => {
            if (value >= 1000) return `R$${(value / 1000).toFixed(0)}k`;
            return `R$${value.toFixed(0)}`;
          }
        }
      },
      {
        // Segundo yaxis para Saídas pero usando o mesmo eixo visual (hidden)
        seriesName: 'Saídas',
        show: false,
        min: 0,
        forceNiceScale: true,
      },
      {
        // Eixo Y DIREITO para Saldo Acumulado (pode ter negativos)
        seriesName: 'Saldo Acumulado',
        opposite: true,
        title: {
          text: 'Saldo Acumulado',
          style: { color: colorSaldo }
        },
        labels: {
          style: { colors: colorSaldo },
          formatter: (value) => {
            if (Math.abs(value) >= 1000) return `R$${(value / 1000).toFixed(0)}k`;
            return `R$${value.toFixed(0)}`;
          }
        }
      }
    ],
    tooltip: {
      y: {
        formatter: (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      },
      theme: theme.palette.mode
    },
    legend: {
      position: 'top',
      horizontalAlign: 'center',
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 3
    }
  };

  if (isLoading) return <WidgetLoading height={500} />;

  return (
    <Card elevation={0} sx={{ height: '100%', border: `1px solid ${theme.palette.divider}`, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 3, pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Evolução do Fluxo de Caixa
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Receitas, despesas e saldo ao longo do tempo
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={(e: any) => handleClickMenu(e)}
            startIcon={<FuseSvgIcon size={16}>heroicons-outline:calendar</FuseSvgIcon>}
            endIcon={<FuseSvgIcon size={16}>heroicons-solid:chevron-down</FuseSvgIcon>}
            sx={{ borderRadius: '8px', textTransform: 'none', color: 'text.secondary', borderColor: 'divider' }}
          >
            {getFilterLabel()}
          </Button>

          <Tooltip title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}>
            <IconButton size="small" onClick={handleToggleFavorite}>
              <FuseSvgIcon size={20} sx={{ color: isFavorite ? "#FFD700" : "action.disabled" }}>
                {isFavorite ? 'heroicons-solid:star' : 'heroicons-outline:star'}
              </FuseSvgIcon>
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Summary Metrics */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
          <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha(colorEntradas, 0.08), border: `1px solid ${alpha(colorEntradas, 0.3)}`, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: alpha(colorEntradas, 0.2), color: colorEntradas }}>
              <FuseSvgIcon>heroicons-outline:arrow-trending-up</FuseSvgIcon>
            </Avatar>
            <MetricItem label="Total Entradas" value={processedData.totals.entrada} color={colorEntradas} money bold />
          </Box>
          <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha(colorSaidas, 0.08), border: `1px solid ${alpha(colorSaidas, 0.3)}`, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: alpha(colorSaidas, 0.2), color: colorSaidas }}>
              <FuseSvgIcon>heroicons-outline:arrow-trending-down</FuseSvgIcon>
            </Avatar>
            <MetricItem label="Total Saídas" value={processedData.totals.saida} color={colorSaidas} money bold />
          </Box>
          <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha(colorSaldo, 0.08), border: `1px solid ${alpha(colorSaldo, 0.3)}`, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: alpha(colorSaldo, 0.2), color: colorSaldo }}>
              <FuseSvgIcon>heroicons-outline:scale</FuseSvgIcon>
            </Avatar>
            <MetricItem label="Resultado do Período" value={processedData.totals.saldo} color={colorSaldo} money bold />
          </Box>
        </Box>

        {/* Chart */}
        <Box sx={{ flex: 1, minHeight: 350 }}>
          <ReactApexChart
            options={chartOptions}
            series={processedData.series}
            type="line"
            height="100%"
          />
        </Box>
      </Box>

      {/* Filter Menu */}
      <Menu
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { sx: { mt: 1, minWidth: 220, borderRadius: 2, boxShadow: theme.shadows[8] } } }}
      >
        <MenuItem onClick={() => handleSelectPredefined('current_month')} selected={startDate.getMonth() === new Date().getMonth() && endDate.getMonth() === new Date().getMonth()}>
          <ListItemIcon><FuseSvgIcon size={18}>heroicons-outline:calendar</FuseSvgIcon></ListItemIcon>
          <ListItemText>Mês Atual</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleSelectPredefined(30)}>
          <ListItemIcon><FuseSvgIcon size={18}>heroicons-outline:clock</FuseSvgIcon></ListItemIcon>
          <ListItemText>Últimos 30 dias</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleSelectPredefined(90)}>
          <ListItemIcon><FuseSvgIcon size={18}>heroicons-outline:clock</FuseSvgIcon></ListItemIcon>
          <ListItemText>Últimos 90 dias</ListItemText>
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={handleCustomRangeClick}>
          <ListItemIcon><FuseSvgIcon size={18}>heroicons-outline:adjustments-horizontal</FuseSvgIcon></ListItemIcon>
          <ListItemText>Personalizado...</ListItemText>
        </MenuItem>
      </Menu>

      {/* Date Range Dialog */}
      <Dialog open={dateRangeOpen} onClose={handleDateRangeClose} PaperProps={{ sx: { borderRadius: 3, minWidth: 320 } }}>
        <DialogContent sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
            <DatePicker label="Data Inicial" value={tempStart} onChange={(newValue) => setTempStart(newValue || startDate)} slotProps={{ textField: { fullWidth: true } }} />
            <DatePicker label="Data Final" value={tempEnd} onChange={(newValue) => setTempEnd(newValue || endDate)} slotProps={{ textField: { fullWidth: true } }} />
          </LocalizationProvider>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleDateRangeClose} color="inherit">Cancelar</Button>
          <Button onClick={handleDateRangeConfirm} variant="contained" color="primary">Confirmar</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
