import { useMemo, useState } from "react";
import { useTheme, alpha } from "@mui/material/styles";
import {
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
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
  Tooltip,
  Checkbox,
} from "@mui/material";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import useThemeMediaQuery from "@fuse/hooks/useThemeMediaQuery";
import {
  useTotalFiliados,
  useTotalFaturamentoGeral,
  useDelinquencySummary,
  useResumoMensalFinanceiroPorPeriodo,
  useTotalDespesasPorConvenio,
} from "../../hooks/useDashboard";
import WidgetLoading from "../ui/WidgetLoading";
import { parse, format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ptBR } from "date-fns/locale";
import { PageHeader } from "../ui/PageHeader";

const SERIES_NAMES = ["Faturamento", "Receitas", "Despesas", "Inadimplência", "Resultado"] as const;
type SeriesName = typeof SERIES_NAMES[number];

const ALL_SERIES = new Set<SeriesName>(SERIES_NAMES);

const MONTH_NAMES = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

function getDefaultStartMonth(): string {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 6, 1);
  return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`;
}

function getDefaultEndMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function monthInputToDate(monthStr: string): Date {
  const [year, month] = monthStr.split("-").map(Number);
  return new Date(year, month - 1, 1);
}

function toApiDate(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

interface GradientKPIProps {
  title: string;
  mainValue: string;
  icon: string;
  gradientColors: [string, string];
  children?: React.ReactNode;
  filterDate?: Date | null;
  onFilterChange?: (date: Date) => void;
  compactSpaces?: boolean;
  dimmed?: boolean;
}

function GradientKPI({
  title,
  mainValue,
  icon,
  gradientColors,
  children,
  filterDate,
  onFilterChange,
  compactSpaces,
  dimmed,
}: GradientKPIProps) {
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
    if (!filterDate) return "Mês atual";
    const month = filterDate.toLocaleDateString("pt-BR", { month: "short", year: "numeric" });
    return month.charAt(0).toUpperCase() + month.slice(1);
  };

  return (
    <Card
      elevation={3}
      sx={{
        background: `linear-gradient(135deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)`,
        color: "white",
        height: "100%",
        width: "100%",
        position: "relative",
        overflow: "hidden",
        opacity: dimmed ? 0.45 : 1,
        transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out, opacity 0.3s ease-in-out",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: (theme: any) => theme.shadows[8],
        },
      }}
    >
      <CardContent
        sx={{
          position: "relative",
          zIndex: 1,
          p: compactSpaces ? 1.2 : { xs: 1.8, sm: 2.1, md: 2.3 },
          "&:last-child": {
            pb: compactSpaces ? 1.2 : { xs: 1.8, sm: 2.1, md: 2.3 },
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: compactSpaces ? 0.5 : 2,
          }}
        >
          <Box>
            <Typography
              sx={{
                opacity: 0.9,
                fontWeight: 700,
                fontSize: { xs: "1.15rem", sm: "1.25rem", md: "1.4rem" },
                letterSpacing: 0.3,
                mb: onFilterChange ? 1.5 : 0,
              }}
            >
              {title}
            </Typography>

            {onFilterChange && (
              <Tooltip title="Alterar período" placement="top">
                <Box
                  onClick={handleFilterClick}
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.75,
                    px: 2,
                    py: 0.7,
                    borderRadius: "12px",
                    background: alpha("#ffffff", 0.15),
                    backdropFilter: "blur(10px)",
                    border: `1px solid ${alpha("#ffffff", 0.2)}`,
                    cursor: "pointer",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      background: alpha("#ffffff", 0.25),
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  <FuseSvgIcon size={18} sx={{ opacity: 0.9 }}>
                    heroicons-outline:calendar
                  </FuseSvgIcon>
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      opacity: 0.95,
                      letterSpacing: "0.02em",
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
          <FuseSvgIcon size={32} sx={{ opacity: 0.3, mt: onFilterChange ? 0 : 0 }}>
            {icon}
          </FuseSvgIcon>
        </Box>

        <Menu
          anchorEl={filterAnchorEl}
          open={Boolean(filterAnchorEl)}
          onClose={handleFilterClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
          slotProps={{
            paper: {
              sx: {
                mt: 1,
                minWidth: 220,
                borderRadius: 2,
                boxShadow: (theme: any) => theme.shadows[8],
              },
            },
          }}
        >
          <MenuItem
            onClick={() => handleMonthSelect(0)}
            selected={
              filterDate?.getMonth() === new Date().getMonth() &&
              filterDate?.getFullYear() === new Date().getFullYear()
            }
          >
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
              <FuseSvgIcon size={18}>
                heroicons-outline:adjustments-horizontal
              </FuseSvgIcon>
            </ListItemIcon>
            <ListItemText>Selecionar data...</ListItemText>
          </MenuItem>
        </Menu>

        <Dialog
          open={datePickerOpen}
          onClose={handleDatePickerClose}
          PaperProps={{
            sx: { borderRadius: 3, minWidth: 320 },
          }}
        >
          <DialogContent sx={{ pt: 3 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
              <DatePicker
                views={["year", "month"]}
                label="Selecione o mês e ano"
                value={tempDate}
                onChange={(newValue) => setTempDate(newValue)}
                slotProps={{
                  textField: { fullWidth: true, sx: { mb: 2 } },
                  popper: { sx: { zIndex: 99999 } },
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
            mb: compactSpaces ? 0 : 2,
            fontSize: { xs: "2rem", sm: "2.3rem", md: "2.5rem" },
            lineHeight: 1.1,
            whiteSpace: "nowrap",
          }}
        >
          {mainValue}
        </Typography>

        {children && <Box sx={{ mt: compactSpaces ? 0.5 : 1.5 }}>{children}</Box>}
      </CardContent>

      <Box
        sx={{
          position: "absolute",
          right: -20,
          bottom: -20,
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: alpha("#ffffff", 0.1),
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          right: 35,
          bottom: 35,
          width: 70,
          height: 70,
          borderRadius: "50%",
          background: alpha("#ffffff", 0.06),
          zIndex: 0,
        }}
      />
    </Card>
  );
}

function KPIMetric({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
  fontSize?: string | object;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        py: 0.5,
      }}
    >
      <Typography sx={{ opacity: 0.9, fontWeight: 600, fontSize: { xs: "1.1rem", sm: "1.2rem", md: "1.3rem" } }}>
        {label}
      </Typography>
      <Typography
        sx={{
          fontWeight: 700,
          color: valueColor || "inherit",
          fontSize: { xs: "1.1rem", sm: "1.2rem", md: "1.3rem" },
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

function KPIDivider() {
  return <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.25)", my: 1 }} />;
}

export function DashboardGeralWidget() {
  const theme = useTheme();
  const isMobile = useThemeMediaQuery((t) => t.breakpoints.down("md"));

  const [startMonth, setStartMonth] = useState(getDefaultStartMonth());
  const [dateMonth, setDateMonth] = useState(getDefaultEndMonth());
  const [endMonth, setEndMonth] = useState(getDefaultEndMonth());
  const previousMonth = new Date();
  previousMonth.setMonth(previousMonth.getMonth() - 1);
  const [dateChosed, setYear] = useState(previousMonth);
  const [lastYearDate, setlastYearDate] = useState(
  previousMonth.getFullYear() - 1
);
  const [appliedDateMonth, setAppliedDateMonth] = useState(getDefaultEndMonth());
  const [appliedStart, setAppliedStart] = useState(getDefaultStartMonth());
  const [appliedEnd, setAppliedEnd] = useState(getDefaultEndMonth());
  const [searchBy, setSearchBy] = useState("V");
  const [appliedSearchBy, setAppliedSearchBy] = useState("V");
  const [visibleSeries, setVisibleSeries] = useState<Set<SeriesName>>(new Set(ALL_SERIES));

  const handleDateModeFilterChange = (event: SelectChangeEvent) => {
    setSearchBy(event.target.value as string);
  };

  const handleApplySummaryFilter = () => {
    setAppliedDateMonth(dateMonth);
    setAppliedSearchBy(searchBy);
    setVisibleSeries(new Set(ALL_SERIES));
  };

  const handleApplyChartFilter = () => {
    setAppliedStart(startMonth);
    setAppliedEnd(endMonth);
    setVisibleSeries(new Set(ALL_SERIES));
  };

  const startDate = useMemo(() => {
    const d = monthInputToDate(appliedStart);
    return toApiDate(startOfMonth(d));
  }, [appliedStart]);

  const endDate = useMemo(() => {
    const d = monthInputToDate(appliedEnd);
    return toApiDate(endOfMonth(d));
  }, [appliedEnd]);

  const { data: filiadosData, isLoading: l1 } = useTotalFiliados(appliedDateMonth, appliedSearchBy);
  const { data: faturamentoCard2Data, isLoading: l2 } = useTotalFaturamentoGeral(appliedDateMonth, appliedSearchBy);
  const { data: despesasCard3Data, isLoading: l2_2 } = useTotalDespesasPorConvenio(appliedDateMonth);

  const cardDateMonth = useMemo(() => monthInputToDate(appliedDateMonth), [appliedDateMonth]);

  const { data: delinquencyCard4Data, isLoading: l3 } = useDelinquencySummary(
    toApiDate(startOfMonth(cardDateMonth)),
    toApiDate(endOfMonth(cardDateMonth)),
    appliedSearchBy,
  );

  const { data: resumoMensalData, isLoading: l4 } = useResumoMensalFinanceiroPorPeriodo(
    startDate,
    endDate,
    appliedSearchBy,
  );

  const { data: delinquencyChartData, isLoading: l3_chart } = useDelinquencySummary(startDate, endDate);

  const isLoading = l1 || l2 || l2_2 || l3 || l3_chart || l4;

  const filiadosInfo = useMemo(() => {
    if (!filiadosData) return null;
    return {
      totalAtivos: filiadosData.totalAtivos,
      totalDesligados: filiadosData.totalDesligados,
      totalNovos: filiadosData.totalNovos,
      totalAnoAnterior: filiadosData.totalAnoAnterior,
      totalAnterior:filiadosData.totalAnterior ?? 0,
      faturamentoPerdido: filiadosData.valorDesligados,
      totalAdesoes: filiadosData.valorNovos,
      faturamentoTotal: filiadosData.faturamentoTotal,
      ticketMedio : filiadosData.totalAtivos > 0 ? (filiadosData.faturamentoTotal / filiadosData.totalAtivos) : 0
    };
  }, [filiadosData]);

  const faturamentoInfoCard2 = useMemo(() => {
    if (!faturamentoCard2Data) return null;
    const total = faturamentoCard2Data.totalGeral;
    const percentAVencer = total > 0 ? (faturamentoCard2Data.totalAberto / total) * 100 : 0;
    const percentVencido = total > 0 ? (faturamentoCard2Data.totalVencido / total) * 100 : 0;
    const percentPago = total > 0 ? (faturamentoCard2Data.totalPago / total) * 100 : 0;
    return {
      totalGeral: total,
      totalPago: faturamentoCard2Data.totalPago,
      aVencer: faturamentoCard2Data.totalAberto,
      vencido: faturamentoCard2Data.totalVencido,
      percentAVencer,
      percentVencido,
      percentPago,
    };
  }, [faturamentoCard2Data]);

  const despesasInfoCard3 = useMemo(() => {
    if (!despesasCard3Data?.valorTotal) return null;
    const total = despesasCard3Data.valorTotal;
    const percentPago = total > 0 ? (despesasCard3Data.liquidado / total) * 100 : 0;
    const percentAVencer = total > 0 ? (despesasCard3Data.emAberto / total) * 100 : 0;
    const percentVencido = total > 0 ? (despesasCard3Data.valorVencido / total) * 100 : 0;
    return {
      totalGeral: despesasCard3Data.valorTotal,
      totalPago: despesasCard3Data.liquidado,
      aVencer: despesasCard3Data.emAberto,
      vencido: despesasCard3Data.valorVencido,
      percentAVencer,
      percentPago,
      percentVencido,
    };
  }, [despesasCard3Data]);

  const delinquencyInfo = useMemo(() => {
    if (!delinquencyCard4Data) return null;
    const totalFaturado = faturamentoCard2Data?.totalGeral ?? 0;
    const percentDeliquency =
      totalFaturado > 0
        ? (delinquencyCard4Data.totalInadimplente / totalFaturado) * 100
        : 0;
    return {
      totalInadimplente: delinquencyCard4Data.totalInadimplente,
      totalFaturado: delinquencyCard4Data.totalFaturado,
      percentualInadimplencia: delinquencyCard4Data.percentualInadimplencia,
      percentDeliquency,
    };
  }, [delinquencyCard4Data, faturamentoCard2Data]);

  const startMonthNum = useMemo(() => {
    const [, m] = appliedStart.split("-").map(Number);
    return m;
  }, [appliedStart]);

  const crossesYear = useMemo(() => {
    const [sy] = appliedStart.split("-").map(Number);
    const [ey] = appliedEnd.split("-").map(Number);
    return ey > sy;
  }, [appliedStart, appliedEnd]);

  const chartInfo = useMemo(() => {
    if (!resumoMensalData || resumoMensalData.length === 0) {
      return {
        categories: [] as string[],
        cobrancaData: [] as number[],
        pagamentoData: [] as number[],
        faturamentoData: [] as number[],
        vencidoData: [] as number[],
        abertoData: [] as number[],
        resultadoData: [] as number[],
      };
    }

    const sortedData = [...resumoMensalData].sort((a, b) => {
      const aKey = crossesYear && a.mes < startMonthNum ? a.mes + 12 : a.mes;
      const bKey = crossesYear && b.mes < startMonthNum ? b.mes + 12 : b.mes;
      return aKey - bKey;
    });

    const [startYear] = appliedStart.split("-").map(Number);
    const [endYear] = appliedEnd.split("-").map(Number);

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
      vencidoData: sortedData.map((item) => item.totalVencido || 0),
      faturamentoData: sortedData.map((item) => item.totalFaturado || 0),
      abertoData: sortedData.map((item) => item.totalAberto || 0),
      resultadoData: sortedData.map((item) => item.resultado),
    };
  }, [resumoMensalData, startMonthNum, crossesYear, appliedStart, appliedEnd]);

  const sum = (arr: number[]) => arr.reduce((s, v) => s + v, 0);

  const chartTotals = useMemo(() => {
    return {
      totalFaturado: visibleSeries.has("Faturamento") ? sum(chartInfo.faturamentoData) : 0,
      totalCobranca: visibleSeries.has("Receitas") ? sum(chartInfo.cobrancaData) : 0,
      totalPagamento: visibleSeries.has("Despesas") ? sum(chartInfo.pagamentoData) : 0,
      resultado: visibleSeries.has("Resultado") ? sum(chartInfo.resultadoData) : 0,
    };
  }, [chartInfo, visibleSeries]);

  const chartKey = useMemo(() => {
    return `${isMobile}-${appliedStart}-${appliedEnd}-${appliedSearchBy}`;
  }, [isMobile, appliedStart, appliedEnd, appliedSearchBy]);

  const chartOptions: ApexOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      fontFamily: "inherit",
      animations: { enabled: !isMobile },
      events: {
        ...(isMobile
          ? {
              mounted(chartCtx: any) {
                chartCtx.hideSeries("Faturamento");
                chartCtx.hideSeries("Inadimplência");
              },
            }
          : {}),
        legendClick(_chartCtx: any, seriesIndex: number) {
          if (isMobile) return;
          const clickedName = SERIES_NAMES[seriesIndex];
          if (!clickedName) return;
          setVisibleSeries((prev) => {
            const next = new Set(prev);
            if (next.has(clickedName)) {
              next.delete(clickedName);
            } else {
              next.add(clickedName);
            }
            return next;
          });
        },
      },
    },
    plotOptions: {
      bar: {
        horizontal: isMobile,
        columnWidth: "65%",
        barHeight: "70%",
        borderRadius: 4,
        dataLabels: {
          position: isMobile ? "top" : "center",
        },
      },
    },
    colors: ["#23a329", "#e9a81b", "#fa600d", "#db2020", "#0D47A1"],
    fill: { type: "fill" },
    dataLabels: {
      enabled: isMobile,
      formatter(val: number, opts: any) {
        if (typeof val !== "number") return "";
        const originalData =
          opts.seriesIndex === 1
            ? chartInfo.pagamentoData[opts.dataPointIndex]
            : opts.seriesIndex === 3
              ? chartInfo.resultadoData[opts.dataPointIndex]
              : val;

        const wasNegative = isMobile && typeof originalData === "number" && originalData < 0;
        const prefix = wasNegative ? "-" : "";

        if (val >= 1000000) return `${prefix}${(val / 1000000).toFixed(1)}M`;
        if (val >= 1000) return `${prefix}${(val / 1000).toFixed(0)}k`;
        return `${prefix}${val.toLocaleString("pt-BR")}`;
      },
      style: {
        fontSize: "10px",
        fontWeight: 700,
        colors: isMobile ? ["#131313"] : ["rgb(255, 255, 255)"],
      },
      background: {
        enabled: isMobile,
        foreColor: "#e7e7e7",
        borderRadius: 4,
        padding: 4,
        opacity: 0.85,
        borderWidth: 0,
      },
      offsetY: 0,
      offsetX: isMobile ? 20 : 0,
    },
    stroke: { show: true, width: 1, colors: ["transparent"] },
    xaxis: {
      categories: chartInfo.categories,
      labels: {
        formatter: isMobile
          ? (value) => {
              if (value == null || typeof value !== "number") return "";
              if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
              if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
              return String(value);
            }
          : undefined,
        style: {
          colors: theme.palette.text.secondary,
          fontSize: isMobile ? "11px" : "14px",
          fontWeight: 600,
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        formatter: isMobile
          ? (value) => String(value)
          : (value) => {
              if (value == null || typeof value !== "number") return "";
              if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1)}M`;
              if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}k`;
              return `R$ ${value.toFixed(0)}`;
            },
        style: {
          colors: theme.palette.text.secondary,
          fontSize: isMobile ? "11px" : "13px",
          fontWeight: 500,
        },
      },
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 4,
      yaxis: { lines: { show: true } },
      xaxis: { lines: { show: false } },
      padding: { left: isMobile ? 5 : 15, right: isMobile ? 5 : 15 },
    },
    tooltip: {
      theme: theme.palette.mode,
      shared: true,
      intersect: false,
      style: { fontSize: "14px" },
      y: {
        formatter(val) {
          if (val == null || typeof val !== "number") return "—";
          return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
        },
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "center",
      fontSize: "14px",
      fontWeight: 600,
      itemMargin: { horizontal: 16, vertical: 6 },
    },
  };

  const series = [
    { name: "Faturamento", data: chartInfo.faturamentoData },
    { name: "Receitas", data: chartInfo.cobrancaData },
    {
      name: "Despesas",
      data: isMobile ? chartInfo.pagamentoData.map((v) => Math.abs(v)) : chartInfo.pagamentoData,
    },
    { name: "Inadimplência", data: chartInfo.vencidoData },
    {
      name: "Resultado",
      data: isMobile ? chartInfo.resultadoData.map((v) => Math.abs(v)) : chartInfo.resultadoData,
    },
  ];

  const qtdeAssociadosAnterior = `Qtde ${format(dateChosed, "MM/yyyy")} | ano ${lastYearDate}`
  const valorAnterior = `${(filiadosData?.totalAnterior ?? 0).toLocaleString("pt-BR")}|${(filiadosData?.totalAnoAnterior ?? 0).toLocaleString("pt-BR")}`;

  if (isLoading) return <WidgetLoading height={600} />;

  return (
    <>
      <Card
        elevation={0}
        sx={{
          mb: 3,
          p: 2.5,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
        }}
      >
        <PageHeader
          compact
          title=""
          subtitle={
            <>
              Resumo do Faturamento (Associados | Faturamento | Pagamentos | Inadimplência)
              <br />
              Obs: Valores Apurados de serviços
            </>
          }
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
              />
            </svg>
          }
        />
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            flexWrap: "wrap",
            alignItems: { xs: "center", sm: "center" },
            gap: { xs: 1.5, sm: 2 },
            width: "100%",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FuseSvgIcon size={22} color="action">
              heroicons-outline:calendar-days
            </FuseSvgIcon>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              color="text.secondary"
              sx={{ mr: "1", fontSize: "1.1rem" }}
            >
              Mês de Apuração:
            </Typography>
          </Box>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
            <DatePicker
              views={["year", "month"]}
              label=""
              openTo="month"
              value={dateMonth ? parse(dateMonth, "yyyy-MM", new Date()) : null}
              onChange={(newValue) => {
                const mesFormatado = newValue ? format(newValue, "yyyy-MM") : "";
                setEndMonth(mesFormatado);
                setDateMonth(mesFormatado);
                if (newValue) {
                  const lastMonth = newValue;
                  lastMonth.setMonth(lastMonth.getMonth() - 1);
                  setYear(lastMonth);
                  setlastYearDate(newValue.getFullYear() - 1);
                }
              }}
              slotProps={{
                textField: {
                  size: "small",
                  sx: {
                    minWidth: "12em",
                    maxWidth: { xs: "none", sm: "13em" },
                    width: { xs: "100%", sm: "13em" },
                    "& .MuiInputBase-root": { cursor: "default" },
                  },
                  InputLabelProps: { shrink: true },
                },
                popper: {
                  sx: {
                    zIndex: 99999,
                    "& .MuiPaper-root": { width: 320, maxHeight: 320 },
                  },
                },
              }}
            />
          </LocalizationProvider>
          <FormControl
            sx={{
              minWidth: "12em",
              maxWidth: { xs: "none", sm: "13em" },
              width: { xs: "100%", sm: "13em" },
            }}
          >
            <InputLabel id="menu-data-select">Pesquisar por:</InputLabel>
            <Select
              labelId="menu-data-select"
              id="menu-data"
              value={searchBy}
              label="Pesquisar por:"
              required
              onChange={handleDateModeFilterChange}
            >
              <MenuItem value="C">Competência</MenuItem>
              <MenuItem value="V">Vencimento</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            size="medium"
            onClick={handleApplySummaryFilter}
            startIcon={
              <FuseSvgIcon size={18}>heroicons-outline:funnel</FuseSvgIcon>
            }
            sx={{
              borderRadius: 2,
              width: { xs: "100%", sm: "13em" },
              textTransform: "none",
              px: 3,
              fontWeight: 700,
              fontSize: "1rem",
              backgroundColor: "#1E1E1E",
            }}
          >
            Filtrar
          </Button>
        </Box>
      </Card>

      <Grid container spacing={{ xs: 1.2, sm: 2, md: 2.5 }} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} xl={3}>
          <GradientKPI
            title="Qtde Associados"
            mainValue={filiadosInfo?.totalAtivos?.toLocaleString("pt-BR") ?? "—"}
            icon="heroicons-outline:users"
            gradientColors={["#b700cf", "#7e0058"]}
          >
            <KPIMetric
              label={qtdeAssociadosAnterior}
              value={valorAnterior}
              valueColor="#ffffff"
            /> 
            <KPIMetric
              label="Inclusões no mês"
              value={filiadosInfo?.totalNovos?.toLocaleString("pt-BR") ?? "0"}
              valueColor="#4ade80"
            />
            <KPIMetric
              label="Desligados no mês"
              value={filiadosInfo?.totalDesligados?.toLocaleString("pt-BR") ?? "0"}
              valueColor="#ffffff"
            />
            <KPIDivider />
            <KPIMetric label="Total Faturado" value={formatCurrency(filiadosInfo?.faturamentoTotal ?? 0)} />
            <KPIMetric label="Ticket Médio" value={formatCurrency(filiadosInfo?.ticketMedio)} />
            <KPIMetric label="Total Adesões" value={formatCurrency(filiadosInfo?.totalAdesoes ?? 0)} />
            <KPIMetric
              label="Total Perdido"
              value={formatCurrency(filiadosInfo?.faturamentoPerdido ?? 0)}
              valueColor="#ffffff"
            />
            <KPIDivider />
            <Typography
              sx={{
                fontSize: "1rem",
                fontStyle: "italic",
                fontWeight: 400,
                opacity: 0.75,
                textAlign: "center",
                mt: 1,
                lineHeight: 1.3,
              }}
            >
              * Valores referentes à mensalidade de contribuição.
            </Typography>
          </GradientKPI>
        </Grid>

        <Grid item xs={12} sm={6} xl={3}>
          <GradientKPI
            title="Faturamento do Mês"
            mainValue={formatCurrency(faturamentoInfoCard2?.totalGeral ?? 0)}
            icon="heroicons-outline:currency-dollar"
            gradientColors={["#23a329", "#229229"]}
          >
            <KPIMetric
              label="À Vencer"
              value={formatCurrency(faturamentoInfoCard2?.aVencer ?? 0)}
              valueColor="#bbf7d0"
            />
            <KPIMetric label="" value={formatPercent(faturamentoInfoCard2?.percentAVencer ?? 0)} />
            <KPIDivider />
            <KPIMetric
              label="Vencido"
              value={formatCurrency(faturamentoInfoCard2?.vencido ?? 0)}
              valueColor="#ffffff"
            />
            <KPIMetric label="" value={formatPercent(faturamentoInfoCard2?.percentVencido ?? 0)} />
            <KPIDivider />
          </GradientKPI>
        </Grid>

        <Grid item xs={12} sm={6} xl={3}>
          <GradientKPI
            title="Títulos a Pagar"
            mainValue={formatCurrency(despesasInfoCard3?.totalGeral ?? 0)}
            icon="heroicons-outline:document-text"
            gradientColors={["#fa600d", "#f04816"]}
          >
            <KPIMetric
              label="Em Aberto"
              value={formatCurrency(despesasInfoCard3?.aVencer ?? 0)}
              valueColor="#ffffff"
            />
            <KPIMetric label="" value={formatPercent(despesasInfoCard3?.percentAVencer ?? 0)} valueColor="#ffffff" />
            <KPIDivider />
            <KPIMetric
              label="Vencido"
              value={formatCurrency(despesasInfoCard3?.vencido ?? 0)}
              valueColor="#ffffff"
            />
            <KPIMetric label="" value={formatPercent(despesasInfoCard3?.percentVencido ?? 0)} valueColor="#ffffff" />
            <KPIDivider />
            <KPIMetric
              label="Liquidado"
              value={formatCurrency(despesasInfoCard3?.totalPago ?? 0)}
              valueColor="#4ade80"
            />
            <KPIMetric label="" value={formatPercent(despesasInfoCard3?.percentPago ?? 0)} valueColor="#4ade80" />
          </GradientKPI>
        </Grid>

        <Grid item xs={12} sm={6} xl={3}>
          <GradientKPI
            title="Inadimplência"
            mainValue={formatCurrency(delinquencyInfo?.totalInadimplente ?? 0)}
            icon="heroicons-outline:document-text"
            gradientColors={["#ca1c16", "#d42721"]}
          >
            <KPIMetric
              label="Total do Faturamento"
              value={formatPercent(faturamentoInfoCard2?.percentVencido ?? 0)}
              valueColor="#ffffff"
            />
            <KPIDivider />
            <br />
            <KPIDivider />
          </GradientKPI>
        </Grid>
      </Grid>

      <Card
        elevation={0}
        sx={{
          mb: 3,
          p: 2.5,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
        }}
      >
        <PageHeader
          compact
          title=""
          subtitle="Resultado Consolidado do Período (Faturamento | Receitas | Despesas | Inadimplência | Resultado)"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605"
              />
            </svg>
          }
        />
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            flexWrap: "wrap",
            alignItems: { xs: "center", sm: "center" },
            gap: { xs: 1.5, sm: 2 },
            width: "100%",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FuseSvgIcon size={22} color="action">
              heroicons-outline:calendar-days
            </FuseSvgIcon>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              color="text.secondary"
              sx={{ mr: "1", fontSize: "1.1rem" }}
            >
              Período Gráfico:
            </Typography>
          </Box>

          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
            <DatePicker
              views={["year", "month"]}
              label="Início"
              openTo="month"
              value={startMonth ? parse(startMonth, "yyyy-MM", new Date()) : null}
              onChange={(newValue) => {
                const mesFormatado = newValue ? format(newValue, "yyyy-MM") : "";
                setStartMonth(mesFormatado);
              }}
              slotProps={{
                textField: {
                  size: "small",
                  sx: {
                    minWidth: "12em",
                    maxWidth: { xs: "none", sm: "13em" },
                    width: { xs: "100%", sm: "13em" },
                  },
                  InputLabelProps: { shrink: true },
                },
                popper: {
                  sx: {
                    zIndex: 99999,
                    "& .MuiPaper-root": { width: 320, maxHeight: 320 },
                  },
                },
              }}
            />
            <DatePicker
              disabled={true}
              views={["year", "month"]}
              label="Fim"
              openTo="month"
              value={endMonth ? parse(endMonth, "yyyy-MM", new Date()) : null}
              onChange={(newValue) => {
                const mesFormatado = newValue ? format(newValue, "yyyy-MM") : "";
                setEndMonth(mesFormatado);
              }}
              slotProps={{
                textField: {
                  size: "small",
                  sx: {
                    minWidth: "12em",
                    maxWidth: { xs: "none", sm: "13em" },
                    width: { xs: "100%", sm: "13em" },
                  },
                  InputLabelProps: { shrink: true },
                },
                popper: {
                  sx: {
                    zIndex: 99999,
                    "& .MuiPaper-root": { width: 320, maxHeight: 320 },
                  },
                },
              }}
            />
          </LocalizationProvider>
          <Button
            variant="contained"
            size="medium"
            onClick={handleApplyChartFilter}
            startIcon={
              <FuseSvgIcon size={18}>heroicons-outline:funnel</FuseSvgIcon>
            }
            sx={{
              borderRadius: 2,
              width: { xs: "100%", sm: "13em" },
              textTransform: "none",
              px: 3,
              fontWeight: 700,
              fontSize: "1rem",
              backgroundColor: "#1E1E1E",
            }}
          >
            Filtrar
          </Button>
        </Box>
      </Card>

      <Grid container spacing={{ xs: 1.2, sm: 2, md: 2.5 }} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} xl={3}>
          <GradientKPI
            title="Faturamento Período (Gráfico)"
            mainValue={formatCurrency(chartTotals.totalFaturado)}
            icon="heroicons-outline:arrow-trending-up"
            gradientColors={["#23a329", "#229229"]}
            dimmed={!visibleSeries.has("Faturamento")}
          />
        </Grid>
        <Grid item xs={12} sm={6} xl={3}>
          <GradientKPI
            title="Receitas Período (Gráfico)"
            mainValue={formatCurrency(chartTotals.totalCobranca)}
            icon="heroicons-outline:arrow-trending-up"
            gradientColors={["#e9a81b", "#da9500"]}
            dimmed={!visibleSeries.has("Receitas")}
          />
        </Grid>
        <Grid item xs={12} sm={6} xl={3}>
          <GradientKPI
            title="Despesas Período (Gráfico)"
            mainValue={formatCurrency(chartTotals.totalPagamento)}
            icon="heroicons-outline:banknotes"
            gradientColors={["#F57F17", "#ee5b0c"]}
            dimmed={!visibleSeries.has("Despesas")}
          />
        </Grid>
        <Grid item xs={12} sm={6} xl={3}>
          <GradientKPI
            title="Resultado Período (Gráfico)"
            mainValue={formatCurrency(chartTotals.resultado)}
            icon="heroicons-outline:scale"
            gradientColors={["#1565C0", "#0D47A1"]}
            dimmed={!visibleSeries.has("Resultado")}
          />
        </Grid>
      </Grid>

      <Card
        className="w-full rounded-2xl overflow-hidden"
        elevation={0}
        sx={{ border: `1px solid ${theme.palette.divider}` }}
      >
        <Box className="flex items-center justify-center px-6 py-4 border-b">
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: { xs: "1.1rem", sm: "1.3rem" },
              color: "text.primary",
            }}
          >
            Faturamento / Receitas / Despesas / Inadimplência / Resultado (Período Selecionado)
          </Typography>
        </Box>

        <Box sx={{ p: { xs: 1.5, md: 2.5 }, minHeight: { xs: 320, md: 420 } }}>
          <ReactApexChart
            key={chartKey}
            options={chartOptions}
            series={series}
            type="bar"
            height={isMobile ? 520 : 420}
          />
        </Box>
      </Card>
    </>
  );
}