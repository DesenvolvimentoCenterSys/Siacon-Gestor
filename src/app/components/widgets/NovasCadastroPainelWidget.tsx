'use client';

import { useMemo, useState, useEffect } from 'react';
import { useTheme, alpha } from '@mui/material/styles';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import {
  Card, CardContent, Typography, Box, IconButton, Tooltip, Avatar, Chip
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useNovasVidas, useToggleFavoriteWidget, useUserFavoriteWidgets } from '../../hooks/useDashboard';
import WidgetLoading from '../ui/WidgetLoading';
import useUser from '@auth/useUser';
import { format, subMonths, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NovasCadastroPainelWidgetProps {
  initialIsFavorite?: boolean;
}

const WIDGET_ID = 12;
const COLOR_PF = '#1565C0'; // azul escuro (PF)
const COLOR_PJ = '#0D47A1'; // azul mais escuro (PJ)
const COLOR_TOTAL = '#1976D2'; // azul médio (total)

const MONTHS_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function buildMonthOptions() {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(now, i);
    return {
      label: `${MONTHS_LABELS[d.getMonth()]}/${d.getFullYear()}`,
      date: format(startOfMonth(d), 'yyyy-MM-dd')
    };
  });
}

export function NovasCadastroPainelWidget({ initialIsFavorite = false }: NovasCadastroPainelWidgetProps) {
  const theme = useTheme();
  const { data: user } = useUser();

  const monthOptions = useMemo(() => buildMonthOptions(), []);
  const [selectedMonth, setSelectedMonth] = useState(0); // index 0 = mês atual

  const { data: vidasData, isLoading } = useNovasVidas(monthOptions[selectedMonth].date);
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

  // Chart
  const chartOptions: ApexOptions = {
    chart: {
      type: 'donut',
      toolbar: { show: false },
      fontFamily: 'inherit',
      animations: { enabled: true, speed: 700 }
    },
    colors: [COLOR_PF, COLOR_PJ],
    labels: ['Pessoa Física', 'Pessoa Jurídica'],
    legend: {
      position: 'bottom',
      labels: { colors: theme.palette.text.secondary },
      fontSize: '13px'
    },
    plotOptions: {
      pie: {
        donut: {
          size: '68%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              fontSize: '13px',
              color: theme.palette.text.secondary,
              formatter: () => String(vidasData?.total ?? 0)
            },
            value: {
              fontSize: '24px',
              fontWeight: 800,
              color: COLOR_PF,
              formatter: (v) => v
            }
          }
        }
      }
    },
    dataLabels: { enabled: false },
    tooltip: { theme: theme.palette.mode },
    stroke: { width: 0 }
  };

  const chartSeries = [vidasData?.quantidadePF ?? 0, vidasData?.quantidadePJ ?? 0];

  const pctPF = (vidasData?.total ?? 0) > 0
    ? ((vidasData!.quantidadePF / vidasData!.total) * 100).toFixed(1)
    : '0';
  const pctPJ = (vidasData?.total ?? 0) > 0
    ? ((vidasData!.quantidadePJ / vidasData!.total) * 100).toFixed(1)
    : '0';

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
          ? `linear-gradient(145deg, ${alpha(COLOR_PF, 0.08)} 0%, ${theme.palette.background.paper} 40%)`
          : `linear-gradient(145deg, ${alpha(COLOR_PF, 0.04)} 0%, ${theme.palette.background.paper} 40%)`
      }}
    >
      {/* ─── Header ─── */}
      <Box
        sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: 3, py: 2.5,
          borderBottom: `1px solid ${theme.palette.divider}`,
          background: alpha(COLOR_PF, 0.04)
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: alpha(COLOR_PF, 0.14), width: 40, height: 40, color: COLOR_PF }}>
            <FuseSvgIcon size={22}>heroicons-outline:user-plus</FuseSvgIcon>
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              Novos Cadastros
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Entradas do período — Pessoa Física e Pessoa Jurídica
            </Typography>
          </Box>
        </Box>

        <Tooltip title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}>
          <IconButton onClick={handleToggleFavorite} size="small">
            <FuseSvgIcon sx={{ color: isFavorite ? '#FFD700' : 'action.active' }} size={20}>
              {isFavorite ? 'heroicons-solid:star' : 'heroicons-outline:star'}
            </FuseSvgIcon>
          </IconButton>
        </Tooltip>
      </Box>

      <CardContent sx={{ display: 'flex', flexDirection: 'column', p: 3, '&:last-child': { pb: 3 } }}>

        {/* ─── Month selector chips ─── */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
          {monthOptions.map((m, i) => (
            <Chip
              key={m.date}
              label={m.label}
              onClick={() => setSelectedMonth(i)}
              sx={{
                fontWeight: selectedMonth === i ? 700 : 500,
                bgcolor: selectedMonth === i ? COLOR_PF : alpha(COLOR_PF, 0.07),
                fontSize: '0.8rem',
                height: 32,
                cursor: 'pointer',
                transition: 'all 0.2s',
                '& .MuiChip-label': {
                  color: selectedMonth === i ? '#fff' : theme.palette.text.secondary,
                  px: 1.5
                },
                '&:hover': { bgcolor: selectedMonth === i ? COLOR_PF : alpha(COLOR_PF, 0.15) }
              }}
            />
          ))}
        </Box>

        {/* ─── KPI Cards ─── */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 3 }}>
          {[
            { label: 'Pessoa Física', value: vidasData?.quantidadePF ?? 0, icon: 'heroicons-outline:user', color: COLOR_PF, pct: pctPF },
            { label: 'Pessoa Jurídica', value: vidasData?.quantidadePJ ?? 0, icon: 'heroicons-outline:building-office', color: COLOR_PJ, pct: pctPJ },
            { label: 'Total Geral', value: vidasData?.total ?? 0, icon: 'heroicons-outline:users', color: COLOR_TOTAL, pct: null }
          ].map(c => (
            <Box key={c.label} sx={{ p: 2.5, borderRadius: 2, bgcolor: alpha(c.color, 0.07), border: `1px solid ${alpha(c.color, 0.2)}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <FuseSvgIcon size={18} sx={{ color: c.color }}>{c.icon}</FuseSvgIcon>
                <Typography sx={{ color: theme.palette.text.secondary, fontWeight: 700, fontSize: '1rem' }}>
                  {c.label}
                </Typography>
              </Box>
              <Typography sx={{ fontWeight: 800, color: c.color, fontSize: '2rem', lineHeight: 1.1 }}>
                {c.value.toLocaleString('pt-BR')}
              </Typography>
              {c.pct !== null && (
                <Typography variant="caption" sx={{ color: theme.palette.text.disabled, fontWeight: 500 }}>
                  {c.pct}% do total
                </Typography>
              )}
            </Box>
          ))}
        </Box>

        {/* ─── Donut chart ─── */}
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <ReactApexChart
            options={chartOptions}
            series={chartSeries}
            type="donut"
            height={300}
            width={380}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
