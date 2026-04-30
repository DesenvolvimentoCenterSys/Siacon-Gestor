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
  useTotalFaturamentoPorConvenio,
  useDelinquencySummary,
  useResumoMensalFinanceiroPorPeriodo,
  useTotalDespesasPorConvenio,
} from "../../hooks/useDashboard";
import WidgetLoading from "../ui/WidgetLoading";
import { parse, format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { mt, ptBR } from "date-fns/locale";
import { string } from "zod";

const MONTH_NAMES = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
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

// ─── KPI-style Gradient Card ─────────────────────────────────────
interface GradientKPIProps {
  title: string;
  mainValue: string;
  icon: string;
  gradientColors: [string, string];
  children?: React.ReactNode;
  filterDate?: Date | null;
  onFilterChange?: (date: Date) => void;
  compactSpaces?: boolean;
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
}: GradientKPIProps) {
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(
    null,
  );
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [tempDate, setTempDate] = useState<Date | null>(
    filterDate || new Date(),
  );

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
    const month = filterDate.toLocaleDateString("pt-BR", {
      month: "short",
      year: "numeric",
    });
    return month.charAt(0).toUpperCase() + month.slice(1);
  };

  return (
    <Card
      elevation={3}
      sx={{
        background: `linear-gradient(135deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)`,
        color: "white",
        height: "100%",
        position: "relative",
        overflow: "hidden", // Dialog triggers clip if visible, so we use overflow:hidden but ensure menu/dialog are portals
        transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
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
          p: compactSpaces ? 1.3 : { xs: 2.3, sm: 2.5 },
          "&:last-child": {
            pb: compactSpaces ? 1.3 : { xs: 2.3, sm: 2.5 },
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
                fontSize: { xs: "1.8rem", sm: "1.25rem", md: "1.35rem" },
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
          <FuseSvgIcon
            size={32}
            sx={{ opacity: 0.3, mt: onFilterChange ? 0 : 0 }}
          >
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
            sx: {
              borderRadius: 3,
              minWidth: 320,
            },
          }}
        >
          <DialogContent sx={{ pt: 3 }}>
            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              adapterLocale={ptBR}
            >
              <DatePicker
                views={["year", "month"]}
                label="Selecione o mês e ano"
                value={tempDate}
                onChange={(newValue) => setTempDate(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    sx: { mb: 2 },
                  },
                  popper: {
                    sx: {
                      zIndex: 99999,
                    },
                  },
                }}
              />
            </LocalizationProvider>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleDatePickerClose} color="inherit">
              Cancelar
            </Button>
            <Button
              onClick={handleDatePickerConfirm}
              variant="contained"
              color="primary"
            >
              Confirmar
            </Button>
          </DialogActions>
        </Dialog>

        <Typography
          sx={{
            fontWeight: 800,
            mb: compactSpaces ? 0 : 2,
            fontSize: { xs: "2.2rem", sm: "2.0rem", md: "2.5rem" },
            lineHeight: 1.1,
          }}
        >
          {mainValue}
        </Typography>

        {children && (
          <Box sx={{ mt: compactSpaces ? 0.5 : 1.5 }}>{children}</Box>
        )}
      </CardContent>

      {/* Decorative circles */}
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

// ─── Metric line inside KPI card ─────────────────────────────────
function KPIMetric({
  label,
  value,
  valueColor,
  fontSize,
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
        py: 0.4,
      }}
    >
      <Typography
        sx={{
          opacity: 0.9,
          fontWeight: 600,
          fontSize: { xs: "1.35rem", sm: "1.25rem" },
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontWeight: 700,
          color: valueColor || "inherit",
          fontSize: { xs: "1.35rem", sm: "1.25rem" },
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

// ─── Main Dashboard Widget ──────────────────────────────────────
export function DashboardGeralWidget() {
  const theme = useTheme();
  const isMobile = useThemeMediaQuery((t) => t.breakpoints.down("md"));

  // ── Global Chart Period selector state ──
  const [startMonth, setStartMonth] = useState(getDefaultStartMonth());
  const [dateMonth, setDateMonth] = useState(getDefaultEndMonth());
  const [endMonth, setEndMonth] = useState(getDefaultEndMonth());
  const [appliedStart, setAppliedStart] = useState(getDefaultStartMonth());
  const [appliedEnd, setAppliedEnd] = useState(getDefaultEndMonth());
  const [searchBy, setSearchBy] = useState("C");

  const handleDateModeFilterChange = (event: SelectChangeEvent) => {
    setSearchBy(event.target.value as string);
  };

  const handleApplyFilter = () => {
    setAppliedStart(startMonth);
    setAppliedEnd(endMonth);
  };

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
  const { data: filiadosData, isLoading: l1 } = useTotalFiliados(dateMonth);

  // Card 2: Faturamento do Mês
  const { data: faturamentoCard2Data, isLoading: l2 } =
    useTotalFaturamentoPorConvenio(dateMonth, searchBy);

  // Card 3: Títulos a Pagar
  const { data: despesasCard3Data, isLoading: l2_2 } =
    useTotalDespesasPorConvenio(dateMonth);

  // Card 4: Inadimplência
  const { data: delinquencyCard4Data, isLoading: l3 } = useDelinquencySummary(
    toApiDate(startOfMonth(dateMonth)),
    toApiDate(endOfMonth(endDate)),
    searchBy,
  );

  // Chart
  const { data: resumoMensalData, isLoading: l4 } =
    useResumoMensalFinanceiroPorPeriodo(startDate, endDate);

  // Chart Results: also use delinquency but matching the chart period
  const { data: delinquencyChartData, isLoading: l3_chart } =
    useDelinquencySummary(startDate, endDate);

  const isLoading = l1 || l2 || l2_2 || l3 || l3_chart || l4;

  // ── Derived card data ──
  const filiadosInfo = useMemo(() => {
    if (!filiadosData) return null;
    return {
      totalAtivos: filiadosData.totalAtivos,
      totalDesligados: filiadosData.totalDesligados,
      totalNovos: filiadosData.totalNovos,
      totalAnterior:
        filiadosData.totalAtivos +
        filiadosData.totalDesligados -
        filiadosData.totalNovos,
      faturamentoPerdido: filiadosData.valorDesligados,
      totalAdesoes: filiadosData.valorNovos,
      faturamentoTotal: filiadosData.faturamentoTotal,
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
      percentVencido,
    };
  }, [faturamentoCard2Data]);

  const despesasInfoCard3 = useMemo(() => {
    if (!despesasCard3Data?.valorTotal) return null;
    return {
      totalGeral: despesasCard3Data.valorTotal,
      totalPago: despesasCard3Data.liquidado,
      aVencer: despesasCard3Data.emAberto,
      vencido: despesasCard3Data.valorVencido,
    };
  }, [despesasCard3Data]);

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
    const [, m] = appliedStart.split("-").map(Number);
    return m;
  }, [appliedStart]);

  const endMonthNum = useMemo(() => {
    const [, m] = appliedEnd.split("-").map(Number);
    return m;
  }, [appliedEnd]);

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
        vencidoData: [] as number[],
        resultadoData: [] as number[],
      };
    }

    // Chronological sort: months before startMonth belong to the next year
    const sortedData = [...resumoMensalData].sort((a, b) => {
      const aKey = crossesYear && a.mes < startMonthNum ? a.mes + 12 : a.mes;
      const bKey = crossesYear && b.mes < startMonthNum ? b.mes + 12 : b.mes;
      return aKey - bKey;
    });

    // Parse years from the period for labels
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
      resultadoData: sortedData.map((item) => item.resultado),
    };
  }, [resumoMensalData, startMonthNum, crossesYear, appliedStart, appliedEnd]);

  const chartTotals = useMemo(() => {
    const totalCobranca = chartInfo.cobrancaData.reduce((s, v) => s + v, 0);
    const totalPagamento = chartInfo.pagamentoData.reduce((s, v) => s + v, 0);
    const totalVencido = chartInfo.vencidoData.reduce((s, v) => s + v, 0);
    console.log(chartInfo.resultadoData);
    const resultado = chartInfo.resultadoData.reduce((s, v) => s + v, 0); // Receitas - Despesas
    return { totalCobranca, totalPagamento, totalVencido, resultado };
  }, [chartInfo]);

  // ── Metallic chart colors ──
  const chartOptions: ApexOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      fontFamily: "inherit",
      animations: { enabled: !isMobile },
    },
    plotOptions: {
      bar: {
        horizontal: isMobile,
        columnWidth: "65%",
        barHeight: "70%",
        borderRadius: 4,
        dataLabels: {
          position: "top",
        },
      },
    },
    colors: [
      "#23a329", // Faturamento —
      "#fa600d", // Pagamento —
      "#f7d71f", // Vencido —
      "#0D47A1", // Resultado
    ],
    fill: {
      type: "fill",
    },
    dataLabels: {
      enabled: true,
      formatter(val: number, opts: any) {
        if (typeof val !== "number") return "";
        const originalData =
          opts.seriesIndex === 1
            ? chartInfo.pagamentoData[opts.dataPointIndex]
            : opts.seriesIndex === 3
              ? chartInfo.resultadoData[opts.dataPointIndex]
              : val;

        const wasNegative =
          isMobile && typeof originalData === "number" && originalData < 0;
        const prefix = wasNegative ? "-" : "";

        if (val >= 1000000) return `${prefix}${(val / 1000000).toFixed(1)}M`;
        if (val >= 1000) return `${prefix}${(val / 1000).toFixed(0)}k`;
        return `${prefix}${val.toLocaleString("pt-BR")}`;
      },
      style: {
        fontSize: "10px",
        fontWeight: 700,
        colors: ["#181818"],
      },
      offsetY: isMobile ? 0 : -20,
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
              if (value >= 1000000)
                return `R$ ${(value / 1000000).toFixed(1)}M`;
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
      style: { fontSize: "14px" },
      y: {
        formatter(val) {
          return val.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          });
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
    { name: "Receitas", data: chartInfo.cobrancaData },
    {
      name: "Despesas",
      data: isMobile
        ? chartInfo.pagamentoData.map((v) => Math.abs(v))
        : chartInfo.pagamentoData,
    },
    { name: "Aberto", data: chartInfo.vencidoData },
    {
      name: "Resultado",
      data: isMobile
        ? chartInfo.resultadoData.map((v) => Math.abs(v))
        : chartInfo.resultadoData,
    },
  ];

  if (isLoading) return <WidgetLoading height={600} />;

  return (
    <Box sx={{ maxWidth: "100%" }}>
      {/* ── PERIOD SELECTOR ── */}
      <Card
        elevation={0}
        sx={{
          mb: 3,
          p: 2.5,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
        }}
      >
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
          <LocalizationProvider
            dateAdapter={AdapterDateFns}
            adapterLocale={ptBR}
          >
            <DatePicker
              views={["year", "month"]}
              label=""
              openTo="month"
              value={dateMonth ? parse(dateMonth, "yyyy-MM", new Date()) : null}
              onChange={(newValue) => {
                const mesFormatado = newValue
                  ? format(newValue, "yyyy-MM")
                  : "";
                setEndMonth(mesFormatado);
                setDateMonth(mesFormatado);
              }}
              slotProps={{
                textField: {
                  size: "small",
                  sx: {
                    minWidth: "12em",
                    maxWidth: { xs: "none", sm: "13em" },
                    width: { xs: "100%", sm: "13em" },
                    "& .MuiInputBase-root": {
                      cursor: "default",
                    },
                  },
                  InputLabelProps: { shrink: true },
                },
                popper: {
                  sx: {
                    zIndex: 99999,
                    "& .MuiPaper-root": {
                      width: 320,
                      maxHeight: 320,
                    },
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
            onClick={handleApplyFilter}
            startIcon={
              <FuseSvgIcon size={18}>heroicons-outline:funnel</FuseSvgIcon>
            }
            sx={{
              borderRadius: 2,
              width: { xs: "100%", sm: "auto" },
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
      {/* ── KPI CARDS — Row 1 ── */}
      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        {/* Card 1 — Associados Ativos */}
        <Grid item xs={12} sm={6} lg={3}>
          <GradientKPI
            title="Qtde Associados"
            mainValue={
              filiadosInfo?.totalAtivos?.toLocaleString("pt-BR") ?? "—"
            }
            icon="heroicons-outline:users"
            gradientColors={["#b700cf", "#7e0058"]}
          >
            <KPIMetric
              label="Qtde mês anterior"
              value={
                filiadosInfo?.totalAnterior?.toLocaleString("pt-BR") ?? "0"
              }
              valueColor="#ffffff"
            />
            <KPIMetric
              label="Novos no mês"
              value={filiadosInfo?.totalNovos?.toLocaleString("pt-BR") ?? "0"}
              valueColor="#4ade80"
            />
            <KPIMetric
              label="Desligados"
              value={
                filiadosInfo?.totalDesligados?.toLocaleString("pt-BR") ?? "0"
              }
              valueColor="#ffffff"
            />
            <KPIDivider />
            <KPIMetric
              label="Total Faturado"
              value={formatCurrency(filiadosInfo?.faturamentoTotal ?? 0)}
            />
            <KPIMetric
              label="Total Adesões"
              value={formatCurrency(filiadosInfo?.totalAdesoes ?? 0)}
            />
            <KPIMetric
              label="Total Perdido"
              value={formatCurrency(filiadosInfo?.faturamentoPerdido ?? 0)}
              valueColor="#ffffff"
            />
          </GradientKPI>
        </Grid>

        {/* Card 2 — Faturamento do Mês */}
        <Grid item xs={12} sm={6} lg={3}>
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
            <KPIMetric
              label=""
              value={formatPercent(faturamentoInfoCard2?.percentAVencer ?? 0)}
            />
            <KPIDivider />
            <KPIMetric
              label="Vencido"
              value={formatCurrency(faturamentoInfoCard2?.vencido ?? 0)}
              valueColor="#ffffff"
            />
            <KPIMetric
              label=""
              value={formatPercent(faturamentoInfoCard2?.percentVencido ?? 0)}
            />
          </GradientKPI>
        </Grid>

        {/* Card 3 — Títulos a Pagar */}
        <Grid item xs={12} sm={6} lg={3}>
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
            <KPIMetric
              label="Vencido"
              value={formatCurrency(despesasInfoCard3?.vencido ?? 0)}
              valueColor="#ffffff"
            />
            <KPIMetric
              label="Liquidado"
              value={formatCurrency(despesasInfoCard3?.totalPago ?? 0)}
              valueColor="#4ade80"
            />
          </GradientKPI>
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 0.5,
              height: "100%",
            }}
          >
            {/* Metade de Cima */}
            <Box sx={{ flex: 1 }}>
              <GradientKPI
                compactSpaces={true}
                title="Resultado do Mês"
                mainValue={formatCurrency(
                  faturamentoInfoCard2.totalPago - despesasInfoCard3.totalPago,
                )}
                icon="heroicons-outline:scale"
                gradientColors={["#1565C0", "#0D47A1"]}
              ></GradientKPI>
            </Box>

            {/* Metade de Baixo */}
            <Box sx={{ flex: 1 }}>
              <GradientKPI
                compactSpaces={true}
                title="Inadimplência"
                mainValue={formatCurrency(
                  delinquencyInfo?.totalInadimplente ?? 0,
                )}
                icon="heroicons-outline:exclamation-triangle"
                gradientColors={["#db2020", "#c7281d"]}
              >
                {/* <KPIMetric
                  label="Inadimplência (Gráfico)"
                  value={formatCurrency(chartTotals.totalVencido)}
                  valueColor="#ffffff"
                /> */}
              </GradientKPI>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* ── PERIOD SELECTOR ── */}
      <Card
        elevation={0}
        sx={{
          mb: 3,
          p: 2.5,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
        }}
      >
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

          <LocalizationProvider
            dateAdapter={AdapterDateFns}
            adapterLocale={ptBR}
          >
            <DatePicker
              views={["year", "month"]}
              label="Início"
              openTo="month"
              value={
                startMonth ? parse(startMonth, "yyyy-MM", new Date()) : null
              }
              onChange={(newValue) => {
                const mesFormatado = newValue
                  ? format(newValue, "yyyy-MM")
                  : "";
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
                    "& .MuiPaper-root": {
                      width: 320,
                      maxHeight: 320,
                    },
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
                const mesFormatado = newValue
                  ? format(newValue, "yyyy-MM")
                  : "";
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
                    "& .MuiPaper-root": {
                      width: 320,
                      maxHeight: 320,
                    },
                  },
                },
              }}
            />
          </LocalizationProvider>
          <Button
            variant="contained"
            size="medium"
            onClick={handleApplyFilter}
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

      {/* ── RESULTADO DO GRÁFICO — Separate Card ── */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <GradientKPI
            title="Faturamento Período (Gráfico)"
            mainValue={formatCurrency(chartTotals.totalCobranca)}
            icon="heroicons-outline:arrow-trending-up"
            gradientColors={["#23a329", "#229229"]}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <GradientKPI
            title="Pagamento Período (Gráfico)"
            mainValue={formatCurrency(chartTotals.totalPagamento)}
            icon="heroicons-outline:banknotes"
            gradientColors={["#F57F17", "#ee5b0c"]}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <GradientKPI
            title="Resultado Período (Gráfico)"
            mainValue={formatCurrency(chartTotals.resultado)}
            icon="heroicons-outline:scale"
            gradientColors={["#1565C0", "#0D47A1"]}
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
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: { xs: "1.1rem", sm: "1.3rem" },
              color: "text.primary",
            }}
          >
            Receitas / Despesas / Aberto / Resultado (Período Selecionado)
          </Typography>
        </Box>

        <Box sx={{ p: { xs: 1.5, md: 2.5 }, minHeight: { xs: 320, md: 420 } }}>
          <ReactApexChart
            key={isMobile ? "horizontal" : "vertical"}
            options={chartOptions}
            series={series}
            type="bar"
            height={isMobile ? 520 : 420}
          />
        </Box>
      </Card>
    </Box>
  );
}
