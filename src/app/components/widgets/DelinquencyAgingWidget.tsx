'use client';

import { useMemo, useState, useEffect } from 'react';
import { useTheme, alpha } from '@mui/material/styles';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import {
  Card, CardContent, Typography, Box, IconButton, Tooltip, Avatar, Chip
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useDelinquencyAging, useToggleFavoriteWidget, useUserFavoriteWidgets } from '../../hooks/useDashboard';
import { DelinquencyAgingDto } from '../../services/dashboardService';
import WidgetLoading from '../ui/WidgetLoading';
import useUser from '@auth/useUser';

interface DelinquencyAgingWidgetProps {
  initialIsFavorite?: boolean;
}

const WIDGET_ID = 21;

// Color gradient by aging severity
function agingColor(diasVencido: number): string {
  if (diasVencido <= 30) return '#F9A825'; // amarelo
  if (diasVencido <= 60) return '#EF6C00'; // laranja
  if (diasVencido <= 90) return '#D84315'; // laranja-vermelho
  if (diasVencido <= 180) return '#B71C1C'; // vermelho
  return '#4A148C';                         // roxo escuro (crítico)
}

function agingLabel(diasVencido: number): string {
  if (diasVencido <= 30) return 'Baixo';
  if (diasVencido <= 60) return 'Moderado';
  if (diasVencido <= 90) return 'Alto';
  if (diasVencido <= 180) return 'Crítico';
  return 'Grave';
}

export function DelinquencyAgingWidget({ initialIsFavorite = false }: DelinquencyAgingWidgetProps) {
  const theme = useTheme();
  const { data: user } = useUser();

  const { data: widgetData, isLoading } = useDelinquencyAging();
  const { data: favoriteWidgets } = useUserFavoriteWidgets(user?.id ? Number(user.id) : undefined);
  const toggleFavoriteMutation = useToggleFavoriteWidget();

  // Favorite
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

  // Derived - Raw sorted data for Table
  const sorted = useMemo(() =>
    widgetData ? [...widgetData].filter(d => d.valor > 0).sort((a, b) => a.diasVencido - b.diasVencido) : [],
    [widgetData]
  );

  // Aggregated Data for Chart (Cumulative 10+, 20+...)
  const chartBuckets = useMemo(() => {
    if (!widgetData) return [];

    const thresholds = [10, 20, 30, 40, 50, 60, 90];

    return thresholds.map(t => {
      // Cumulative: Include all debts with diasVencido >= t
      const filtered = widgetData.filter(d => d.valor > 0 && d.diasVencido >= t);
      const valor = filtered.reduce((acc, d) => acc + d.valor, 0);
      const qtd = filtered.reduce((acc, d) => acc + d.quantidade, 0);

      return {
        label: `${t}+ dias`,
        valor,
        qtd,
        color: agingColor(t)
      };
    }).filter(b => b.valor > 0);
  }, [widgetData]);

  const totals = useMemo(() => ({
    valor: sorted.reduce((s, d) => s + d.valor, 0),
    quantidade: sorted.reduce((s, d) => s + d.quantidade, 0)
  }), [sorted]);

  const formatCurrency = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Chart — horizontal bars by bucket
  const chartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: 'inherit',
      animations: { enabled: true, speed: 600 }
    },
    colors: chartBuckets.map(b => b.color),
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        distributed: true,
        dataLabels: { position: 'bottom' }
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'horizontal',
        shadeIntensity: 0.3,
        opacityFrom: 1,
        opacityTo: 0.75
      }
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: chartBuckets.map(b => b.label),
      labels: {
        formatter: (v) => {
          const n = Number(v);
          return n >= 1000 ? `R$${(n / 1000).toFixed(0)}k` : `R$${n.toFixed(0)}`;
        },
        style: { colors: theme.palette.text.secondary, fontSize: '11px' }
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: {
        style: { colors: theme.palette.text.primary, fontSize: '12px', fontWeight: '600' }
      }
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 3,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } }
    },
    legend: { show: false },
    tooltip: {
      theme: theme.palette.mode,
      custom: ({ series, seriesIndex, dataPointIndex }) => {
        const d = chartBuckets[dataPointIndex];
        if (!d) return '';
        return `
          <div style="padding:10px 14px;font-family:inherit;min-width:180px">
            <div style="font-weight:700;margin-bottom:6px;color:${d.color}">${d.label}</div>
            <div style="display:flex;justify-content:space-between;gap:12px">
              <span style="color:#888;font-size:12px">Valor</span>
              <strong>${formatCurrency(d.valor)}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;gap:12px;margin-top:2px">
              <span style="color:#888;font-size:12px">Qtd.</span>
              <strong>${d.qtd}</strong>
            </div>
          </div>`;
      }
    }
  };

  const chartSeries = [{ name: 'Valor', data: chartBuckets.map(b => b.valor) }];

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
          ? `linear-gradient(145deg, ${alpha('#B71C1C', 0.06)} 0%, ${theme.palette.background.paper} 40%)`
          : `linear-gradient(145deg, ${alpha('#F9A825', 0.04)} 0%, ${theme.palette.background.paper} 40%)`
      }}
    >
      {/* ─── Header ─── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          px: { xs: 2, md: 3 }, py: 2.5,
          borderBottom: `1px solid ${theme.palette.divider}`,
          background: alpha('#B71C1C', 0.03),
          flexWrap: 'wrap',
          gap: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: alpha('#B71C1C', 0.12), width: 40, height: 40, color: '#B71C1C' }}>
            <FuseSvgIcon size={22}>heroicons-outline:clock</FuseSvgIcon>
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2, fontSize: { xs: '1rem', md: '1.25rem' } }}>
              Envelhecimento de Inadimplência
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Distribuição por faixa de vencimento
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

      <CardContent sx={{ display: 'flex', flexDirection: 'column', p: { xs: 2, md: 3 }, '&:last-child': { pb: 3 } }}>
        {/* ─── KPI Summary ─── */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 3 }}>
          {[
            { label: 'Total em Aberto', value: formatCurrency(totals.valor), icon: 'heroicons-outline:banknotes', color: '#B71C1C' },
            { label: 'Total de Títulos', value: totals.quantidade.toLocaleString('pt-BR'), icon: 'heroicons-outline:document-text', color: '#EF6C00' }
          ].map(c => (
            <Box key={c.label} sx={{ p: 2.5, borderRadius: 2, bgcolor: alpha(c.color, 0.06), border: `1px solid ${alpha(c.color, 0.18)}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <FuseSvgIcon size={18} sx={{ color: c.color }}>{c.icon}</FuseSvgIcon>
                <Typography sx={{ color: theme.palette.text.secondary, fontWeight: 700, fontSize: '1rem' }}>{c.label}</Typography>
              </Box>
              <Typography sx={{ fontWeight: 800, color: c.color, fontSize: '2rem', lineHeight: 1.1 }}>{c.value}</Typography>
            </Box>
          ))}
        </Box>

        {/* ─── Legend chips ─── */}
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
          {[
            { label: 'Baixo (≤30 dias)', color: '#F57F17' },
            { label: 'Moderado (≤60 dias)', color: '#E65100' },
            { label: 'Alto (≤90 dias)', color: '#BF360C' },
            { label: 'Crítico (≤180 dias)', color: '#B71C1C' },
            { label: 'Grave (>180 dias)', color: '#4A148C' }
          ].map(l => (
            <Chip
              key={l.label}
              label={l.label}
              sx={{
                bgcolor: l.color,
                fontWeight: 700,
                fontSize: '0.85rem',
                height: 36,
                '& .MuiChip-label': { color: '#fff', px: 2 }
              }}
            />
          ))}
        </Box>

        {/* ─── Chart ─── */}
        {sorted.length === 0 ? (
          <Box sx={{ minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box sx={{ textAlign: 'center' }}>
              <FuseSvgIcon size={48} sx={{ color: alpha('#F9A825', 0.3), mb: 1 }}>heroicons-outline:face-smile</FuseSvgIcon>
              <Typography color="text.secondary" variant="body2" fontWeight={500}>
                Nenhum título vencido no momento 🎉
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box sx={{ minHeight: 280 }}>
            <ReactApexChart
              options={chartOptions}
              series={chartSeries}
              type="bar"
              height={Math.max(280, chartBuckets.length * 52 + 60)}
            />
          </Box>
        )}

        {/* ─── Detail table ─── */}
        {sorted.length > 0 && (
          <Box sx={{ mt: 2, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, overflow: 'hidden' }}>
            {/* Header */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '3fr 2fr', md: '3fr 1fr 2fr 1fr' }, px: 2, py: 1, bgcolor: alpha('#B71C1C', 0.06), borderBottom: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: theme.palette.text.secondary }}>Faixa</Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: theme.palette.text.secondary, display: { xs: 'none', md: 'block' } }}>Títulos</Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: theme.palette.text.secondary }}>Valor</Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: theme.palette.text.secondary, display: { xs: 'none', md: 'block' } }}>Risco</Typography>
            </Box>
            {sorted.map((row: DelinquencyAgingDto, i) => {
              const color = agingColor(row.diasVencido);
              const pct = totals.valor > 0 ? (row.valor / totals.valor * 100).toFixed(1) : '0';
              return (
                <Box
                  key={i}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '3fr 2fr', md: '3fr 1fr 2fr 1fr' },
                    px: 2, py: 0.9,
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                    '&:last-child': { borderBottom: 'none' },
                    '&:hover': { bgcolor: alpha(color, 0.03) }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
                    <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                      {row.descricao || `${row.diasVencido} dias`}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 500, display: { xs: 'none', md: 'block' } }}>
                    {row.quantidade}
                  </Typography>
                  <Typography variant="caption" sx={{ color, fontWeight: 700 }}>
                    {formatCurrency(row.valor)}
                  </Typography>
                  <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                    <Chip
                      label={`${pct}%`}
                      size="small"
                      sx={{ bgcolor: alpha(color, 0.1), color, border: `1px solid ${alpha(color, 0.25)}`, fontWeight: 700, fontSize: '0.65rem', height: 20 }}
                    />
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
