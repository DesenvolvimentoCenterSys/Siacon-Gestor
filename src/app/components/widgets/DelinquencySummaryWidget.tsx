'use client';

import { useMemo, useState, useEffect } from 'react';
import { useTheme, alpha } from '@mui/material/styles';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import {
  Card, CardContent, Typography, Box, IconButton, Tooltip, Avatar, Chip, Button, ButtonGroup, Tabs, Tab,
  Dialog, DialogContent, DialogActions
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useDelinquencySummary, useDelinquencySummaryReferencia, useToggleFavoriteWidget, useUserFavoriteWidgets } from '../../hooks/useDashboard';
import WidgetLoading from '../ui/WidgetLoading';
import useUser from '@auth/useUser';
import { format, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DelinquencySummaryWidgetProps {
  initialIsFavorite?: boolean;
}

const WIDGET_ID = 22;

const COLOR_INADIMPLENTE = '#B71C1C';
const COLOR_ADIMPLENTE = '#1B5E20';
const COLOR_A_RECEBER = '#1565C0';
const COLOR_FATURADO = '#4A148C';

const PRESETS = [
  { label: 'Hoje', days: 0 },
  { label: '7 dias', days: 7 },
  { label: '30 dias', days: 30 },
  { label: 'Mês atual', days: -1 },
  { label: 'Mês anterior', days: -2 },
  { label: 'Personalizado', days: -3 }
];

function toISO(d: Date) { return format(d, "yyyy-MM-dd'T'HH:mm:ss"); }

export function DelinquencySummaryWidget({ initialIsFavorite = false }: DelinquencySummaryWidgetProps) {
  const theme = useTheme();
  const { data: user } = useUser();

  const [preset, setPreset] = useState(2);
  const [customStart, setCustomStart] = useState<Date | null>(subDays(new Date(), 30));
  const [customEnd, setCustomEnd] = useState<Date | null>(new Date());

  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [tempStart, setTempStart] = useState<Date | null>(customStart);
  const [tempEnd, setTempEnd] = useState<Date | null>(customEnd);

  const { startDate, endDate } = useMemo(() => {
    const today = new Date();
    if (PRESETS[preset].days === -3) {
      return { startDate: toISO(customStart || today), endDate: toISO(customEnd || today) };
    }
    if (PRESETS[preset].days === 0) {
      return { startDate: toISO(today), endDate: toISO(today) };
    }
    if (PRESETS[preset].days === -1) {
      return { startDate: toISO(startOfMonth(today)), endDate: toISO(endOfMonth(today)) };
    }
    if (PRESETS[preset].days === -2) {
      const prev = subMonths(today, 1);
      return { startDate: toISO(startOfMonth(prev)), endDate: toISO(endOfMonth(prev)) };
    }
    return { startDate: toISO(subDays(today, PRESETS[preset].days)), endDate: toISO(today) };
  }, [preset]);

  const [tabIndex, setTabIndex] = useState(0);
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const { data: vencimentoData, isLoading: isLoadingVencimento } = useDelinquencySummary(startDate, endDate);
  const { data: competenciaData, isLoading: isLoadingCompetencia } = useDelinquencySummaryReferencia(startDate, endDate);

  const summary = tabIndex === 0 ? vencimentoData : competenciaData;
  const isLoading = tabIndex === 0 ? isLoadingVencimento : isLoadingCompetencia;
  const { data: favoriteWidgets } = useUserFavoriteWidgets(user?.id ? Number(user.id) : undefined);
  const toggleFavoriteMutation = useToggleFavoriteWidget();

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

  const formatCurrency = (v: number) =>
    (v ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatPct = (v: number) => `${(v ?? 0).toFixed(1)}%`;

  const chartOptions: ApexOptions = {
    chart: {
      type: 'donut',
      toolbar: { show: false },
      fontFamily: 'inherit',
      animations: { enabled: true, speed: 700 }
    },
    colors: [COLOR_INADIMPLENTE, COLOR_ADIMPLENTE, COLOR_A_RECEBER],
    labels: ['Inadimplente', 'Adimplente', 'A Receber'],
    legend: {
      position: 'bottom',
      labels: { colors: theme.palette.text.secondary },
      fontSize: '13px'
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Inadimplência',
              fontSize: '13px',
              color: theme.palette.text.secondary,
              formatter: () => formatPct(summary?.percentualInadimplencia ?? 0)
            },
            value: {
              fontSize: '20px',
              fontWeight: 700,
              formatter: (v) => {
                const n = Number(v);
                return n >= 1000000
                  ? `R$${(n / 1000000).toFixed(1)}M`
                  : n >= 1000
                    ? `R$${(n / 1000).toFixed(0)}k`
                    : `R$${n.toFixed(0)}`;
              }
            }
          }
        }
      }
    },
    dataLabels: { enabled: false },
    tooltip: {
      theme: theme.palette.mode,
      y: { formatter: (v) => formatCurrency(v) }
    },
    stroke: { width: 0 }
  };

  const chartSeries = summary
    ? [summary.totalInadimplente, summary.totalAdimplente, summary.totalAReceber]
    : [0, 0, 0];

  if (isLoading) return <WidgetLoading height={480} />;

  return (
    <Card
      elevation={0}
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        overflow: 'hidden',
        background: theme.palette.mode === 'dark'
          ? `linear-gradient(145deg, ${alpha('#4A148C', 0.06)} 0%, ${theme.palette.background.paper} 40%)`
          : `linear-gradient(145deg, ${alpha('#4A148C', 0.03)} 0%, ${theme.palette.background.paper} 40%)`
      }}
    >
      <Box
        sx={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          px: { xs: 2, md: 3 }, py: 2.5,
          borderBottom: `1px solid ${theme.palette.divider}`,
          background: alpha('#4A148C', 0.03),
          flexWrap: 'wrap',
          gap: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: alpha('#4A148C', 0.12), width: 40, height: 40, color: '#4A148C' }}>
            <FuseSvgIcon size={22}>heroicons-outline:chart-pie</FuseSvgIcon>
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2, fontSize: { xs: '1rem', md: '1.25rem' } }}>
              Resumo de Inadimplência
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Visão consolidada — faturado, inadimplente, adimplente e a receber
            </Typography>
          </Box>
        </Box>

        <Tooltip title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}>
          <IconButton onClick={handleToggleFavorite} size="small" sx={{ minWidth: 44, minHeight: 44 }}>
            <FuseSvgIcon sx={{ color: isFavorite ? '#FFD700' : 'action.active' }} size={20}>
              {isFavorite ? 'heroicons-solid:star' : 'heroicons-outline:star'}
            </FuseSvgIcon>
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: { xs: 2, md: 3 } }}>
        <Tabs value={tabIndex} onChange={handleTabChange} aria-label="delinquency summary tabs">
          <Tab label="Por Vencimento" />
          <Tab label="Por Competência" />
        </Tabs>
      </Box>

      <CardContent sx={{ display: 'flex', flexDirection: 'column', p: { xs: 2, md: 3 }, '&:last-child': { pb: 3 } }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: { xs: 'flex-start', md: 'flex-end' },
            mb: 3,
            overflowX: 'auto',
            pb: 1,
            mx: { xs: -2, md: 0 },
            px: { xs: 2, md: 0 },
            '::-webkit-scrollbar': { height: 4, display: 'none' },
            scrollbarWidth: 'none'
          }}
        >
          <ButtonGroup size="small" variant="outlined" sx={{ minWidth: 'max-content' }}>
            {PRESETS.map((p, i) => (
              <Button
                key={p.label}
                onClick={() => {
                  if (p.days === -3) {
                    setTempStart(customStart);
                    setTempEnd(customEnd);
                    setDatePickerOpen(true);
                  } else {
                    setPreset(i);
                  }
                }}
                sx={{
                  fontWeight: preset === i ? 700 : 400,
                  bgcolor: preset === i ? alpha('#4A148C', 0.1) : 'transparent',
                  borderColor: alpha('#4A148C', 0.3),
                  color: preset === i ? '#4A148C' : 'text.secondary',
                  '&:hover': { bgcolor: alpha('#4A148C', 0.08), borderColor: '#4A148C' },
                  whiteSpace: 'nowrap',
                  height: 40,
                  px: 2
                }}
              >
                {p.label}
              </Button>
            ))}
          </ButtonGroup>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
          {[
            { label: 'Total Faturado', value: formatCurrency(summary?.totalFaturado ?? 0), color: COLOR_FATURADO, icon: 'heroicons-outline:banknotes' },
            { label: 'Inadimplente', value: formatCurrency(summary?.totalInadimplente ?? 0), color: COLOR_INADIMPLENTE, icon: 'heroicons-outline:exclamation-triangle' },
            { label: 'Adimplente', value: formatCurrency(summary?.totalAdimplente ?? 0), color: COLOR_ADIMPLENTE, icon: 'heroicons-outline:check-circle' },
            { label: 'A Receber', value: formatCurrency(summary?.totalAReceber ?? 0), color: COLOR_A_RECEBER, icon: 'heroicons-outline:clock' }
          ].map(c => (
            <Box key={c.label} sx={{ p: 2.5, borderRadius: 2, bgcolor: alpha(c.color, 0.06), border: `1px solid ${alpha(c.color, 0.18)}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <FuseSvgIcon size={18} sx={{ color: c.color }}>{c.icon}</FuseSvgIcon>
                <Typography sx={{ color: theme.palette.text.secondary, fontWeight: 700, fontSize: '1rem' }}>{c.label}</Typography>
              </Box>
              <Typography sx={{ fontWeight: 800, color: c.color, fontSize: { xs: '1.5rem', md: '1.6rem' }, lineHeight: 1.1 }}>{c.value}</Typography>
            </Box>
          ))}
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 3 }}>
          {[
            { label: `Inadimplência: ${formatPct(summary?.percentualInadimplencia ?? 0)}`, color: COLOR_INADIMPLENTE },
            { label: `Adimplência: ${formatPct(summary?.percentualAdimplencia ?? 0)}`, color: COLOR_ADIMPLENTE },
            { label: `A Receber: ${formatPct(summary?.percentualAReceber ?? 0)}`, color: COLOR_A_RECEBER }
          ].map(c => (
            <Chip
              key={c.label}
              label={c.label}
              sx={{
                bgcolor: c.color,
                fontWeight: 700,
                fontSize: '0.85rem',
                height: 36,
                '& .MuiChip-label': { color: '#fff', px: 2 }
              }}
            />
          ))}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <ReactApexChart
            options={chartOptions}
            series={chartSeries}
            type="donut"
            height={320}
            width="100%"
          />
        </Box>
      </CardContent>

      <Dialog open={datePickerOpen} onClose={() => setDatePickerOpen(false)} maxWidth="xs" fullWidth>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Período Personalizado</Typography>
            <DatePicker
              label="Data Inicial"
              value={tempStart}
              onChange={(date) => setTempStart(date)}
              format="dd/MM/yyyy"
              slotProps={{ textField: { fullWidth: true } }}
            />
            <DatePicker
              label="Data Final"
              value={tempEnd}
              onChange={(date) => setTempEnd(date)}
              format="dd/MM/yyyy"
              slotProps={{ textField: { fullWidth: true } }}
              minDate={tempStart || undefined}
            />
          </Box>
        </LocalizationProvider>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setDatePickerOpen(false)} color="inherit">Cancelar</Button>
          <Button
            variant="contained"
            onClick={() => {
              setCustomStart(tempStart);
              setCustomEnd(tempEnd);
              const customIndex = PRESETS.findIndex(p => p.days === -3);
              if (customIndex !== -1) setPreset(customIndex);
              setDatePickerOpen(false);
            }}
            color="primary"
          >
            Aplicar
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
