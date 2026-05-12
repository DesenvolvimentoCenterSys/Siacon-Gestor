"use client";

import { useMemo, useState } from "react";
import { useSessionUrlFilter } from "@auth/useSessionUrlFilter";
import { useTheme, alpha } from "@mui/material/styles";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Menu,
  MenuItem,
  ListItemText,
  Tabs,
  Tab,
} from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import useThemeMediaQuery from "@fuse/hooks/useThemeMediaQuery";
import {
  useAccumulatedDelinquency,
  useDelinquencyAging,
} from "../../hooks/useDashboard";
import WidgetLoading from "../ui/WidgetLoading";

const MONTHS = [
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

const COLORS = {
  red: ["#db2020", "#c7281d"] as [string, string],
  orange: ["#fa600d", "#f04816"] as [string, string],
  green: ["#23a329", "#229229"] as [string, string],
  blue: ["#1565C0", "#0D47A1"] as [string, string],
  purple: ["#b700cf", "#7e0058"] as [string, string],
};

const AGING_COLORS = ["#e2aa1c", "#F57C00", "#D84315", "#D32F2F", "#8A0000"];

interface GradientKPIProps {
  title: string;
  mainValue: string;
  icon: string;
  gradientColors: [string, string];
  sub?: string | null;
  compactSpaces?: boolean;
}

function GradientKPI({
  title,
  mainValue,
  icon,
  gradientColors,
  sub,
  compactSpaces,
}: GradientKPIProps) {
  return (
    <Card
      elevation={3}
      sx={{
        background: `linear-gradient(135deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)`,
        color: "white",
        height: "100%",
        position: "relative",
        overflow: "hidden",
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
          "&:last-child": { pb: compactSpaces ? 1.3 : { xs: 2.3, sm: 2.5 } },
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
          <Typography
            sx={{
              opacity: 0.9,
              fontWeight: 700,
              fontSize: { xs: "1.5rem", sm: "1.5rem", md: "1.5rem" },
              letterSpacing: 0.3,
            }}
          >
            {title}
          </Typography>
          <FuseSvgIcon size={32} sx={{ opacity: 0.3 }}>
            {icon}
          </FuseSvgIcon>
        </Box>

        <Typography
          sx={{
            fontWeight: 800,
            mb: sub ? 0.5 : 0,
            fontSize: { xs: "1.8rem", sm: "2.0rem", md: "2.2rem" },
            lineHeight: 1.1,
          }}
        >
          {mainValue}
        </Typography>

        {sub && (
          <Typography
            sx={{
              opacity: 0.85,
              fontSize: { xs: "1.25rem", sm: "1.25rem" },
              fontWeight: 500,
            }}
          >
            {sub}
          </Typography>
        )}
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

interface AccumulatedDelinquencyWidgetProps {}

export function AccumulatedDelinquencyWidget({}: AccumulatedDelinquencyWidgetProps) {
  const theme = useTheme();
  const isMobile = useThemeMediaQuery((t) => t.breakpoints.down("md"));
  const currentYear = new Date().getFullYear();
  const availableYears = useMemo(
    () => Array.from({ length: 5 }, (_, i) => currentYear - i),
    [currentYear],
  );
  const [selectedYear, setSelectedYear] = useSessionUrlFilter<number>(
    "inadimplencia_acc_selectedYear",
    currentYear,
    String,
    Number,
  );
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);
  const handleClickMenu = (e: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(e.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);
  const handleSelectYear = (year: number) => {
    setSelectedYear(year);
    handleCloseMenu();
  };

  // ── Novo estado para controlar a aba ativa no mobile ──
  const [mobileTab, setMobileTab] = useState<"mensal" | "acumulado">("mensal");

  const { data: widgetData, isLoading } =
    useAccumulatedDelinquency(selectedYear);
  const { data: agingData } = useDelinquencyAging(selectedYear);
  const processedData = useMemo(() => {
    if (!widgetData || widgetData.accumulatedDelinquency.length === 0)
      return null;
    const sorted = [...widgetData.accumulatedDelinquency].sort(
      (a, b) => a.mes - b.mes,
    );
    const categories = sorted.map((d) => MONTHS[d.mes - 1] ?? `Mês ${d.mes}`);
    const seriesMensal = sorted.map((d) => d.valorMensal);
    const seriesAcumulado = sorted.map((d) => d.valorAcumulado);
    const totalMensal = sorted.reduce((s, d) => s + d.valorMensal, 0);
    const totalAcumulado =
      sorted.length > 0 ? sorted[sorted.length - 1].valorAcumulado : 0;
    const peakMonth = sorted.reduce(
      (max, d) => (d.valorMensal > max.valorMensal ? d : max),
      sorted[0],
    );
    const avgMensal = totalMensal / sorted.length;
    const variation = widgetData.lastMonthTaxVariation ?? 0;
    return {
      categories,
      seriesMensal,
      seriesAcumulado,
      totalMensal,
      totalAcumulado,
      peakMonth,
      avgMensal,
      variation,
    };
  }, [widgetData]);

  const agingBuckets = useMemo(() => {
    if (!agingData) return [];
    const buckets = [
      { label: "Até 10 dias", min: 0, max: 10, color: AGING_COLORS[0] },
      { label: "11 à 30 dias", min: 11, max: 30, color: AGING_COLORS[1] },
      { label: "31 à 60 dias", min: 31, max: 60, color: AGING_COLORS[2] },
      { label: "61 à 90 dias", min: 61, max: 90, color: AGING_COLORS[3] },
      {
        label: "Acima de 90 dias",
        min: 91,
        max: Infinity,
        color: AGING_COLORS[4],
      },
    ];
    const mappedBuckets = buckets.map((bucket) => {
      const filtered = agingData.filter(
        (item) =>
          item.diasVencido >= bucket.min && item.diasVencido <= bucket.max,
      );

      return {
        ...bucket,
        valor: filtered.reduce((s, i) => s + i.valor, 0),
        quantidade: filtered.reduce((s, i) => s + i.quantidade, 0),
      };
    });

    const valorTotal = mappedBuckets.reduce((s, bucket) => s + bucket.valor, 0);

    return mappedBuckets.map((bucket) => ({
      ...bucket,
      percentual:
        valorTotal > 0
          ? Number(((bucket.valor / valorTotal) * 100).toFixed(2))
          : 0,
    }));
  }, [agingData]);

  const formatCurrency = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const colorMensal = theme.palette.mode === "dark" ? "#3B82F6" : "#2563EB";
  const colorAcumulado = "#FF5722";

  const activeMobileColor =
    mobileTab === "mensal" ? colorMensal : colorAcumulado;

  const chartOptions: ApexOptions = {
    chart: {
      type: isMobile ? "bar" : "line",
      stacked: false,
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: "inherit",
      animations: { enabled: !isMobile, speed: 600 },
      dropShadow: isMobile
        ? { enabled: false }
        : {
            enabled: true,
            enabledOnSeries: [1],
            top: 4,
            left: 0,
            blur: 4,
            color: colorAcumulado,
            opacity: 0.3,
          },
    },
    colors: isMobile ? [activeMobileColor] : [colorMensal, colorAcumulado],
    stroke: {
      width: isMobile ? [0] : [0, 4],
      curve: "smooth",
    },
    plotOptions: {
      bar: {
        horizontal: isMobile,
        columnWidth: "45%",
        barHeight: isMobile ? "60%" : undefined,
        borderRadius: 6,
        borderRadiusApplication: "end",
        dataLabels: {
          position: "top",
        },
      },
    },
    fill: {
      type: isMobile ? ["solid"] : ["solid", "solid"],
      opacity: isMobile ? [1] : [0.8, 1],
    },
    dataLabels: {
      enabled: isMobile,
      formatter: (v) => {
        const numVal = Number(v);
        if (Number.isNaN(numVal)) return "";

        return numVal >= 1000000
          ? `${(numVal / 1000000).toFixed(1)}M`
          : numVal >= 1000
            ? `${(numVal / 1000).toFixed(0)}k`
            : `${numVal.toFixed(0)}`;
      },
      style: {
        fontSize: "11px",
        fontWeight: 700,
        colors: [theme.palette.text.primary],
      },
      offsetX: 20,
    },
    xaxis: isMobile
      ? {
          labels: {
            formatter: (v) => {
              const numVal = Number(v);
              if (Number.isNaN(numVal)) return String(v);

              return numVal >= 1000000
                ? `R$${(numVal / 1000000).toFixed(1)}M`
                : numVal >= 1000
                  ? `R$${(numVal / 1000).toFixed(0)}k`
                  : `R$${numVal.toFixed(0)}`;
            },
            style: { fontSize: "11px", colors: theme.palette.text.secondary },
          },
          axisBorder: { show: false },
          axisTicks: { show: false },
        }
      : {
          categories: processedData?.categories ?? [],
          axisBorder: { show: false },
          axisTicks: { show: false },
          labels: {
            style: {
              colors: theme.palette.text.secondary,
              fontSize: "13px",
              fontWeight: 600,
            },
          },
        },
    yaxis: isMobile
      ? {
          labels: {
            style: {
              colors: theme.palette.text.secondary,
              fontSize: "12px",
              fontWeight: 600,
            },
          },
        }
      : [
          {
            seriesName: "Mensal",
            min: 0,
            forceNiceScale: true,
            title: {
              text: "Inadimplência Mensal",
              style: { color: colorMensal, fontSize: "12px", fontWeight: 600 },
            },
            labels: {
              style: { colors: colorMensal, fontSize: "12px", fontWeight: 600 },
              formatter: (v) =>
                v >= 1000000
                  ? `R$${(v / 1000000).toFixed(1)}M`
                  : v >= 1000
                    ? `R$${(v / 1000).toFixed(0)}k`
                    : `R$${v.toFixed(0)}`,
            },
          },
          {
            seriesName: "Acumulado",
            opposite: true,
            title: {
              text: "Acumulado",
              style: {
                color: colorAcumulado,
                fontSize: "12px",
                fontWeight: 600,
              },
            },
            labels: {
              style: {
                colors: colorAcumulado,
                fontSize: "12px",
                fontWeight: 600,
              },
              formatter: (v) =>
                v >= 1000000
                  ? `R$${(v / 1000000).toFixed(1)}M`
                  : v >= 1000
                    ? `R$${(v / 1000).toFixed(0)}k`
                    : `R$${v.toFixed(0)}`,
            },
          },
        ],
    tooltip: {
      shared: !isMobile,
      intersect: false,
      theme: theme.palette.mode,
      style: { fontSize: "13px" },
      y: {
        formatter: (value, { seriesIndex, dataPointIndex }) => {
          const formattedValue = formatCurrency(value);

          if (!isMobile) {
            return formattedValue;
          }

          const totalAnual = processedData?.totalMensal ?? 0;
          if (totalAnual === 0) return formattedValue;

          const percentage = ((value / totalAnual) * 100).toFixed(1);
          return `${formattedValue}<br><span style="font-size: 11px; color: ${theme.palette.text.secondary};">${percentage}% do total anual</span>`;
        }
      },
      custom: !isMobile ? ({ series, seriesIndex, dataPointIndex, w }) => {
        const totalAnual = processedData?.totalMensal ?? 0;
        if (totalAnual === 0) {
          return `<div style="padding: 8px; background: ${theme.palette.background.paper}; border: 1px solid ${theme.palette.divider}; border-radius: 4px;">
            <div style="font-weight: 600; margin-bottom: 4px;">${MONTHS[dataPointIndex]}</div>
            <div>Mensal: ${formatCurrency(series[0][dataPointIndex])}</div>
            <div>Acumulado: ${formatCurrency(series[1][dataPointIndex])}</div>
          </div>`;
        }

        const mensalValue = series[0][dataPointIndex];
        const acumuladoValue = series[1][dataPointIndex];
        const mensalPercentage = ((mensalValue / totalAnual) * 100).toFixed(1);

        return `<div style="padding: 8px; background: ${theme.palette.background.paper}; border: 1px solid ${theme.palette.divider}; border-radius: 4px;">
          <div style="font-weight: 600; margin-bottom: 4px;">${MONTHS[dataPointIndex]}</div>
          <div>Mensal: ${formatCurrency(mensalValue)}</div>
          <div style="font-size: 11px; color: ${theme.palette.text.secondary};">${mensalPercentage}% do total anual</div>
          <div>Acumulado: ${formatCurrency(acumuladoValue)}</div>
        </div>`;
      } : undefined,
    },
    legend: {
      show: !isMobile,
      position: "top",
      horizontalAlign: "center",
      fontSize: "13px",
      fontWeight: 600,
      itemMargin: { horizontal: 16, vertical: 6 },
      labels: { colors: theme.palette.text.secondary },
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 4,
      yaxis: { lines: { show: !isMobile } },
      xaxis: { lines: { show: isMobile } },
      padding: { left: isMobile ? 5 : 15, right: isMobile ? 15 : 20 },
    },
    markers: isMobile
      ? { size: 0 }
      : {
          size: [0, 4],
          colors: ["transparent", theme.palette.background.paper],
          strokeColors: [colorMensal, colorAcumulado],
          strokeWidth: 2,
          hover: { size: 7 },
        },
  };

  const chartSeries = isMobile
    ? [
        {
          name: mobileTab === "mensal" ? "Mensal" : "Acumulado",
          data:
            mobileTab === "mensal"
              ? processedData?.seriesMensal ?? []
              : processedData?.seriesAcumulado ?? [],
          type: "bar",
        },
      ]
    : [
        {
          name: "Mensal",
          type: "column",
          data: processedData?.seriesMensal ?? [],
        },
        {
          name: "Acumulado",
          type: "line",
          data: processedData?.seriesAcumulado ?? [],
        },
      ];

  const mobileChartHeight = Math.max(
    320,
    (processedData?.categories?.length ?? 0) * 35,
  );

  if (isLoading) return <WidgetLoading height={520} />;

  const variationGradient: [string, string] =
    processedData && processedData.variation < 0
      ? COLORS.purple
      : COLORS.purple;

  return (
    <Card
      elevation={0}
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        height: "100%",
        overflow: "visible",
      }}
    >
      <CardContent
        sx={{
          p: { xs: 2, sm: 2.5 },
          "&:last-child": { pb: { xs: 2, sm: 2.5 } },
        }}
      >
        <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              bgcolor: alpha("#B71C1C", 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FuseSvgIcon sx={{ color: "#B71C1C" }} size={24}>
              heroicons-outline:exclamation-triangle
            </FuseSvgIcon>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Acompanhamento de valores inadimplentes — acumulado mensal (anual)
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            borderBottom: `1px solid ${theme.palette.divider}`,
            mb: 3,
            width: "100%",
          }}
        />
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontSize: "1.5rem",
              fontWeight: 600,
              letterSpacing: "0.02em",
              mr: 1,
              ml: 0.7,
            }}
          >
            Ano de referência:
          </Typography>
          <Box
            onClick={handleClickMenu}
            sx={{
              display: "inline-flex",
              alignItems: "center",
			  width: "auto",
              gap: 0.75,
              px: 2,
              py: 0.7,
              borderRadius: "12px",
              background: alpha("#ffffff", 0.15),
              backdropFilter: "blur(10px)",
              border: `1px solid ${alpha(theme.palette.divider, 1)}`,
              cursor: "pointer",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                background: alpha(theme.palette.action.hover, 1),
                color: "#ffff",
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
                fontSize: "1.5rem",
                fontWeight: 600,
                letterSpacing: "0.02em",
              }}
            >
              {selectedYear}
            </Typography>
            <FuseSvgIcon size={16} sx={{ opacity: 0.7 }}>
              heroicons-solid:chevron-down
            </FuseSvgIcon>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleCloseMenu}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
            slotProps={{
              paper: {
                sx: {
                  mt: 1,
                  minWidth: 120,
                  borderRadius: 2,
                  boxShadow: theme.shadows[8],
                },
              },
            }}
          >
            {availableYears.map((year) => (
              <MenuItem
                key={year}
                selected={year === selectedYear}
                onClick={() => handleSelectYear(year)}
              >
                <ListItemText>{year}</ListItemText>
              </MenuItem>
            ))}
          </Menu>
        </Box>
        {/* ── KPI Cards ── */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            gap: 2.5,
            mb: 2.5,
          }}
        >
          <GradientKPI
            title="Total Anual"
            mainValue={formatCurrency(processedData?.totalMensal ?? 0)}
            icon="heroicons-outline:banknotes"
            gradientColors={COLORS.red}
          />
          <GradientKPI
            title="Pico Mensal"
            mainValue={
              processedData?.peakMonth
                ? formatCurrency(processedData.peakMonth.valorMensal)
                : "—"
            }
            icon="heroicons-outline:arrow-up-circle"
            gradientColors={COLORS.orange}
            sub={
              processedData?.peakMonth
                ? MONTHS[processedData.peakMonth.mes - 1]
                : null
            }
          />
          <GradientKPI
            title="Variação Último Mês"
            mainValue={
              processedData
                ? `${processedData.variation > 0 ? "+" : ""}${processedData.variation.toFixed(1)}%`
                : "—"
            }
            icon={
              processedData && processedData.variation >= 0
                ? "heroicons-outline:arrow-trending-up"
                : "heroicons-outline:arrow-trending-down"
            }
            gradientColors={variationGradient}
            sub="vs. mês anterior"
          />
        </Box>
		{isMobile && (<Box
          sx={{
            borderTop: `1px solid ${theme.palette.divider}`,
            mb: 3,
            width: "100%",
			display: "flex",
			justifyContent: "center",
          }}
        >
		<Typography 
			variant="caption" 
			color="text.secondary" 
			sx={{ 
				mt: 2, 
				textAlign: "center", 
				display: "block", 
				fontSize: "1.25rem", 
				fontWeight: 600, 
				letterSpacing: "0.02em",
				border: `1px solid ${alpha(theme.palette.divider, 1)}`,
				borderRadius: 1,
				background: alpha("#ffffff", 0.15), 
				width: "50%"
				}}>
			Envelhecimento
		</Typography>
		</Box>)}
        {/* ── Aging Buckets ── */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(5, 1fr)",
            },
            gap: 2,
            mb: 2.5,
          }}
        >
          {agingBuckets.map((bucket) => (
            <Card
              key={bucket.label}
              elevation={3}
              sx={{
                background: bucket.color,
                color: "white",
                position: "relative",
                overflow: "hidden",
                transition:
                  "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: theme.shadows[8],
                },
              }}
            >
              <CardContent
                sx={{
                  position: "relative",
                  zIndex: 1,
                  p: 2.5,
                  "&:last-child": { pb: 1.5 },
                }}
              >
                <Typography
                  sx={{
                    opacity: 0.9,
                    fontWeight: 700,
                    fontSize: "1.5rem",
                    mb: 0.5,
                  }}
                >
                  {bucket.label}
                </Typography>
                <Typography
                  sx={{ fontWeight: 800, fontSize: "1.25rem", lineHeight: 1.1 }}
                >
                  {formatCurrency(bucket.valor)}
                </Typography>
                <Typography
                  sx={{
                    opacity: 0.8,
                    fontSize: "1rem",
                    mt: 0.3,
                    fontWeight: 500,
                    color: "#ffff",
                  }}
                >
                  {bucket.quantidade} títulos
                </Typography>
                <Typography
                  sx={{
                    opacity: 0.8,
                    fontSize: "1rem",
                    mt: 0.3,
                    fontWeight: 500,
                    color: "#ffff",
                  }}
                >
                  {bucket.percentual} % do total
                </Typography>
              </CardContent>
              <Box
                sx={{
                  position: "absolute",
                  right: -12,
                  bottom: -12,
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  background: alpha("#ffffff", 0.1),
                  zIndex: 0,
                }}
              />
            </Card>
          ))}
        </Box>

        {/* ── Gráfico ── */}
        <Card
          elevation={0}
          sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 1,
              px: 3,
              py: 2,
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: { xs: "1.1rem", sm: "1.3rem" },
                color: "text.primary",
              }}
            >
              Inadimplência — {selectedYear}
            </Typography>

            {/* Renderiza as abas no cabeçalho do card apenas em telas mobile */}
            {isMobile && (
              <Tabs
                value={mobileTab}
                onChange={(_, v) => setMobileTab(v)}
                sx={{
                  minHeight: 32,
                  "& .MuiTab-root": {
                    minHeight: 32,
                    py: 0.5,
                    px: 1.5,
                    fontSize: "0.85rem",
                    fontWeight: 600,
                  },
                }}
              >
                <Tab label="Mensal" value="mensal" />
                <Tab label="Acumulado" value="acumulado" />
              </Tabs>
            )}
          </Box>

          <Box
            sx={{ p: { xs: 1.5, md: 2.5 }, minHeight: { xs: 300, md: 380 } }}
          >
            {!processedData ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 300,
                  gap: 1,
                }}
              >
                <FuseSvgIcon size={48} sx={{ color: colorMensal }}>
                  heroicons-outline:face-smile
                </FuseSvgIcon>
                <Typography
                  color="text.secondary"
                  variant="body2"
                  fontWeight={500}
                >
                  Nenhuma inadimplência registrada em {selectedYear} 🎉
                </Typography>
              </Box>
            ) : (
              <ReactApexChart
                options={chartOptions}
                series={chartSeries}
                type="bar"
                height={isMobile ? mobileChartHeight : 380}
              />
            )}
          </Box>
        </Card>
      </CardContent>
    </Card>
  );
}
