"use client";

import { useMemo, useState, useEffect } from "react";
import { useSessionUrlFilter } from "@auth/useSessionUrlFilter";
import { useTheme, alpha } from "@mui/material/styles";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ListItemText,
  Button,
  OutlinedInput,
  Checkbox,
  Chip,
  Tabs,
  Tab,
  SelectChangeEvent,
} from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import useUser from "@auth/useUser";
import { format, addDays, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ptBR } from "date-fns/locale";
import useThemeMediaQuery from "@fuse/hooks/useThemeMediaQuery";
import WidgetLoading from "../ui/WidgetLoading";
import { FinancialEvolutionDto } from "@/types/dashboardTypes";
import {
  useFinancialEvolution,
  useGrupoBanco,
  useGetSaldoAtual,
} from "../../hooks/useDashboard";
import {
  useChartDataAggregation,
  SeriesData,
} from "../../hooks/useChartDataAggregation";

interface FinancialEvolutionWidgetProps {
  initialIsFavorite?: boolean;
}

const WIDGET_ID = 18;

export function FinancialEvolutionWidget({
  initialIsFavorite = false,
}: FinancialEvolutionWidgetProps) {
  const initialStartDate = startOfMonth(subMonths(new Date(), 5));
  const initialEndDate = endOfMonth(new Date());
  const theme = useTheme();
  const { data: user } = useUser();
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down("md"));

  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [viewMode, setViewMode] = useState("monthly");
  const MOBILE_PAGE_SIZE = viewMode === "monthly" ? 12 : 10;
  const [mobilePage, setMobilePage] = useState(0);

  const [tempViewMode, setTempViewMode] = useState<"daily" | "monthly">("monthly");
  const [tempStartDate, setTempStartDate] = useState<Date>(initialStartDate);
  const [tempEndDate, setTempEndDate] = useState<Date>(initialEndDate);

  const { data: gruposBancos, isLoading: isLoadingGrupos } = useGrupoBanco();

  const [selectedGrupos, setSelectedGrupos] = useState<number[]>([]);
  const [tempSelectedGrupos, setTempSelectedGrupos] = useState<number[]>([]);
  
  const [rawSelectedBanks, setSelectedBanks] = useSessionUrlFilter<string[]>(
    "bancos_selectedBanks",
    [],
  );


  const selectedBanks = useMemo(() => {
    if (!rawSelectedBanks) return [];
    const raw = rawSelectedBanks as unknown as string | string[];
    
    const arr = Array.isArray(raw)
      ? raw
      : typeof raw === "string"
      ? raw.split(",")
      : [];
      
    return arr.filter((b) => typeof b === "string" && b.trim() !== "");
  }, [rawSelectedBanks]);

  const [pendingBanks, setPendingBanks] = useState<string[]>([]);
  const [banksDirty, setBanksDirty] = useState(false);

  useEffect(() => {
    setPendingBanks(selectedBanks);
  }, [selectedBanks]);

  const [activeSeries, setActiveSeries] = useSessionUrlFilter<string>(
    "bancos_activeSeries",
    "receber",
  );

  const [tabIndex, setTabIndex] = useSessionUrlFilter<number>(
    "bancos_tabIndex",
    0,
    String,
    Number,
  );

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const handleGrupoBancoChange = (
    event: SelectChangeEvent<typeof selectedGrupos>,
  ) => {
    const { target: { value } } = event;
    setTempSelectedGrupos(
      typeof value === "string"
        ? value.split(",").map(Number)
        : (value as number[]),
    );
  };

  const apiStartDate = useMemo(() => format(startDate, "yyyy-MM-dd"), [startDate]);

  const apiEndDate = useMemo(() => {
    if (viewMode === "monthly") {
      return format(endOfMonth(endDate), "yyyy-MM-dd");
    }
    return format(endDate, "yyyy-MM-dd");
  }, [endDate, viewMode]);

  const { data: widgetData, isLoading } = useFinancialEvolution(
    apiStartDate,
    apiEndDate,
    selectedGrupos,
  );

  // CORREÇÃO 3: Persistir o mapa de IDs em State para não perder os IDs durante um loading da API
  const [bankMap, setBankMap] = useState<Map<string, number>>(new Map());
  useEffect(() => {
    if (widgetData?.data) {
      setBankMap((prev) => {
        const newMap = new Map(prev);
        widgetData.data.forEach((d: FinancialEvolutionDto) => {
          // Fallback seguro caso o back-end mande bancoId em vez de codigoBanco
          const idToUse = (d as any).bancoId ?? d.codigoBanco;
          if (idToUse !== undefined) newMap.set(d.nomeBanco, idToUse);
        });
        return newMap;
      });
    }
  }, [widgetData?.data]);

  const selectedBankIds = useMemo(() => {
    if (selectedBanks.length === 0) return [];
    return selectedBanks
      .map((name) => bankMap.get(name))
      .filter((id): id is number => id !== undefined);
  }, [selectedBanks, bankMap]);

  const saldoFinal = useGetSaldoAtual(
    apiEndDate,
    selectedGrupos.length > 0 ? selectedGrupos : undefined,
    selectedBankIds.length > 0 ? selectedBankIds : undefined,
  );

  const colorReceber = "rgb(21, 101, 192)";
  const colorPagar = "rgb(250, 96, 13)";
  const colorSaldo = "rgb(35, 163, 41)";

  const banks = useMemo(() => {
    if (!widgetData?.data) return [];
    return Array.from(
      new Set(widgetData.data.map((d: FinancialEvolutionDto) => d.nomeBanco)),
    );
  }, [widgetData]);

  const bancoPrincipal = widgetData?.bancoPrincipal ?? "";

  const filteredData = useMemo(() => {
    if (!widgetData) return [];
    const data = widgetData.data ?? [];
    if (selectedBanks.length === 0) return data;
    return data.filter((d: FinancialEvolutionDto) =>
      selectedBanks.includes(d.nomeBanco),
    );
  }, [widgetData, selectedBanks]);

  const rawData = useMemo(() => {
    if (!filteredData || filteredData.length === 0)
      return {
        dates: [],
        series: [],
        totals: { receber: 0, pagar: 0, saldoAcumulado: 0 },
      };

    const groupedByDate = filteredData.reduce(
      (acc: Record<string, FinancialEvolutionDto>, curr: FinancialEvolutionDto) => {
        const dateKey =
          viewMode === "monthly"
            ? curr.data.split("T")[0].substring(0, 7)
            : curr.data.split("T")[0];

        if (!acc[dateKey]) {
          acc[dateKey] = {
            ...curr,
            data: dateKey,
            totalReceber: 0,
            totalPagar: 0,
            saldoDoDia: 0,
            saldoAcumulado: 0,
          };
        }
        acc[dateKey].totalReceber += curr.totalReceber;
        acc[dateKey].totalPagar += curr.totalPagar;
        acc[dateKey].saldoAcumulado += curr.saldoAcumulado;
        return acc;
      },
      {},
    );

    const sortedData = Object.values(groupedByDate).sort((a, b) =>
      a.data.localeCompare(b.data),
    );

    const dates = sortedData.map((d) => d.data.split("T")[0]);

    const seriesList: SeriesData[] = [
      {
        name: "Receitas",
        data: sortedData.map((d) => Math.abs(d.totalReceber)),
        type: "column",
        aggregation: "sum",
      },
      {
        name: "Despesas",
        data: sortedData.map((d) => Math.abs(d.totalPagar)),
        type: "column",
        aggregation: "sum",
      },
      {
        name: "Lucro/Prejuízo do Período",
        data: sortedData.map((d) => d.totalReceber - d.totalPagar),
        type: "column",
        aggregation: "sum",
      },
    ];

    const totals = sortedData.reduce(
      (acc, d) => ({
        receber: acc.receber + Math.abs(d.totalReceber),
        pagar: acc.pagar + Math.abs(d.totalPagar),
        saldoAcumulado:
          sortedData.length > 0
            ? sortedData[sortedData.length - 1].saldoAcumulado
            : 0,
      }),
      { receber: 0, pagar: 0, saldoAcumulado: 0 },
    );

    return { dates, series: seriesList, totals };
  }, [filteredData, viewMode]);

  const aggregatedData = useChartDataAggregation({
    dates: rawData.dates,
    series: rawData.series,
    isMobile,
    maxPoints: 999,
  });

  const finalSeries = useMemo(() => {
    if (!isMobile) return aggregatedData.series;

    switch (activeSeries) {
      case "receber":
        return aggregatedData.series
          .filter((s) => s.name === "Receitas")
          .map((s) => ({ ...s, type: "bar", color: colorReceber }));
      case "pagar":
        return aggregatedData.series
          .filter((s) => s.name === "Despesas")
          .map((s) => ({ ...s, type: "bar", color: colorPagar }));
      case "saldo":
        const saldoSeries = aggregatedData.series.find(
          (s) => s.name === "Lucro/Prejuízo do Período",
        );
        if (!saldoSeries) return aggregatedData.series;
        return [
          {
            ...saldoSeries,
            type: "bar",
            color: colorSaldo,
            originalData: saldoSeries.data,
            data: saldoSeries.data.map((v) => Math.abs(v as number)),
          },
        ];
      default:
        return aggregatedData.series;
    }
  }, [aggregatedData.series, isMobile, activeSeries, colorReceber, colorPagar, colorSaldo]);

  const mobileSeriesColor = useMemo(() => {
    if (activeSeries === "receber") return colorReceber;
    if (activeSeries === "pagar") return colorPagar;
    return colorSaldo;
  }, [activeSeries, colorReceber, colorPagar, colorSaldo]);

  const chartOptionsDesktop: ApexOptions = {
    chart: {
      type: "bar",
      stacked: false,
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: "inherit",
      animations: { enabled: true },
    },
    colors: [colorReceber, colorPagar, colorSaldo],
    stroke: { show: true, width: 1, colors: ["transparent"] },
    fill: { type: "solid", opacity: 1 },
    plotOptions: {
      bar: {
        columnWidth: "65%",
        borderRadius: 4,
        horizontal: false,
        dataLabels: { position: "top" },
      },
    },
    dataLabels: {
      enabled: viewMode === "monthly",
      offsetY: -22,
      style: { fontSize: "11px", fontWeight: 700, colors: ["#181818"] },
      background: { enabled: false },
      formatter: (val: number) => {
        if (!val || val === 0) return "";
        const abs = Math.abs(val);
        if (abs >= 1000000) return `${(abs / 1000000).toFixed(1)}M`;
        if (abs >= 1000) return `${(abs / 1000).toFixed(1)}k`;
        return abs % 1 === 0 ? String(abs) : abs.toFixed(1);
      },
    },
    xaxis: {
      categories: aggregatedData.categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
      labels: {
        rotate: -45,
        hideOverlappingLabels: true,
        style: {
          colors: theme.palette.text.secondary,
          fontSize: viewMode === "monthly" ? "13px" : "11px",
          fontWeight: 600,
        },
      },
    },
    yaxis: {
      forceNiceScale: true,
      labels: {
        style: { colors: theme.palette.text.secondary, fontSize: "13px", fontWeight: 500 },
        formatter: (v) => {
          if (Math.abs(v) >= 1000000) return `R$ ${(v / 1000000).toFixed(1)}M`;
          if (Math.abs(v) >= 1000) return `R$ ${(v / 1000).toFixed(0)}k`;
          return `R$ ${v.toFixed(0)}`;
        },
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      theme: theme.palette.mode,
      style: { fontSize: "14px" },
      y: {
        formatter: (v) =>
          v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
      },
    },
    markers: { size: 0 },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "center",
      fontSize: "14px",
      fontWeight: 600,
      itemMargin: { horizontal: 16, vertical: 6 },
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 4,
      yaxis: { lines: { show: true } },
      xaxis: { lines: { show: false } },
      padding: { left: 15, right: 15, top: 10 },
    },
  };

  const paginatedSeries = useMemo(() => {
    if (!isMobile) return finalSeries;
    const start = mobilePage * MOBILE_PAGE_SIZE;
    const end = start + MOBILE_PAGE_SIZE;
    return finalSeries.map((s) => ({
      ...s,
      data: (s.data as number[]).slice(start, end),
    }));
  }, [finalSeries, isMobile, mobilePage]);

  const paginatedCategories = useMemo(() => {
    if (!isMobile) return aggregatedData.categories;
    const start = mobilePage * MOBILE_PAGE_SIZE;
    const end = start + MOBILE_PAGE_SIZE;
    return aggregatedData.categories.slice(start, end);
  }, [aggregatedData.categories, isMobile, mobilePage]);

  const totalMobilePages = Math.ceil(
    aggregatedData.categories.length / MOBILE_PAGE_SIZE,
  );

  useEffect(() => {
    setMobilePage(0);
  }, [aggregatedData.categories, viewMode, selectedBanks, selectedGrupos]);

  const chartOptionsMobile: ApexOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      fontFamily: "inherit",
      animations: { enabled: false },
    },
    colors: [mobileSeriesColor],
    stroke: { show: true, width: 1, colors: ["transparent"] },
    fill: { type: "solid", opacity: 1 },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: "50%",
        borderRadius: 4,
        dataLabels: { position: "top" },
      },
    },
    dataLabels: {
      enabled: true,
      offsetX: 20,
      style: { fontSize: "10px", fontWeight: 700, colors: ["#131313"] },
      background: {
        enabled: true,
        foreColor: "#e7e7e7",
        borderRadius: 4,
        padding: 4,
        opacity: 0.85,
        borderWidth: 0,
      },
      formatter: (val: number, opts: any) => {
        const serie = opts.w.config.series[0];
        const original = serie?.originalData ?? serie?.data;
        const raw = original?.[opts.dataPointIndex] ?? val;
        if (!raw || Number(raw) === 0) return "";
        const isNeg = Number(raw) < 0;
        const abs = Math.abs(Number(raw));
        const prefix = isNeg ? "-" : "";
        if (abs >= 1000000) return `${prefix}${(abs / 1000000).toFixed(1)}M`;
        if (abs >= 1000) return `${prefix}${(abs / 1000).toFixed(1)}k`;
        return `${prefix}${abs % 1 === 0 ? String(abs) : abs.toFixed(1)}`;
      },
    },
    xaxis: {
      categories: paginatedCategories,
      labels: {
        formatter: (value: any) => {
          if (value == null || typeof value !== "number") return "";
          if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
          if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
          return String(value);
        },
        style: { colors: theme.palette.text.secondary, fontSize: "11px", fontWeight: 600 },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: theme.palette.text.secondary, fontSize: "10px" },
        maxWidth: 80,
        formatter: (val: number) => {
          const str = String(val);
          if (!str) return str;
          if (viewMode === "monthly" && str.length === 7) {
            const [year, month] = str.split("-");
            const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
            return `${months[parseInt(month) - 1]}/${year}`;
          }
          if (str.length >= 10) {
            const [year, month, day] = str.split("-");
            return `${day}/${month}/${year.slice(2)}`;
          }
          return str;
        },
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      theme: theme.palette.mode,
      style: { fontSize: "14px" },
      y: {
        formatter: (v) =>
          v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
      },
    },
    legend: { show: false },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 4,
      yaxis: { lines: { show: true } },
      xaxis: { lines: { show: false } },
      padding: { left: 5, right: 40 },
    },
  };

  const formatCurrency = (v: number | undefined | null) =>
    (v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  // CORREÇÃO 4: O valor do saldo agora é associado diretamente aqui, 
  // limpando a renderização confusa lá no JSX
  const metricCards = [
    {
      label: "Receitas",
      value: rawData.totals.receber,
      color: "rgb(21, 101, 192)",
      fontSize: "0.95rem",
      icon: "heroicons-outline:arrow-trending-up",
      key: "receber",
    },
    {
      label: "Despesas",
      value: rawData.totals.pagar,
      color: "rgb(250, 96, 13)",
      fontSize: "0.95rem",
      icon: "heroicons-outline:arrow-trending-down",
      key: "pagar",
    },
    {
      label: "Lucro/Prejuízo do Período",
      value: rawData.totals.receber - rawData.totals.pagar,
      color: "rgb(35, 163, 41)",
      fontSize: "0.95rem",
      icon: "heroicons-outline:chart-bar-square",
      key: "saldo",
    },
    {
      label: "Saldo Atual",
      value: saldoFinal.data ?? 0, 
      color: "rgb(183, 0, 207)",
      fontSize: "0.95rem",
      icon: "heroicons-outline:calendar-days",
      key: "saldo_dia",
    },
  ];

  return (
    <Card
      className="w-full shadow-sm rounded-2xl"
      elevation={0}
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        height: { xs: "auto" },
        overflow: { xs: "visible" },
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 3,
            pt: 2.5,
            pb: 1.5,
          }}
        >
          <Typography
            sx={{ fontSize: "1.1rem", fontWeight: 700, color: "text.primary" }}
          >
            Evolução Financeira por Banco
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            alignItems: "center",
            px: 3,
            pb: 2,
          }}
        >
          <FormControl size="small" sx={{ width: isMobile ? "100%" : 140 }}>
            <InputLabel>Visualização</InputLabel>
            <Select
              value={tempViewMode}
              label="Visualização"
              onChange={(e: SelectChangeEvent) => {
                const mode = e.target.value as "daily" | "monthly";
                setTempViewMode(mode);
                if (mode === "daily") {
                  const today = new Date();
                  setTempEndDate(today);
                  setTempStartDate(addDays(today, -14));
                } else {
                  setTempStartDate(initialStartDate);
                  setTempEndDate(initialEndDate);
                }
              }}
            >
              <MenuItem value="daily">Diária</MenuItem>
              <MenuItem value="monthly">Mensal</MenuItem>
            </Select>
          </FormControl>

          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
            <DatePicker
              views={
                tempViewMode === "monthly"
                  ? ["year", "month"]
                  : ["year", "month", "day"]
              }
              label="Data Inicial"
              value={tempStartDate}
              onChange={(v) => {
                if (v) {
                  setTempStartDate(v);
                  if (tempViewMode === "daily" && tempEndDate < v)
                    setTempEndDate(v);
                }
              }}
              slotProps={{
                textField: { size: "small", sx: { width: isMobile ? "100%" : 175 } },
                popper: { sx: { zIndex: 9999 } },
              }}
            />
            <DatePicker
              views={
                tempViewMode === "monthly"
                  ? ["year", "month"]
                  : ["year", "month", "day"]
              }
              label="Data Final"
              value={tempEndDate}
              minDate={tempStartDate}
              maxDate={tempViewMode === "daily" ? addDays(tempStartDate, 30) : undefined}
              onChange={(v) => v && setTempEndDate(v)}
              slotProps={{
                textField: { size: "small", sx: { width: isMobile ? "100%" : 175 } },
                popper: { sx: { zIndex: 9999 } },
              }}
            />
          </LocalizationProvider>

          <FormControl size="small" sx={{ width: isMobile ? "100%" : 200 }}>
            <InputLabel id="grupo-banco-label">Grupos de Bancos</InputLabel>
            <Select
              labelId="grupo-banco-label"
              multiple
              value={tempSelectedGrupos}
              onChange={handleGrupoBancoChange}
              input={<OutlinedInput label="Grupos de Bancos" size="small" />}
              renderValue={(selected) => {
                if (selected.length === 0) return <em>Todos</em>;
                return gruposBancos
                  ?.filter((g) => selected.includes(g.codigo))
                  .map((g) => g.nomeGrupo)
                  .join(", ");
              }}
            >
              {gruposBancos?.map((banco) => (
                <MenuItem key={banco.codigo} value={banco.codigo}>
                  <Checkbox checked={tempSelectedGrupos.indexOf(banco.codigo) > -1} />
                  <ListItemText primary={banco.nomeGrupo} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            onClick={() => {
              setViewMode(tempViewMode);
              setSelectedGrupos(tempSelectedGrupos);
              if (tempViewMode === "monthly") {
                setStartDate(startOfMonth(tempStartDate));
                setEndDate(endOfMonth(tempEndDate));
              } else {
                setStartDate(tempStartDate);
                setEndDate(tempEndDate);
              }
            }}
            variant="contained"
            color="primary"
            sx={{
              height: 40,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
              width: isMobile ? "100%" : "auto",
              ml: isMobile ? 0 : "auto",
            }}
          >
            Pesquisar
          </Button>
        </Box>
      </Box>

      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          p: 3,
          "&:last-child": { pb: 3 },
        }}
      >
        {banks.length > 0 && (
          <Box
            sx={{
              display: "flex",
              gap: 1,
              flexWrap: "wrap",
              mb: 2,
              alignItems: "center",
            }}
          >
            <Chip
              key="Todos"
              label="Todos"
              size="small"
              onClick={() => {
                setBanksDirty(true);
                setPendingBanks([]);
              }}
              variant={pendingBanks.length === 0 ? "filled" : "outlined"}
              color={pendingBanks.length === 0 ? "primary" : "default"}
              sx={{ fontWeight: 700 }}
            />

            {banks.map((bank) => {
              const isPrincipal = bank === bancoPrincipal;
              const isPending = pendingBanks.includes(bank);
              return (
                <Chip
                  key={bank}
                  label={isPrincipal ? `★ ${bank}` : bank}
                  size="small"
                  onClick={() => {
                    setBanksDirty(true);
                    setPendingBanks((prev) =>
                      prev.includes(bank)
                        ? prev.filter((b) => b !== bank)
                        : [...prev, bank],
                    );
                  }}
                  variant={isPending ? "filled" : "outlined"}
                  color={isPending ? "primary" : "default"}
                  sx={{
                    fontWeight: isPending || isPrincipal ? 700 : 400,
                    ...(isPrincipal && !isPending && {
                      borderColor: theme.palette.warning.main,
                      color: theme.palette.warning.dark,
                      bgcolor: alpha(theme.palette.warning.main, 0.08),
                    }),
                    ...(isPrincipal && isPending && {
                      bgcolor: theme.palette.warning.main,
                      "&:hover": { bgcolor: theme.palette.warning.dark },
                    }),
                  }}
                />
              );
            })}

            {banksDirty && (
              <Button
                size="small"
                variant="contained"
                color="primary"
                sx={{
                  height: 28,
                  borderRadius: 2,
                  textTransform: "none",
                  width: isMobile ? '100%' : 'inherit',
                  fontWeight: 700,
                  ml: 1,
                }}
                onClick={() => {
                  setSelectedBanks(pendingBanks);
                  setBanksDirty(false);
                }}
              >
                Aplicar
              </Button>
            )}
          </Box>
        )}

        {isMobile && (
          <Tabs
            value={activeSeries}
            onChange={(_, v) => setActiveSeries(v as string)}
            variant="fullWidth"
            indicatorColor="primary"
            textColor="inherit"
            sx={{
              minHeight: 40,
              mb: 2,
              "& .MuiTabs-indicator": { bgcolor: mobileSeriesColor },
            }}
          >
            <Tab
              value="receber"
              label="Receber"
              sx={{ color: colorReceber, fontWeight: 700, minHeight: 40, py: 1 }}
            />
            <Tab
              value="pagar"
              label="Pagar"
              sx={{ color: colorPagar, fontWeight: 700, minHeight: 40, py: 1 }}
            />
            <Tab
              value="saldo"
              label="Saldo"
              sx={{ color: colorSaldo, fontWeight: 700, minHeight: 40, py: 1 }}
            />
          </Tabs>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "repeat(4, 1fr)",
            },
            gap: 2,
            mb: 3,
            pb: 2,
          }}
        >
          {metricCards.map((m) => {
            if (isMobile && m.key !== "saldo_dia" && m.key !== activeSeries)
              return null;
            return (
              <Box
                key={m.label}
                sx={{
                  p: isMobile ? 2 : 2.5,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${m.color} 0%, ${alpha(m.color, 0.75)} 100%)`,
                  position: "relative",
                  overflow: "hidden",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  "&:hover": { transform: "translateY(-2px)", boxShadow: 4 },
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    right: -12,
                    bottom: -12,
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: alpha("#fff", 0.1),
                    zIndex: 0,
                  }}
                />
                <Box sx={{ position: "relative", zIndex: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: alpha("#fff", 0.9),
                        fontWeight: 700,
                        fontSize: isMobile ? "1.25rem" : "1.25rem",
                        letterSpacing: 0.5,
                        textTransform: "uppercase",
                      }}
                    >
                      {m.label}
                    </Typography>
                    <FuseSvgIcon
                      size={isMobile ? 20 : 24}
                      sx={{ color: alpha("#fff", 0.4) }}
                    >
                      {m.icon}
                    </FuseSvgIcon>
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 900,
                      color: "#fff",
                      fontSize: isMobile ? "1.25rem" : "1.25rem",
                      lineHeight: 1.2,
                    }}
                  >
                    {formatCurrency(m.value)}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>

        {isLoading ? (
          <WidgetLoading height={380} />
        ) : filteredData.length === 0 ? (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography color="text.secondary">
              Nenhum dado encontrado para o período selecionado.
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              flex: 1,
              minHeight: { xs: 250, md: 380 },
              height: { md: 380 },
            }}
          >
            {isMobile && totalMobilePages > 1 && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 1,
                  px: 1,
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => setMobilePage((p) => Math.max(0, p - 1))}
                  disabled={mobilePage === 0}
                  sx={{
                    bgcolor: mobilePage === 0 ? "transparent" : alpha(mobileSeriesColor, 0.1),
                    border: `1px solid ${alpha(mobileSeriesColor, 0.3)}`,
                    borderRadius: 2,
                  }}
                >
                  <FuseSvgIcon size={18}>heroicons-outline:chevron-left</FuseSvgIcon>
                </IconButton>

                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, color: "text.secondary" }}
                >
                  {mobilePage * MOBILE_PAGE_SIZE + 1}–
                  {Math.min(
                    (mobilePage + 1) * MOBILE_PAGE_SIZE,
                    aggregatedData.categories.length,
                  )}{" "}
                  de {aggregatedData.categories.length}{" "}
                  {viewMode === "monthly" ? "meses" : "dias"}
                </Typography>

                <IconButton
                  size="small"
                  onClick={() =>
                    setMobilePage((p) => Math.min(totalMobilePages - 1, p + 1))
                  }
                  disabled={mobilePage === totalMobilePages - 1}
                  sx={{
                    bgcolor:
                      mobilePage === totalMobilePages - 1
                        ? "transparent"
                        : alpha(mobileSeriesColor, 0.1),
                    border: `1px solid ${alpha(mobileSeriesColor, 0.3)}`,
                    borderRadius: 2,
                  }}
                >
                  <FuseSvgIcon size={18}>heroicons-outline:chevron-right</FuseSvgIcon>
                </IconButton>
              </Box>
            )}

            <ReactApexChart
              key={isMobile ? `mobile-${activeSeries}-${mobilePage}` : "desktop"}
              options={isMobile ? chartOptionsMobile : chartOptionsDesktop}
              series={isMobile ? paginatedSeries : aggregatedData.series}
              type="bar"
              height={
                isMobile ? Math.max(250, paginatedCategories.length * 55) : 380
              }
            />
          </Box>
        )}

        <Box sx={{ mt: 1, textAlign: "right" }}>
          <Typography variant="caption" color="text.disabled">
            Referência:{" "}
            {viewMode === "monthly"
              ? format(startDate, "MMMM/yyyy", { locale: ptBR })
              : `${format(startDate, "dd/MM/yyyy")} até ${format(endDate, "dd/MM/yyyy")}`}
            {selectedBanks.length > 0 ? ` · ${selectedBanks.join(", ")}` : ""}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}