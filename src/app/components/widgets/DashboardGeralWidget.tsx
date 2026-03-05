'use client';

import { useMemo } from 'react';
import { useTheme, alpha } from '@mui/material/styles';
import { Card, Typography, Box, Grid, Divider } from '@mui/material';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import {
  useTotalFiliados,
  useTotalFaturamentoPorConvenio,
  useDelinquencySummary,
  useResumoMensalFinanceiro
} from '../../hooks/useDashboard';
import WidgetLoading from '../ui/WidgetLoading';

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatPercent(value: number): string {
  return `${value.toFixed(2)} %`;
}

// ─── Info Card (top row) ────────────────────────────────────────
interface InfoCardProps {
  title: string;
  icon: string;
  bgColor: string;
  borderColor: string;
  children: React.ReactNode;
}

function InfoCard({ title, icon, bgColor, borderColor, children }: InfoCardProps) {
  const theme = useTheme();
  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        border: `1px solid ${borderColor}`,
        borderTop: `4px solid ${borderColor}`,
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 1.5,
          backgroundColor: bgColor,
        }}
      >
        <FuseSvgIcon size={20} sx={{ color: borderColor }}>
          {icon}
        </FuseSvgIcon>
        <Typography
          variant="subtitle2"
          fontWeight={700}
          sx={{ color: borderColor, letterSpacing: 0.3 }}
        >
          {title}
        </Typography>
      </Box>
      <Box sx={{ px: 2, py: 1.5 }}>{children}</Box>
    </Card>
  );
}

// ─── Metric Row inside Card ──────────────────────────────────────
function MetricRow({
  label,
  value,
  color,
  bold = false,
  size = 'small'
}: {
  label: string;
  value: string;
  color?: string;
  bold?: boolean;
  size?: 'small' | 'large';
}) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.3 }}>
      <Typography
        variant={size === 'large' ? 'body2' : 'caption'}
        color="text.secondary"
        fontWeight={bold ? 600 : 400}
      >
        {label}
      </Typography>
      <Typography
        variant={size === 'large' ? 'subtitle1' : 'body2'}
        fontWeight={bold ? 700 : 600}
        sx={{ color: color || 'text.primary' }}
      >
        {value}
      </Typography>
    </Box>
  );
}

// ─── Main Widget ─────────────────────────────────────────────────
export function DashboardGeralWidget() {
  const theme = useTheme();
  const isMobile = useThemeMediaQuery((t) => t.breakpoints.down('md'));
  const currentYear = new Date().getFullYear();

  // Data hooks
  const { data: filiadosData, isLoading: isLoadingFiliados } = useTotalFiliados();
  const { data: faturamentoConvenioData, isLoading: isLoadingFatConv } = useTotalFaturamentoPorConvenio();
  const { data: delinquencyData, isLoading: isLoadingDelinq } = useDelinquencySummary();
  const { data: resumoMensalData, isLoading: isLoadingResumo } = useResumoMensalFinanceiro(currentYear);

  const isLoading = isLoadingFiliados || isLoadingFatConv || isLoadingDelinq || isLoadingResumo;

  // ── Faturamento / Filiados derived data ──
  const filiadosInfo = useMemo(() => {
    if (!filiadosData) return null;
    return {
      totalAtivos: filiadosData.totalAtivos,
      totalDesligados: filiadosData.totalDesligados,
      totalNovos: filiadosData.totalNovos,
      faturamentoTotal: filiadosData.faturamentoTotal
    };
  }, [filiadosData]);

  const faturamentoInfo = useMemo(() => {
    if (!faturamentoConvenioData?.geral) return null;
    const g = faturamentoConvenioData.geral;
    const aVencer = g.totalAberto;
    const vencido = g.totalVencido;
    const total = g.totalGeral;
    const percentAVencer = total > 0 ? (aVencer / total) * 100 : 0;
    const percentVencido = total > 0 ? (vencido / total) * 100 : 0;
    return {
      totalGeral: total,
      totalPago: g.totalPago,
      aVencer,
      vencido,
      percentAVencer,
      percentVencido
    };
  }, [faturamentoConvenioData]);

  const delinquencyInfo = useMemo(() => {
    if (!delinquencyData) return null;
    return {
      totalInadimplente: delinquencyData.totalInadimplente,
      totalFaturado: delinquencyData.totalFaturado,
      percentualInadimplencia: delinquencyData.percentualInadimplencia,
      totalAdimplente: delinquencyData.totalAdimplente,
      totalAReceber: delinquencyData.totalAReceber
    };
  }, [delinquencyData]);

  // ── Chart data from resumo mensal ──
  const chartInfo = useMemo(() => {
    if (!resumoMensalData || resumoMensalData.length === 0) {
      return { categories: [] as string[], cobrancaData: [], pagamentoData: [], vencidoData: [] };
    }

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const last7 = resumoMensalData
      .filter((item) => item.mes <= currentMonth)
      .sort((a, b) => a.mes - b.mes)
      .slice(-7);

    return {
      categories: last7.map((item) => MONTH_NAMES[item.mes - 1] || `Mês ${item.mes}`),
      cobrancaData: last7.map((item) => item.totalCobranca),
      pagamentoData: last7.map((item) => item.totalPagamento),
      vencidoData: last7.map((item) => item.totalVencido || 0)
    };
  }, [resumoMensalData]);

  // Totals from chart (accumulated period)
  const chartTotals = useMemo(() => {
    const totalCobranca = chartInfo.cobrancaData.reduce((s, v) => s + v, 0);
    const totalPagamento = chartInfo.pagamentoData.reduce((s, v) => s + v, 0);
    const totalVencido = chartInfo.vencidoData.reduce((s, v) => s + v, 0);
    const resultado = totalPagamento - totalCobranca;
    return { totalCobranca, totalPagamento, totalVencido, resultado };
  }, [chartInfo]);

  // ── Chart options ──
  const chartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      fontFamily: 'inherit',
      animations: { enabled: !isMobile },
    },
    plotOptions: {
      bar: {
        columnWidth: '70%',
        borderRadius: 3,
      }
    },
    colors: [
      theme.palette.success.main,   // Previsão Faturamento
      '#FF9800',                     // Pagamento
      theme.palette.error.main,      // Vencido / Inadimplência
    ],
    dataLabels: {
      enabled: !isMobile,
      formatter(val: number) {
        if (typeof val !== 'number') return '';
        if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
        return val.toLocaleString('pt-BR');
      },
      style: { fontSize: '10px', fontWeight: 600 },
      offsetY: -6,
    },
    stroke: {
      show: true,
      width: 1,
      colors: ['transparent']
    },
    xaxis: {
      categories: chartInfo.categories,
      labels: {
        style: {
          colors: theme.palette.text.secondary,
          fontSize: isMobile ? '10px' : '12px'
        }
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: {
        formatter: (value) => {
          if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1)}M`;
          if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}k`;
          return `R$ ${value.toFixed(0)}`;
        },
        style: {
          colors: theme.palette.text.secondary,
          fontSize: isMobile ? '10px' : '12px'
        }
      }
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 4,
      yaxis: { lines: { show: true } },
      xaxis: { lines: { show: false } },
      padding: { left: isMobile ? 5 : 15, right: isMobile ? 5 : 15 }
    },
    tooltip: {
      theme: theme.palette.mode,
      y: {
        formatter(val) {
          return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        }
      }
    },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'center',
      offsetY: 0,
      itemMargin: { horizontal: 12, vertical: 4 }
    }
  };

  const series = [
    { name: 'Previsão Faturamento', data: chartInfo.cobrancaData },
    { name: 'Pagamento', data: chartInfo.pagamentoData },
    { name: 'Vencido / Inadimplência', data: chartInfo.vencidoData }
  ];

  if (isLoading) return <WidgetLoading height={500} />;

  return (
    <Box>
      {/* ── TOP CARDS ROW ── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Card 1: Qtde Associados Ativos */}
        <Grid item xs={12} sm={6} lg={3}>
          <InfoCard
            title="Qtde Associados Ativo"
            icon="heroicons-outline:users"
            bgColor={alpha(theme.palette.primary.main, 0.06)}
            borderColor={theme.palette.primary.main}
          >
            <Typography variant="h4" fontWeight={800} color="primary.main" sx={{ mb: 1 }}>
              {filiadosInfo?.totalAtivos?.toLocaleString('pt-BR') ?? '—'}
            </Typography>
            <Divider sx={{ my: 1 }} />
            <MetricRow
              label="Novos no mês"
              value={filiadosInfo?.totalNovos?.toLocaleString('pt-BR') ?? '—'}
              color={theme.palette.success.main}
            />
            <MetricRow
              label="Desligados"
              value={filiadosInfo?.totalDesligados?.toLocaleString('pt-BR') ?? '—'}
              color={theme.palette.error.main}
            />
            <Divider sx={{ my: 1 }} />
            <MetricRow
              label="Total Faturado (Geral)"
              value={formatCurrency(filiadosInfo?.faturamentoTotal ?? 0)}
              bold
              size="large"
              color={theme.palette.success.dark}
            />
          </InfoCard>
        </Grid>

        {/* Card 2: Faturamento do Mês */}
        <Grid item xs={12} sm={6} lg={3}>
          <InfoCard
            title="Faturamento do Mês"
            icon="heroicons-outline:currency-dollar"
            bgColor={alpha('#1565C0', 0.06)}
            borderColor="#1565C0"
          >
            <Typography variant="h5" fontWeight={800} sx={{ color: '#1565C0', mb: 1 }}>
              {formatCurrency(faturamentoInfo?.totalGeral ?? 0)}
            </Typography>
            <Divider sx={{ my: 1 }} />
            <MetricRow
              label="À Vencer"
              value={formatCurrency(faturamentoInfo?.aVencer ?? 0)}
              color={theme.palette.info.main}
            />
            <MetricRow
              label=""
              value={formatPercent(faturamentoInfo?.percentAVencer ?? 0)}
              color={theme.palette.text.secondary}
            />
            <MetricRow
              label="Vencido"
              value={formatCurrency(faturamentoInfo?.vencido ?? 0)}
              color={theme.palette.error.main}
            />
            <MetricRow
              label=""
              value={formatPercent(faturamentoInfo?.percentVencido ?? 0)}
              color={theme.palette.text.secondary}
            />
          </InfoCard>
        </Grid>

        {/* Card 3: Títulos a Pagar */}
        <Grid item xs={12} sm={6} lg={3}>
          <InfoCard
            title="Títulos a Pagar"
            icon="heroicons-outline:document-text"
            bgColor={alpha('#FF9800', 0.06)}
            borderColor="#FF9800"
          >
            <Box>
              <MetricRow
                label="Em Aberto"
                value={formatCurrency(faturamentoInfo?.aVencer ?? 0)}
                color="#FF9800"
                size="large"
              />
              <MetricRow
                label="Liquidado (Pago)"
                value={formatCurrency(faturamentoInfo?.totalPago ?? 0)}
                color={theme.palette.success.main}
                size="large"
              />
              <Divider sx={{ my: 1 }} />
              <MetricRow
                label="Total"
                value={formatCurrency(faturamentoInfo?.totalGeral ?? 0)}
                bold
                size="large"
              />
            </Box>
          </InfoCard>
        </Grid>

        {/* Card 4: Inadimplência */}
        <Grid item xs={12} sm={6} lg={3}>
          <InfoCard
            title="Inadimplência Acumulada"
            icon="heroicons-outline:exclamation-triangle"
            bgColor={alpha(theme.palette.error.main, 0.06)}
            borderColor={theme.palette.error.main}
          >
            <Typography variant="h5" fontWeight={800} color="error.main" sx={{ mb: 1 }}>
              {formatCurrency(delinquencyInfo?.totalInadimplente ?? 0)}
            </Typography>
            <Divider sx={{ my: 1 }} />
            <MetricRow
              label="Inadimplência Período (Gráfico)"
              value={formatCurrency(chartTotals.totalVencido)}
              color={theme.palette.error.main}
              size="large"
            />
            <MetricRow
              label="Resultado Período (Gráfico)"
              value={formatCurrency(chartTotals.resultado)}
              color={chartTotals.resultado >= 0 ? theme.palette.success.main : theme.palette.error.main}
              size="large"
              bold
            />
          </InfoCard>
        </Grid>
      </Grid>

      {/* ── CHART ── */}
      <Card
        className="w-full shadow-sm rounded-2xl overflow-hidden"
        elevation={0}
        sx={{ border: `1px solid ${theme.palette.divider}` }}
      >
        <Box className="flex items-center justify-center px-6 py-3 border-b">
          <Typography variant="subtitle1" fontWeight={700} color="text.primary">
            Faturamento / Pagamento / Inadimplência dos últimos 7 meses
          </Typography>
        </Box>
        <Box sx={{ p: { xs: 1, md: 2 }, minHeight: { xs: 300, md: 400 } }}>
          <ReactApexChart
            options={chartOptions}
            series={series}
            type="bar"
            height={isMobile ? 300 : 400}
          />
        </Box>
      </Card>
    </Box>
  );
}
