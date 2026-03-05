'use client';

import { useMemo, useState } from 'react';
import { useTheme, alpha } from '@mui/material/styles';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
} from '@mui/material';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import {
  useTotalFiliados,
  useTotalFaturamentoPorConvenio,
  useDelinquencySummary,
  useResumoMensalFinanceiroPorPeriodo
} from '../../hooks/useDashboard';
import WidgetLoading from '../ui/WidgetLoading';
import { format, startOfMonth, endOfMonth } from 'date-fns';

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

function getDefaultStartMonth(): string {
  const now = new Date();
  // 6 months back
  const start = new Date(now.getFullYear(), now.getMonth() - 6, 1);
  return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`;
}

function getDefaultEndMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function monthInputToDate(monthStr: string): Date {
  const [year, month] = monthStr.split('-').map(Number);
  return new Date(year, month - 1, 1);
}

function toApiDate(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

// ─── KPI-style Gradient Card ─────────────────────────────────────
interface GradientKPIProps {
  title: string;
  mainValue: string;
  icon: string;
  gradientColors: [string, string];
  children?: React.ReactNode;
}

function GradientKPI({ title, mainValue, icon, gradientColors, children }: GradientKPIProps) {
  return (
    <Card
      elevation={3}
      sx={{
        background: `linear-gradient(135deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)`,
        color: 'white',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme: any) => theme.shadows[8],
        },
      }}
    >
      <CardContent sx={{ position: 'relative', zIndex: 1, p: { xs: 2, sm: 2.5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Typography
            variant="body2"
            sx={{
              opacity: 0.9,
              fontWeight: 700,
              fontSize: { xs: '0.85rem', sm: '0.95rem' },
              letterSpacing: 0.3,
            }}
          >
            {title}
          </Typography>
          <FuseSvgIcon size={24} sx={{ opacity: 0.3 }}>{icon}</FuseSvgIcon>
        </Box>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            mb: 1.5,
            fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
          }}
        >
          {mainValue}
        </Typography>

        {children && (
          <Box sx={{ mt: 1 }}>
            {children}
          </Box>
        )}
      </CardContent>

      {/* Decorative circle */}
      <Box
        sx={{
          position: 'absolute',
          right: -20,
          bottom: -20,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: alpha('#ffffff', 0.1),
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          right: 30,
          bottom: 30,
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: alpha('#ffffff', 0.06),
          zIndex: 0,
        }}
      />
    </Card>
  );
}

// ─── Metric line inside KPI card ─────────────────────────────────
function KPIMetric({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.25 }}>
      <Typography variant="caption" sx={{ opacity: 0.85, fontWeight: 500, fontSize: '0.8rem' }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 700, color: valueColor || 'inherit', fontSize: '0.85rem' }}>
        {value}
      </Typography>
    </Box>
  );
}

function KPIDivider() {
  return <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.2)', my: 0.75 }} />;
}

// ─── Main Dashboard Widget ──────────────────────────────────────
export function DashboardGeralWidget() {
  const theme = useTheme();
  const isMobile = useThemeMediaQuery((t) => t.breakpoints.down('md'));

  // ── Period selector state ──
  const [startMonth, setStartMonth] = useState(getDefaultStartMonth());
  const [endMonth, setEndMonth] = useState(getDefaultEndMonth());
  const [appliedStart, setAppliedStart] = useState(getDefaultStartMonth());
  const [appliedEnd, setAppliedEnd] = useState(getDefaultEndMonth());

  const handleApplyFilter = () => {
    setAppliedStart(startMonth);
    setAppliedEnd(endMonth);
  };

  // ── Compute API dates ──
  const startDate = useMemo(() => {
    const d = monthInputToDate(appliedStart);
    return toApiDate(startOfMonth(d));
  }, [appliedStart]);

  const endDate = useMemo(() => {
    const d = monthInputToDate(appliedEnd);
    return toApiDate(endOfMonth(d));
  }, [appliedEnd]);

  // Reference date for single-month endpoints (use end month)
  const referenceDate = useMemo(() => {
    const d = monthInputToDate(appliedEnd);
    return toApiDate(startOfMonth(d));
  }, [appliedEnd]);

  // ── Data hooks ──
  const { data: filiadosData, isLoading: l1 } = useTotalFiliados(referenceDate);
  const { data: faturamentoData, isLoading: l2 } = useTotalFaturamentoPorConvenio(referenceDate);
  const { data: delinquencyData, isLoading: l3 } = useDelinquencySummary(startDate, endDate);
  const { data: resumoMensalData, isLoading: l4 } = useResumoMensalFinanceiroPorPeriodo(startDate, endDate);

  const isLoading = l1 || l2 || l3 || l4;

  // ── Derived card data ──
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
    if (!faturamentoData?.geral) return null;
    const g = faturamentoData.geral;
    const total = g.totalGeral;
    const percentAVencer = total > 0 ? (g.totalAberto / total) * 100 : 0;
    const percentVencido = total > 0 ? (g.totalVencido / total) * 100 : 0;
    return {
      totalGeral: total,
      totalPago: g.totalPago,
      aVencer: g.totalAberto,
      vencido: g.totalVencido,
      percentAVencer,
      percentVencido
    };
  }, [faturamentoData]);

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

  // ── Chart data ──
  const chartInfo = useMemo(() => {
    if (!resumoMensalData || resumoMensalData.length === 0) {
      return { categories: [] as string[], cobrancaData: [] as number[], pagamentoData: [] as number[], vencidoData: [] as number[] };
    }

    const sortedData = [...resumoMensalData].sort((a, b) => a.mes - b.mes);

    return {
      categories: sortedData.map((item) => MONTH_NAMES[item.mes - 1] || `Mês ${item.mes}`),
      cobrancaData: sortedData.map((item) => item.totalCobranca),
      pagamentoData: sortedData.map((item) => item.totalPagamento),
      vencidoData: sortedData.map((item) => item.totalVencido || 0)
    };
  }, [resumoMensalData]);

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
        columnWidth: '65%',
        borderRadius: 4,
      }
    },
    colors: [
      '#2E7D32',   // Previsão Faturamento (green)
      '#FF9800',   // Pagamento (amber)
      '#C62828',   // Vencido (red)
    ],
    dataLabels: {
      enabled: !isMobile,
      formatter(val: number) {
        if (typeof val !== 'number') return '';
        if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
        if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
        return val.toLocaleString('pt-BR');
      },
      style: { fontSize: '9px', fontWeight: 600 },
      offsetY: -6,
    },
    stroke: { show: true, width: 1, colors: ['transparent'] },
    xaxis: {
      categories: chartInfo.categories,
      labels: {
        style: { colors: theme.palette.text.secondary, fontSize: isMobile ? '10px' : '12px' }
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
        style: { colors: theme.palette.text.secondary, fontSize: isMobile ? '10px' : '12px' }
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
      itemMargin: { horizontal: 12, vertical: 4 }
    }
  };

  const series = [
    { name: 'Previsão Faturamento', data: chartInfo.cobrancaData },
    { name: 'Pagamento', data: chartInfo.pagamentoData },
    { name: 'Vencido / Inadimplência', data: chartInfo.vencidoData }
  ];

  if (isLoading) return <WidgetLoading height={600} />;

  return (
    <Box>
      {/* ── PERIOD SELECTOR ── */}
      <Card
        elevation={0}
        sx={{
          mb: 3,
          p: 2,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <FuseSvgIcon size={20} color="action">heroicons-outline:calendar-days</FuseSvgIcon>
        <Typography variant="subtitle2" fontWeight={600} color="text.secondary" sx={{ mr: 1 }}>
          Período:
        </Typography>
        <TextField
          type="month"
          label="Início"
          value={startMonth}
          onChange={(e) => setStartMonth(e.target.value)}
          size="small"
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 150 }}
        />
        <TextField
          type="month"
          label="Fim"
          value={endMonth}
          onChange={(e) => setEndMonth(e.target.value)}
          size="small"
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 150 }}
        />
        <Button
          variant="contained"
          size="small"
          onClick={handleApplyFilter}
          startIcon={<FuseSvgIcon size={16}>heroicons-outline:funnel</FuseSvgIcon>}
          sx={{ borderRadius: 2, textTransform: 'none', px: 3, fontWeight: 600 }}
        >
          Filtrar
        </Button>
      </Card>

      {/* ── KPI CARDS ── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Card 1 — Associados Ativos */}
        <Grid item xs={12} sm={6} lg={3}>
          <GradientKPI
            title="Qtde Associados Ativo"
            mainValue={filiadosInfo?.totalAtivos?.toLocaleString('pt-BR') ?? '—'}
            icon="heroicons-outline:users"
            gradientColors={['#1565C0', '#0D47A1']}
          >
            <KPIMetric label="Novos no mês" value={filiadosInfo?.totalNovos?.toLocaleString('pt-BR') ?? '0'} valueColor="#4ade80" />
            <KPIMetric label="Desligados" value={filiadosInfo?.totalDesligados?.toLocaleString('pt-BR') ?? '0'} valueColor="#fca5a5" />
            <KPIDivider />
            <KPIMetric label="Total Faturado" value={formatCurrency(filiadosInfo?.faturamentoTotal ?? 0)} />
          </GradientKPI>
        </Grid>

        {/* Card 2 — Faturamento do Mês */}
        <Grid item xs={12} sm={6} lg={3}>
          <GradientKPI
            title="Faturamento do Mês"
            mainValue={formatCurrency(faturamentoInfo?.totalGeral ?? 0)}
            icon="heroicons-outline:currency-dollar"
            gradientColors={['#2E7D32', '#1B5E20']}
          >
            <KPIMetric
              label="À Vencer"
              value={`${formatCurrency(faturamentoInfo?.aVencer ?? 0)}`}
              valueColor="#bbf7d0"
            />
            <KPIMetric label="" value={formatPercent(faturamentoInfo?.percentAVencer ?? 0)} />
            <KPIDivider />
            <KPIMetric
              label="Vencido"
              value={formatCurrency(faturamentoInfo?.vencido ?? 0)}
              valueColor="#fca5a5"
            />
            <KPIMetric label="" value={formatPercent(faturamentoInfo?.percentVencido ?? 0)} />
          </GradientKPI>
        </Grid>

        {/* Card 3 — Títulos a Pagar */}
        <Grid item xs={12} sm={6} lg={3}>
          <GradientKPI
            title="Títulos a Pagar"
            mainValue={formatCurrency(faturamentoInfo?.totalGeral ?? 0)}
            icon="heroicons-outline:document-text"
            gradientColors={['#E65100', '#BF360C']}
          >
            <KPIMetric
              label="Em Aberto"
              value={formatCurrency(faturamentoInfo?.aVencer ?? 0)}
              valueColor="#fed7aa"
            />
            <KPIMetric
              label="Liquidado"
              value={formatCurrency(faturamentoInfo?.totalPago ?? 0)}
              valueColor="#4ade80"
            />
          </GradientKPI>
        </Grid>

        {/* Card 4 — Inadimplência */}
        <Grid item xs={12} sm={6} lg={3}>
          <GradientKPI
            title="Inadimplência Acumulada"
            mainValue={formatCurrency(delinquencyInfo?.totalInadimplente ?? 0)}
            icon="heroicons-outline:exclamation-triangle"
            gradientColors={['#B71C1C', '#880E4F']}
          >
            <KPIMetric
              label="Inadimplência Período"
              value={formatCurrency(chartTotals.totalVencido)}
              valueColor="#fca5a5"
            />
            <KPIDivider />
            <KPIMetric
              label="Resultado Período"
              value={formatCurrency(chartTotals.resultado)}
              valueColor={chartTotals.resultado >= 0 ? '#4ade80' : '#fca5a5'}
            />
          </GradientKPI>
        </Grid>
      </Grid>

      {/* ── CHART ── */}
      <Card
        className="w-full rounded-2xl overflow-hidden"
        elevation={0}
        sx={{ border: `1px solid ${theme.palette.divider}` }}
      >
        <Box className="flex items-center justify-center px-6 py-3 border-b">
          <Typography variant="subtitle1" fontWeight={700} color="text.primary">
            Faturamento / Pagamento / Inadimplência — Período Selecionado
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
