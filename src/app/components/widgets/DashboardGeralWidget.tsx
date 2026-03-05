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
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Dialog,
  DialogContent,
  DialogActions,
  Tooltip
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
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

function getDefaultStartMonth(): string {
  const now = new Date();
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
  filterDate?: Date | null;
  onFilterChange?: (date: Date) => void;
}

function GradientKPI({ title, mainValue, icon, gradientColors, children, filterDate, onFilterChange }: GradientKPIProps) {
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [tempDate, setTempDate] = useState<Date | null>(filterDate || new Date());

  const handleFilterClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setFilterAnchorEl(e.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleMonthSelect = (monthsBack: number) => {
    if (onFilterChange) {
      const newDate = subMonths(new Date(), monthsBack);
      onFilterChange(newDate);
    }
    handleFilterClose();
  };

  const handleCustomDateClick = () => {
    handleFilterClose();
    setTempDate(filterDate || new Date());
    setDatePickerOpen(true);
  };

  const handleDatePickerClose = () => {
    setDatePickerOpen(false);
  };

  const handleDatePickerConfirm = () => {
    if (onFilterChange && tempDate) {
      onFilterChange(tempDate);
    }
    setDatePickerOpen(false);
  };

  const getFilterLabel = () => {
    if (!filterDate) return 'Mês atual';
    const month = filterDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
    return month.charAt(0).toUpperCase() + month.slice(1);
  };

  return (
    <Card
      elevation={3}
      sx={{
        background: `linear-gradient(135deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)`,
        color: 'white',
        height: '100%',
        position: 'relative',
        overflow: 'hidden', // Dialog triggers clip if visible, so we use overflow:hidden but ensure menu/dialog are portals
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme: any) => theme.shadows[8],
        },
      }}
    >
      <CardContent sx={{ position: 'relative', zIndex: 1, p: { xs: 2.5, sm: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography
              sx={{
                opacity: 0.9,
                fontWeight: 700,
                fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.35rem' },
                letterSpacing: 0.3,
                mb: onFilterChange ? 1.5 : 0
              }}
            >
              {title}
            </Typography>

            {onFilterChange && (
              <Tooltip title="Alterar período" placement="top">
                <Box
                  onClick={handleFilterClick}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.75,
                    px: 2,
                    py: 0.7,
                    borderRadius: '12px',
                    background: alpha('#ffffff', 0.15),
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${alpha('#ffffff', 0.2)}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      background: alpha('#ffffff', 0.25),
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  <FuseSvgIcon size={18} sx={{ opacity: 0.9 }}>
                    heroicons-outline:calendar
                  </FuseSvgIcon>
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      opacity: 0.95,
                      letterSpacing: '0.02em',
                    }}
                  >
                    {getFilterLabel()}
                  </Typography>
                  <FuseSvgIcon size={16} sx={{ opacity: 0.7 }}>
                    heroicons-solid:chevron-down
                  </FuseSvgIcon>
                </Box>
              </Tooltip>
            )}
          </Box>
          <FuseSvgIcon size={32} sx={{ opacity: 0.3, mt: onFilterChange ? 0 : 0 }}>{icon}</FuseSvgIcon>
        </Box>

        <Menu
          anchorEl={filterAnchorEl}
          open={Boolean(filterAnchorEl)}
          onClose={handleFilterClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          slotProps={{
            paper: {
              sx: {
                mt: 1,
                minWidth: 220,
                borderRadius: 2,
                boxShadow: (theme: any) => theme.shadows[8],
              }
            }
          }}
        >
          <MenuItem onClick={() => handleMonthSelect(0)} selected={filterDate?.getMonth() === new Date().getMonth() && filterDate?.getFullYear() === new Date().getFullYear()}>
            <ListItemIcon>
              <FuseSvgIcon size={18}>heroicons-outline:calendar</FuseSvgIcon>
            </ListItemIcon>
            <ListItemText>Mês atual</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleMonthSelect(1)}>
            <ListItemIcon>
              <FuseSvgIcon size={18}>heroicons-outline:arrow-left</FuseSvgIcon>
            </ListItemIcon>
            <ListItemText>Mês passado</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleMonthSelect(2)}>
            <ListItemIcon>
              <FuseSvgIcon size={18}>heroicons-outline:arrow-left</FuseSvgIcon>
            </ListItemIcon>
            <ListItemText>Há 2 meses</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleMonthSelect(3)}>
            <ListItemIcon>
              <FuseSvgIcon size={18}>heroicons-outline:arrow-left</FuseSvgIcon>
            </ListItemIcon>
            <ListItemText>Há 3 meses</ListItemText>
          </MenuItem>
          <Divider sx={{ my: 0.5 }} />
          <MenuItem onClick={handleCustomDateClick}>
            <ListItemIcon>
              <FuseSvgIcon size={18}>heroicons-outline:adjustments-horizontal</FuseSvgIcon>
            </ListItemIcon>
            <ListItemText>Selecionar data...</ListItemText>
          </MenuItem>
        </Menu>

        <Dialog
          open={datePickerOpen}
          onClose={handleDatePickerClose}
          PaperProps={{
            sx: {
              borderRadius: 3,
              minWidth: 320,
            }
          }}
        >
          <DialogContent sx={{ pt: 3 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
              <DatePicker
                views={['year', 'month']}
                label="Selecione o mês e ano"
                value={tempDate}
                onChange={(newValue) => setTempDate(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    sx: { mb: 2 }
                  },
                  popper: {
                    sx: {
                      zIndex: 99999,
                    }
                  }
                }}
              />
            </LocalizationProvider>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleDatePickerClose} color="inherit">
              Cancelar
            </Button>
            <Button onClick={handleDatePickerConfirm} variant="contained" color="primary">
              Confirmar
            </Button>
          </DialogActions>
        </Dialog>

        <Typography
          sx={{
            fontWeight: 800,
            mb: 2,
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
            lineHeight: 1.1,
          }}
        >
          {mainValue}
        </Typography>

        {children && (
          <Box sx={{ mt: 1.5 }}>
            {children}
          </Box>
        )}
      </CardContent>

      {/* Decorative circles */}
      <Box
        sx={{
          position: 'absolute',
          right: -20,
          bottom: -20,
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: alpha('#ffffff', 0.1),
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          right: 35,
          bottom: 35,
          width: 70,
          height: 70,
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
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.4 }}>
      <Typography sx={{ opacity: 0.9, fontWeight: 600, fontSize: { xs: '1rem', sm: '1.1rem' } }}>
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 700, color: valueColor || 'inherit', fontSize: { xs: '1.05rem', sm: '1.15rem' } }}>
        {value}
      </Typography>
    </Box>
  );
}

function KPIDivider() {
  return <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.25)', my: 1 }} />;
}

// ─── Main Dashboard Widget ──────────────────────────────────────
export function DashboardGeralWidget() {
  const theme = useTheme();
  const isMobile = useThemeMediaQuery((t) => t.breakpoints.down('md'));

  // ── Global Chart Period selector state ──
  const [startMonth, setStartMonth] = useState(getDefaultStartMonth());
  const [endMonth, setEndMonth] = useState(getDefaultEndMonth());
  const [appliedStart, setAppliedStart] = useState(getDefaultStartMonth());
  const [appliedEnd, setAppliedEnd] = useState(getDefaultEndMonth());

  const handleApplyFilter = () => {
    setAppliedStart(startMonth);
    setAppliedEnd(endMonth);
  };

  // ── Cards individual filters state ──
  const defaultDate = new Date();
  const [card1Date, setCard1Date] = useState<Date>(defaultDate);
  const [card2Date, setCard2Date] = useState<Date>(defaultDate);
  const [card3Date, setCard3Date] = useState<Date>(defaultDate);
  const [card4Date, setCard4Date] = useState<Date>(defaultDate);

  // ── Compute API dates for chart ──
  const startDate = useMemo(() => {
    const d = monthInputToDate(appliedStart);
    return toApiDate(startOfMonth(d));
  }, [appliedStart]);

  const endDate = useMemo(() => {
    const d = monthInputToDate(appliedEnd);
    return toApiDate(endOfMonth(d));
  }, [appliedEnd]);

  // ── Data hooks ──
  // Card 1: Associados
  const { data: filiadosData, isLoading: l1 } = useTotalFiliados(toApiDate(startOfMonth(card1Date)));

  // Card 2: Faturamento do Mês
  const { data: faturamentoCard2Data, isLoading: l2 } = useTotalFaturamentoPorConvenio(toApiDate(startOfMonth(card2Date)));

  // Card 3: Títulos a Pagar
  const { data: faturamentoCard3Data, isLoading: l2_2 } = useTotalFaturamentoPorConvenio(toApiDate(startOfMonth(card3Date)));

  // Card 4: Inadimplência
  const { data: delinquencyCard4Data, isLoading: l3 } = useDelinquencySummary(
    toApiDate(startOfMonth(card4Date)),
    toApiDate(endOfMonth(card4Date))
  );

  // Chart
  const { data: resumoMensalData, isLoading: l4 } = useResumoMensalFinanceiroPorPeriodo(startDate, endDate);

  // Chart Results: also use delinquency but matching the chart period
  const { data: delinquencyChartData, isLoading: l3_chart } = useDelinquencySummary(startDate, endDate);

  const isLoading = l1 || l2 || l2_2 || l3 || l3_chart || l4;

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

  const faturamentoInfoCard2 = useMemo(() => {
    if (!faturamentoCard2Data?.geral) return null;
    const g = faturamentoCard2Data.geral;
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
  }, [faturamentoCard2Data]);

  const faturamentoInfoCard3 = useMemo(() => {
    if (!faturamentoCard3Data?.geral) return null;
    const g = faturamentoCard3Data.geral;
    return {
      totalGeral: g.totalGeral,
      totalPago: g.totalPago,
      aVencer: g.totalAberto,
      vencido: g.totalVencido,
    };
  }, [faturamentoCard3Data]);

  const delinquencyInfo = useMemo(() => {
    if (!delinquencyCard4Data) return null;
    return {
      totalInadimplente: delinquencyCard4Data.totalInadimplente,
      totalFaturado: delinquencyCard4Data.totalFaturado,
      percentualInadimplencia: delinquencyCard4Data.percentualInadimplencia,
    };
  }, [delinquencyCard4Data]);

  // ── Chart data ──
  const startMonthNum = useMemo(() => {
    const [, m] = appliedStart.split('-').map(Number);
    return m;
  }, [appliedStart]);

  const endMonthNum = useMemo(() => {
    const [, m] = appliedEnd.split('-').map(Number);
    return m;
  }, [appliedEnd]);

  const crossesYear = useMemo(() => {
    const [sy] = appliedStart.split('-').map(Number);
    const [ey] = appliedEnd.split('-').map(Number);
    return ey > sy;
  }, [appliedStart, appliedEnd]);

  const chartInfo = useMemo(() => {
    if (!resumoMensalData || resumoMensalData.length === 0) {
      return { categories: [] as string[], cobrancaData: [] as number[], pagamentoData: [] as number[], vencidoData: [] as number[] };
    }

    // Chronological sort: months before startMonth belong to the next year
    const sortedData = [...resumoMensalData].sort((a, b) => {
      const aKey = crossesYear && a.mes < startMonthNum ? a.mes + 12 : a.mes;
      const bKey = crossesYear && b.mes < startMonthNum ? b.mes + 12 : b.mes;
      return aKey - bKey;
    });

    // Parse years from the period for labels
    const [startYear] = appliedStart.split('-').map(Number);
    const [endYear] = appliedEnd.split('-').map(Number);

    return {
      categories: sortedData.map((item) => {
        const name = MONTH_NAMES[item.mes - 1] || `Mês ${item.mes}`;
        if (crossesYear) {
          const yr = item.mes >= startMonthNum ? startYear : endYear;
          return `${name}/${String(yr).slice(2)}`;
        }
        return name;
      }),
      cobrancaData: sortedData.map((item) => item.totalCobranca),
      pagamentoData: sortedData.map((item) => item.totalPagamento),
      vencidoData: sortedData.map((item) => item.totalVencido || 0)
    };
  }, [resumoMensalData, startMonthNum, crossesYear, appliedStart, appliedEnd]);

  const chartTotals = useMemo(() => {
    const totalCobranca = chartInfo.cobrancaData.reduce((s, v) => s + v, 0);
    const totalPagamento = chartInfo.pagamentoData.reduce((s, v) => s + v, 0);
    const totalVencido = chartInfo.vencidoData.reduce((s, v) => s + v, 0);
    const resultado = totalCobranca - totalPagamento; // Receitas - Despesas
    return { totalCobranca, totalPagamento, totalVencido, resultado };
  }, [chartInfo]);

  // ── Metallic chart colors ──
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
      '#7B9F3A',   // Faturamento — metallic olive green
      '#C29B2A',   // Pagamento — metallic gold
      '#9B2D2D',   // Vencido — metallic crimson
    ],
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.4,
        gradientToColors: [
          '#A8CC5C',   // lighter metallic green
          '#E6C44D',   // lighter metallic gold
          '#CC4444',   // lighter metallic red
        ],
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 0.85,
        stops: [0, 100]
      }
    },
    dataLabels: {
      enabled: !isMobile,
      formatter(val: number) {
        if (typeof val !== 'number') return '';
        if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
        if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
        return val.toLocaleString('pt-BR');
      },
      style: { fontSize: '11px', fontWeight: 700 },
      offsetY: -8,
    },
    stroke: { show: true, width: 1, colors: ['transparent'] },
    xaxis: {
      categories: chartInfo.categories,
      labels: {
        style: { colors: theme.palette.text.secondary, fontSize: isMobile ? '12px' : '14px', fontWeight: 600 }
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
        style: { colors: theme.palette.text.secondary, fontSize: isMobile ? '11px' : '13px', fontWeight: 500 }
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
      style: { fontSize: '14px' },
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
      fontSize: '14px',
      fontWeight: 600,
      itemMargin: { horizontal: 16, vertical: 6 }
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
          p: 2.5,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <FuseSvgIcon size={22} color="action">heroicons-outline:calendar-days</FuseSvgIcon>
        <Typography variant="subtitle1" fontWeight={700} color="text.secondary" sx={{ mr: 1, fontSize: '1.1rem' }}>
          Período do Gráfico:
        </Typography>
        <TextField
          type="month"
          label="Início"
          value={startMonth}
          onChange={(e) => setStartMonth(e.target.value)}
          size="small"
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 160 }}
        />
        <TextField
          type="month"
          label="Fim"
          value={endMonth}
          onChange={(e) => setEndMonth(e.target.value)}
          size="small"
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 160 }}
        />
        <Button
          variant="contained"
          size="medium"
          onClick={handleApplyFilter}
          startIcon={<FuseSvgIcon size={18}>heroicons-outline:funnel</FuseSvgIcon>}
          sx={{ borderRadius: 2, textTransform: 'none', px: 3, fontWeight: 700, fontSize: '1rem' }}
        >
          Filtrar
        </Button>
      </Card>

      {/* ── KPI CARDS — Row 1 ── */}
      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        {/* Card 1 — Associados Ativos */}
        <Grid item xs={12} sm={6} lg={3}>
          <GradientKPI
            title="Qtde Associados Ativo"
            mainValue={filiadosInfo?.totalAtivos?.toLocaleString('pt-BR') ?? '—'}
            icon="heroicons-outline:users"
            gradientColors={['#1565C0', '#0D47A1']}
            filterDate={card1Date}
            onFilterChange={setCard1Date}
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
            mainValue={formatCurrency(faturamentoInfoCard2?.totalGeral ?? 0)}
            icon="heroicons-outline:currency-dollar"
            gradientColors={['#2E7D32', '#1B5E20']}
            filterDate={card2Date}
            onFilterChange={setCard2Date}
          >
            <KPIMetric label="À Vencer" value={formatCurrency(faturamentoInfoCard2?.aVencer ?? 0)} valueColor="#bbf7d0" />
            <KPIMetric label="" value={formatPercent(faturamentoInfoCard2?.percentAVencer ?? 0)} />
            <KPIDivider />
            <KPIMetric label="Vencido" value={formatCurrency(faturamentoInfoCard2?.vencido ?? 0)} valueColor="#fca5a5" />
            <KPIMetric label="" value={formatPercent(faturamentoInfoCard2?.percentVencido ?? 0)} />
          </GradientKPI>
        </Grid>

        {/* Card 3 — Títulos a Pagar */}
        <Grid item xs={12} sm={6} lg={3}>
          <GradientKPI
            title="Títulos a Pagar"
            mainValue={formatCurrency(faturamentoInfoCard3?.totalGeral ?? 0)}
            icon="heroicons-outline:document-text"
            gradientColors={['#E65100', '#BF360C']}
            filterDate={card3Date}
            onFilterChange={setCard3Date}
          >
            <KPIMetric label="Em Aberto" value={formatCurrency(faturamentoInfoCard3?.aVencer ?? 0)} valueColor="#fed7aa" />
            <KPIMetric label="Liquidado" value={formatCurrency(faturamentoInfoCard3?.totalPago ?? 0)} valueColor="#4ade80" />
          </GradientKPI>
        </Grid>

        {/* Card 4 — Inadimplência */}
        <Grid item xs={12} sm={6} lg={3}>
          <GradientKPI
            title="Inadimplência Acumulada"
            mainValue={formatCurrency(delinquencyInfo?.totalInadimplente ?? 0)}
            icon="heroicons-outline:exclamation-triangle"
            gradientColors={['#B71C1C', '#880E4F']}
            filterDate={card4Date}
            onFilterChange={setCard4Date}
          >
            <KPIMetric
              label="Inadimplência (Gráfico)"
              value={formatCurrency(chartTotals.totalVencido)}
              valueColor="#fca5a5"
            />
          </GradientKPI>
        </Grid>
      </Grid>

      {/* ── RESULTADO DO GRÁFICO — Separate Card ── */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <GradientKPI
            title="Faturamento Período (Gráfico)"
            mainValue={formatCurrency(chartTotals.totalCobranca)}
            icon="heroicons-outline:arrow-trending-up"
            gradientColors={['#558B2F', '#33691E']}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <GradientKPI
            title="Pagamento Período (Gráfico)"
            mainValue={formatCurrency(chartTotals.totalPagamento)}
            icon="heroicons-outline:banknotes"
            gradientColors={['#F57F17', '#E65100']}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <GradientKPI
            title="Resultado Período (Gráfico)"
            mainValue={formatCurrency(chartTotals.resultado)}
            icon="heroicons-outline:scale"
            gradientColors={chartTotals.resultado >= 0 ? ['#1B5E20', '#004D40'] : ['#B71C1C', '#880E4F']}
          />
        </Grid>
      </Grid>

      {/* ── CHART ── */}
      <Card
        className="w-full rounded-2xl overflow-hidden"
        elevation={0}
        sx={{ border: `1px solid ${theme.palette.divider}` }}
      >
        <Box className="flex items-center justify-center px-6 py-4 border-b">
          <Typography sx={{ fontWeight: 700, fontSize: { xs: '1.1rem', sm: '1.3rem' }, color: 'text.primary' }}>
            Faturamento / Pagamento / Inadimplência — Período Selecionado
          </Typography>
        </Box>
        <Box sx={{ p: { xs: 1.5, md: 2.5 }, minHeight: { xs: 320, md: 420 } }}>
          <ReactApexChart
            options={chartOptions}
            series={series}
            type="bar"
            height={isMobile ? 320 : 420}
          />
        </Box>
      </Card>
    </Box>
  );
}
