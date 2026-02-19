'use client';

import { useMemo, useState, useEffect } from 'react';
import { useTheme, alpha } from '@mui/material/styles';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import {
  Card, CardContent, Typography, Box, IconButton, Tooltip,
  Menu, MenuItem, ListItemIcon, ListItemText, Chip, Avatar
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useAccumulatedDelinquency, useToggleFavoriteWidget, useUserFavoriteWidgets } from '../../hooks/useDashboard';
import { AccumulatedDelinquencyDto } from '../../services/dashboardService';
import WidgetLoading from '../ui/WidgetLoading';
import useUser from '@auth/useUser';

interface AccumulatedDelinquencyWidgetProps {
  initialIsFavorite?: boolean;
}

const WIDGET_ID = 19;

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export function AccumulatedDelinquencyWidget({ initialIsFavorite = false }: AccumulatedDelinquencyWidgetProps) {
  const theme = useTheme();
  const { data: user } = useUser();

  // Year filter
  const currentYear = new Date().getFullYear();
  const availableYears = useMemo(() =>
    Array.from({ length: 5 }, (_, i) => currentYear - i), [currentYear]
  );
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const handleClickMenu = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);
  const handleSelectYear = (year: number) => { setSelectedYear(year); handleCloseMenu(); };

  // Data
  const { data: widgetData, isLoading } = useAccumulatedDelinquency(selectedYear);
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

  // Processed chart data
  const processedData = useMemo(() => {
    if (!widgetData || widgetData.length === 0) return null;

    const sorted = [...widgetData].sort((a, b) => a.mes - b.mes);
    const categories = sorted.map(d => MONTHS[d.mes - 1] ?? `Mês ${d.mes}`);
    const seriesMensal = sorted.map(d => d.valorMensal);
    const seriesAcumulado = sorted.map(d => d.valorAcumulado);

    const totalMensal = sorted.reduce((s, d) => s + d.valorMensal, 0);
    const totalAcumulado = sorted.length > 0 ? sorted[sorted.length - 1].valorAcumulado : 0;
    const peakMonth = sorted.reduce((max, d) => d.valorMensal > max.valorMensal ? d : max, sorted[0]);
    const avgMensal = totalMensal / sorted.length;

    // Month-over-month variation
    const lastTwo = sorted.slice(-2);
    const variation = lastTwo.length === 2 && lastTwo[0].valorMensal !== 0
      ? ((lastTwo[1].valorMensal - lastTwo[0].valorMensal) / lastTwo[0].valorMensal) * 100
      : 0;

    return { categories, seriesMensal, seriesAcumulado, totalMensal, totalAcumulado, peakMonth, avgMensal, variation };
  }, [widgetData]);

  const formatCurrency = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Colors — inadimplência = vermelho/laranja escuro
  const colorMensal = '#B71C1C';  // Vermelho escuro profundo
  const colorAcumulado = '#FF6F00';  // Âmbar escuro
  const colorGrid = theme.palette.divider;

  const chartOptions: ApexOptions = {
    chart: {
      type: 'line',
      stacked: false,
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: 'inherit',
      animations: { enabled: true, speed: 600 }
    },
    colors: [colorMensal, colorAcumulado],
    stroke: { width: [0, 3], curve: 'smooth' },
    plotOptions: {
      bar: {
        columnWidth: '50%',
        borderRadius: 4,
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
        opacityTo: 0.6,
        stops: [0, 100]
      }
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: processedData?.categories ?? [],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: theme.palette.text.secondary, fontSize: '12px' } },
      tooltip: { enabled: false }
    },
    yaxis: [
      {
        seriesName: 'Mensal',
        min: 0,
        forceNiceScale: true,
        title: {
          text: 'Inadimplência Mensal',
          style: { color: colorMensal, fontSize: '11px' }
        },
        labels: {
          style: { colors: colorMensal },
          formatter: (v) => v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${v.toFixed(0)}`
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
          formatter: (v) => v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${v.toFixed(0)}`
        }
      }
    ],
    tooltip: {
      shared: true,
      intersect: false,
      theme: theme.palette.mode,
      y: { formatter: (v) => formatCurrency(v) }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'center',
      labels: { colors: theme.palette.text.secondary }
    },
    grid: {
      borderColor: colorGrid,
      strokeDashArray: 3,
      padding: { right: 20 }
    },
    markers: {
      size: [0, 4],
      colors: [colorMensal, colorAcumulado],
      strokeWidth: 0,
      hover: { size: 7 }
    }
  };

  const chartSeries = [
    { name: 'Mensal', type: 'column', data: processedData?.seriesMensal ?? [] },
    { name: 'Acumulado', type: 'line', data: processedData?.seriesAcumulado ?? [] }
  ];

  if (isLoading) return <WidgetLoading height={520} />;

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
          : `linear-gradient(145deg, ${alpha('#B71C1C', 0.03)} 0%, ${theme.palette.background.paper} 40%)`
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
          background: alpha(colorMensal, 0.04)
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            sx={{
              bgcolor: alpha(colorMensal, 0.12),
              width: 40, height: 40,
              color: colorMensal
            }}
          >
            <FuseSvgIcon size={22}>heroicons-outline:exclamation-triangle</FuseSvgIcon>
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2, color: theme.palette.text.primary }}>
              Inadimplência Acumulada
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              Evolução mensal e acumulada · {selectedYear}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Year filter */}
          <Tooltip title="Filtrar por ano">
            <Chip
              label={selectedYear}
              size="small"
              onClick={handleClickMenu}
              icon={<FuseSvgIcon size={14}>heroicons-outline:calendar</FuseSvgIcon>}
              sx={{
                fontWeight: 700,
                bgcolor: alpha(colorMensal, 0.1),
                color: colorMensal,
                border: `1px solid ${alpha(colorMensal, 0.3)}`,
                '&:hover': { bgcolor: alpha(colorMensal, 0.18) }
              }}
            />
          </Tooltip>
          <Menu anchorEl={anchorEl} open={openMenu} onClose={handleCloseMenu}>
            {availableYears.map(year => (
              <MenuItem key={year} selected={year === selectedYear} onClick={() => handleSelectYear(year)}>
                <ListItemText>{year}</ListItemText>
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

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3, '&:last-child': { pb: 3 } }}>
        {/* ─── KPI Cards ─── */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
          {[
            {
              label: 'Total Mensal (ano)',
              value: formatCurrency(processedData?.totalMensal ?? 0),
              icon: 'heroicons-outline:banknotes',
              color: colorMensal,
              sub: null
            },
            {
              label: 'Saldo Acumulado',
              value: formatCurrency(processedData?.totalAcumulado ?? 0),
              icon: 'heroicons-outline:arrow-trending-up',
              color: colorAcumulado,
              sub: null
            },
            {
              label: 'Pico Mensal',
              value: processedData?.peakMonth ? formatCurrency(processedData.peakMonth.valorMensal) : '—',
              icon: 'heroicons-outline:arrow-up-circle',
              color: '#C62828',
              sub: processedData?.peakMonth ? MONTHS[processedData.peakMonth.mes - 1] : null
            },
            {
              label: 'Variação Último Mês',
              value: processedData ? `${processedData.variation > 0 ? '+' : ''}${processedData.variation.toFixed(1)}%` : '—',
              icon: processedData && processedData.variation >= 0 ? 'heroicons-outline:arrow-trending-up' : 'heroicons-outline:arrow-trending-down',
              color: processedData && processedData.variation >= 0 ? '#C62828' : '#2E7D32',
              sub: 'vs. mês anterior'
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
                <FuseSvgIcon size={17} sx={{ color: card.color }}>{card.icon}</FuseSvgIcon>
                <Typography sx={{ color: theme.palette.text.secondary, fontWeight: 700, fontSize: '0.9rem' }}>
                  {card.label}
                </Typography>
              </Box>
              <Typography sx={{ fontWeight: 800, color: card.color, fontSize: '1.6rem', lineHeight: 1.1 }}>
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
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box sx={{ textAlign: 'center' }}>
              <FuseSvgIcon size={48} sx={{ color: alpha(colorMensal, 0.3), mb: 1 }}>
                heroicons-outline:face-smile
              </FuseSvgIcon>
              <Typography color="text.secondary" variant="body2" fontWeight={500}>
                Nenhuma inadimplência registrada em {selectedYear} 🎉
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box sx={{ flex: 1, minHeight: 300 }}>
            <ReactApexChart
              options={chartOptions}
              series={chartSeries}
              type="line"
              height={320}
            />
          </Box>
        )}

        {/* ─── Footer table (monthly breakdown) ─── */}
        {processedData && widgetData && widgetData.length > 0 && (
          <Box sx={{ mt: 2, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, overflow: 'hidden' }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '2fr 2fr 2fr',
                px: 2, py: 1,
                bgcolor: alpha(colorMensal, 0.07),
                borderBottom: `1px solid ${theme.palette.divider}`
              }}
            >
              {['Mês', 'Mensal', 'Acumulado'].map(h => (
                <Typography key={h} variant="caption" sx={{ fontWeight: 700, color: theme.palette.text.secondary }}>
                  {h}
                </Typography>
              ))}
            </Box>
            {[...widgetData].sort((a, b) => a.mes - b.mes).map((row: AccumulatedDelinquencyDto) => (
              <Box
                key={row.mes}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 2fr 2fr',
                  px: 2, py: 0.8,
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                  '&:last-child': { borderBottom: 'none' },
                  '&:hover': { bgcolor: alpha(colorMensal, 0.03) }
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                  {MONTHS[row.mes - 1]}
                </Typography>
                <Typography variant="caption" sx={{ color: colorMensal, fontWeight: 600 }}>
                  {formatCurrency(row.valorMensal)}
                </Typography>
                <Typography variant="caption" sx={{ color: colorAcumulado, fontWeight: 600 }}>
                  {formatCurrency(row.valorAcumulado)}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
