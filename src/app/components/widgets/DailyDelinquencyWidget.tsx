'use client';

import { useMemo, useState, useEffect } from 'react';
import { useTheme, alpha } from '@mui/material/styles';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import {
  Card, CardContent, Typography, Box, IconButton, Tooltip,
  Menu, MenuItem, ListItemText, Avatar
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useDailyDelinquency, useToggleFavoriteWidget, useUserFavoriteWidgets } from '../../hooks/useDashboard';
import { DailyDelinquencyDto } from '../../services/dashboardService';
import WidgetLoading from '../ui/WidgetLoading';
import useUser from '@auth/useUser';
import { format, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DailyDelinquencyWidgetProps {
  initialIsFavorite?: boolean;
}

const WIDGET_ID = 20;

type RangePreset = '7d' | '30d' | '90d' | 'currentMonth' | 'lastMonth';

const PRESET_LABELS: Record<RangePreset, string> = {
  '7d': 'Últimos 7 dias',
  '30d': 'Últimos 30 dias',
  '90d': 'Últimos 90 dias',
  'currentMonth': 'Mês atual',
  'lastMonth': 'Mês passado',
};

function getRange(preset: RangePreset): { start: Date; end: Date } {
  const today = new Date();
  switch (preset) {
    case '7d': return { start: subDays(today, 6), end: today };
    case '30d': return { start: subDays(today, 29), end: today };
    case '90d': return { start: subDays(today, 89), end: today };
    case 'currentMonth': return { start: startOfMonth(today), end: endOfMonth(today) };
    case 'lastMonth': {
      const prev = subMonths(today, 1);
      return { start: startOfMonth(prev), end: endOfMonth(prev) };
    }
  }
}

export function DailyDelinquencyWidget({ initialIsFavorite = false }: DailyDelinquencyWidgetProps) {
  const theme = useTheme();
  const { data: user } = useUser();

  // Period selector
  const [preset, setPreset] = useState<RangePreset>('30d');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const { start, end } = useMemo(() => getRange(preset), [preset]);
  const apiStart = useMemo(() => format(start, 'yyyy-MM-dd'), [start]);
  const apiEnd = useMemo(() => format(end, 'yyyy-MM-dd'), [end]);

  // Data
  const { data: widgetData, isLoading } = useDailyDelinquency(apiStart, apiEnd);
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

  // Processed data
  const processedData = useMemo(() => {
    if (!widgetData || widgetData.length === 0) return null;
    const sorted = [...widgetData].sort((a, b) => a.data.localeCompare(b.data));
    const categories = sorted.map(d => format(new Date(d.data), 'dd/MM', { locale: ptBR }));
    const seriesDiario = sorted.map(d => d.valorDiario);
    const seriesAcumulado = sorted.map(d => d.valorAcumulado);
    const totalDiario = sorted.reduce((s, d) => s + d.valorDiario, 0);
    const totalAcumulado = sorted.length > 0 ? sorted[sorted.length - 1].valorAcumulado : 0;
    const peak = sorted.reduce((max, d) => d.valorDiario > max.valorDiario ? d : max, sorted[0]);
    const avgDiario = totalDiario / sorted.length;

    // Variation last 2 days
    const last2 = sorted.slice(-2);
    const variation = last2.length === 2 && last2[0].valorDiario !== 0
      ? ((last2[1].valorDiario - last2[0].valorDiario) / last2[0].valorDiario) * 100
      : 0;

    return { categories, seriesDiario, seriesAcumulado, totalDiario, totalAcumulado, peak, avgDiario, variation };
  }, [widgetData]);

  const formatCurrency = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Colors — diária: azul metálico / vermelho escuro
  const colorDiario = '#1565C0';  // azul metálico
  const colorAcumulado = '#B71C1C';  // vermelho escuro

  const chartOptions: ApexOptions = {
    chart: {
      type: 'line',
      stacked: false,
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: 'inherit',
      animations: { enabled: true, speed: 600 }
    },
    colors: [colorDiario, colorAcumulado],
    stroke: { width: [0, 3], curve: 'smooth' },
    plotOptions: {
      bar: {
        columnWidth: '60%',
        borderRadius: 3,
        borderRadiusApplication: 'end'
      }
    },
    fill: {
      type: ['gradient', 'solid'],
      gradient: {
        shade: 'dark',
        type: 'vertical',
        shadeIntensity: 0.4,
        opacityFrom: 0.9,
        opacityTo: 0.55,
        stops: [0, 100]
      }
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: processedData?.categories ?? [],
      tickAmount: Math.min(12, (processedData?.categories.length ?? 0)),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        rotate: -30,
        style: { colors: theme.palette.text.secondary, fontSize: '11px' }
      },
      tooltip: { enabled: false }
    },
    yaxis: [
      {
        seriesName: 'Diário',
        min: 0,
        forceNiceScale: true,
        title: {
          text: 'Valor Diário',
          style: { color: colorDiario, fontSize: '11px' }
        },
        labels: {
          style: { colors: colorDiario },
          formatter: (v) => v >= 1000 ? `R$${(v / 1000).toFixed(1)}k` : `R$${v.toFixed(0)}`
        }
      },
      {
        seriesName: 'Acumulado',
        opposite: true,
        title: {
          text: 'Acumulado',
          style: { color: colorAcumulado, fontSize: '11px' }
        },
        labels: {
          style: { colors: colorAcumulado },
          formatter: (v) => v >= 1000 ? `R$${(v / 1000).toFixed(1)}k` : `R$${v.toFixed(0)}`
        }
      }
    ],
    tooltip: {
      shared: true,
      intersect: false,
      theme: theme.palette.mode,
      x: { formatter: (_, opts) => processedData?.categories[opts.dataPointIndex] ?? '' },
      y: { formatter: (v) => formatCurrency(v) }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'center',
      labels: { colors: theme.palette.text.secondary }
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 3,
      padding: { right: 20 }
    },
    markers: {
      size: [0, 3],
      colors: [colorDiario, colorAcumulado],
      strokeWidth: 0,
      hover: { size: 6 }
    }
  };

  const chartSeries = [
    { name: 'Diário', type: 'column', data: processedData?.seriesDiario ?? [] },
    { name: 'Acumulado', type: 'line', data: processedData?.seriesAcumulado ?? [] }
  ];

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
          ? `linear-gradient(145deg, ${alpha(colorDiario, 0.07)} 0%, ${theme.palette.background.paper} 40%)`
          : `linear-gradient(145deg, ${alpha(colorDiario, 0.03)} 0%, ${theme.palette.background.paper} 40%)`
      }}
    >
      {/* ─── Header ─── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 2.5,
          borderBottom: `1px solid ${theme.palette.divider}`,
          background: alpha(colorDiario, 0.04)
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: alpha(colorDiario, 0.12), width: 40, height: 40, color: colorDiario }}>
            <FuseSvgIcon size={22}>heroicons-outline:calendar-days</FuseSvgIcon>
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              Inadimplência Diária
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              {format(start, 'dd/MM/yyyy', { locale: ptBR })} → {format(end, 'dd/MM/yyyy', { locale: ptBR })}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Period selector */}
          <Tooltip title="Selecionar período">
            <Box
              component="button"
              onClick={(e: any) => setAnchorEl(e.currentTarget)}
              sx={{
                px: 1.5, py: 0.5, borderRadius: 1.5,
                border: `1px solid ${alpha(colorDiario, 0.35)}`,
                bgcolor: alpha(colorDiario, 0.08),
                color: colorDiario,
                fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 0.5,
                '&:hover': { bgcolor: alpha(colorDiario, 0.15) }
              }}
            >
              <FuseSvgIcon size={14}>{openMenu ? 'heroicons-outline:chevron-up' : 'heroicons-outline:chevron-down'}</FuseSvgIcon>
              {PRESET_LABELS[preset]}
            </Box>
          </Tooltip>
          <Menu anchorEl={anchorEl} open={openMenu} onClose={() => setAnchorEl(null)}>
            {(Object.keys(PRESET_LABELS) as RangePreset[]).map(p => (
              <MenuItem key={p} selected={p === preset} onClick={() => { setPreset(p); setAnchorEl(null); }}>
                <ListItemText>{PRESET_LABELS[p]}</ListItemText>
              </MenuItem>
            ))}
          </Menu>

          {/* Favorite */}
          <Tooltip title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}>
            <IconButton onClick={handleToggleFavorite} size="small">
              <FuseSvgIcon sx={{ color: isFavorite ? '#FFD700' : 'action.active' }} size={20}>
                {isFavorite ? 'heroicons-solid:star' : 'heroicons-outline:star'}
              </FuseSvgIcon>
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <CardContent sx={{ display: 'flex', flexDirection: 'column', p: 3, '&:last-child': { pb: 3 } }}>
        {/* ─── KPI Cards ─── */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
          {[
            {
              label: 'Total no Período',
              value: formatCurrency(processedData?.totalDiario ?? 0),
              icon: 'heroicons-outline:banknotes',
              color: colorDiario
            },
            {
              label: 'Saldo Acumulado',
              value: formatCurrency(processedData?.totalAcumulado ?? 0),
              icon: 'heroicons-outline:arrow-trending-up',
              color: colorAcumulado
            },
            {
              label: 'Pico Diário',
              value: processedData?.peak ? formatCurrency(processedData.peak.valorDiario) : '—',
              icon: 'heroicons-outline:arrow-up-circle',
              color: '#0D47A1',
              sub: processedData?.peak
                ? format(new Date(processedData.peak.data), 'dd/MM/yy', { locale: ptBR })
                : null
            },
            {
              label: 'Variação (2 últimos dias)',
              value: processedData ? `${processedData.variation > 0 ? '+' : ''}${processedData.variation.toFixed(1)}%` : '—',
              icon: processedData && processedData.variation >= 0
                ? 'heroicons-outline:arrow-trending-up'
                : 'heroicons-outline:arrow-trending-down',
              color: processedData && processedData.variation >= 0 ? colorAcumulado : '#2E7D32',
              sub: null
            }
          ].map((card) => (
            <Box
              key={card.label}
              sx={{
                p: 2, borderRadius: 2,
                bgcolor: alpha(card.color, 0.06),
                border: `1px solid ${alpha(card.color, 0.18)}`
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.8 }}>
                <FuseSvgIcon size={15} sx={{ color: card.color }}>{card.icon}</FuseSvgIcon>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600, fontSize: '0.7rem' }}>
                  {card.label}
                </Typography>
              </Box>
              <Typography sx={{ fontWeight: 800, color: card.color, fontSize: '1rem', lineHeight: 1.2 }}>
                {card.value}
              </Typography>
              {card.sub && (
                <Typography variant="caption" sx={{ color: theme.palette.text.disabled, fontSize: '0.65rem' }}>
                  {card.sub}
                </Typography>
              )}
            </Box>
          ))}
        </Box>

        {/* ─── Chart ─── */}
        {!processedData ? (
          <Box sx={{ minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box sx={{ textAlign: 'center' }}>
              <FuseSvgIcon size={48} sx={{ color: alpha(colorDiario, 0.25), mb: 1 }}>
                heroicons-outline:face-smile
              </FuseSvgIcon>
              <Typography color="text.secondary" variant="body2" fontWeight={500}>
                Nenhuma inadimplência no período selecionado 🎉
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box sx={{ minHeight: 300 }}>
            <ReactApexChart
              options={chartOptions}
              series={chartSeries}
              type="line"
              height={320}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
