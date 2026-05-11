"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Typography,
  Skeleton,
  Tab,
  Tabs,
  Card,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { format } from "date-fns";
import * as Recharts from "recharts";
import {
  useTotalFaturamentoPorConvenioWithFilters,
  useTotalFaturamentoPorConvenioReferenciaWithFilters,
} from "../../hooks/useDashboard";
import type { DateFilterTab } from "../../hooks/useDateFilter";

const {
  PieChart,
  Pie,
  Cell,
  Tooltip: RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} = Recharts;

const COLORS = [
  "#4F8EF7",
  "#F7884F",
  "#4FD1A0",
  "#F7CF4F",
  "#A04FF7",
  "#F74F6E",
  "#4FC5F7",
  "#8EF74F",
  "#F74FC5",
  "#4FF7A0",
  "#F7A04F",
  "#7A4FF7",
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value,
  );

const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const {
    name,
    value,
    payload: { percent },
  } = payload[0];
  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        px: 2,
        py: 1.5,
        boxShadow: 3,
      }}
    >
      <Typography variant="body2" fontWeight={700}>
        {name}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {formatCurrency(value)}
      </Typography>
      <Typography variant="caption" color="primary" fontWeight={600}>
        {percent ? formatPercent(percent) : ""}
      </Typography>
    </Box>
  );
}

const RADIAN = Math.PI / 180;


const LABEL_THRESHOLD = 0.03;

function renderCustomLabel(props: any) {
  const { cx, cy, midAngle, outerRadius, name, percent } = props;


  if (percent < LABEL_THRESHOLD) return null;


  const radius = outerRadius + 32;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  const label = name.length > 20 ? name.slice(0, 19) + "…" : name;
  const anchor = x > cx ? "start" : "end";

  return (
    <text
      x={x}
      y={y}
      fill="currentColor"
      textAnchor={anchor}
      dominantBaseline="central"
      fontSize={11}
      fontWeight={500}
      opacity={0.85}
    >
      {label} {formatPercent(percent)}
    </text>
  );
}

interface FaturamentoPorConvenioDonutWidgetProps {
  startDate?: Date | null;
  endDate?: Date | null;
  tab?: DateFilterTab;
  convenios?: number[];
  servicos?: number[];
  centrosCusto?: number[];
  planosContas?: number[];
}

export function FaturamentoPorConvenioDonutWidget({
  startDate,
  endDate,
  tab: externalTab,
  convenios = [],
  servicos = [],
  centrosCusto = [],
  planosContas = [],
}: FaturamentoPorConvenioDonutWidgetProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [internalTab, setInternalTab] = useState<DateFilterTab>("competencia");

  const showInternalTabs = externalTab === undefined;
  const tab = externalTab ?? internalTab;

  const startStr = startDate ? format(startDate, "yyyy-MM-dd") : undefined;
  const endStr = endDate ? format(endDate, "yyyy-MM-dd") : undefined;

  const {
    data: dataVencimento,
    isLoading: isLoadingVencimento,
    isError: isErrorVencimento,
  } = useTotalFaturamentoPorConvenioWithFilters(
    startStr,
    endStr,
    convenios,
    servicos,
    centrosCusto,
    planosContas,
  );
  const {
    data: dataCompetencia,
    isLoading: isLoadingCompetencia,
    isError: isErrorCompetencia,
  } = useTotalFaturamentoPorConvenioReferenciaWithFilters(
    startStr,
    endStr,
    convenios,
    servicos,
    centrosCusto,
    planosContas,
  );

  const data = tab === "vencimento" ? dataVencimento : dataCompetencia;
  const isLoading =
    tab === "vencimento" ? isLoadingVencimento : isLoadingCompetencia;
  const isError = tab === "vencimento" ? isErrorVencimento : isErrorCompetencia;

  const chartData = useMemo(() => {
    if (!data?.porConvenio?.length) return [];
    const total = data.porConvenio.reduce(
      (sum, d) => sum + (d.faturamento?.totalGeral ?? 0),
      0,
    );
    return data.porConvenio
      .filter((d) => (d.faturamento?.totalGeral ?? 0) > 0)
      .map((d) => ({
        name: d.nomeConvenio,
        value: d.faturamento?.totalGeral ?? 0,
        percent: total > 0 ? (d.faturamento?.totalGeral ?? 0) / total : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  const totalGeral = useMemo(
    () => chartData.reduce((sum, d) => sum + d.value, 0),
    [chartData],
  );

  const smallSlices = useMemo(
    () => chartData.filter((d) => d.percent < LABEL_THRESHOLD),
    [chartData],
  );

  if (isLoading) {
    return (
      <Card
        sx={{
          height: "100%",
          p: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Skeleton
          variant="circular"
          width={isMobile ? 250 : 320}
          height={isMobile ? 250 : 320}
        />
      </Card>
    );
  }

  if (isError || !chartData.length) {
    return (
      <Card
        sx={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 400,
        }}
      >
        <Typography color="text.secondary">Sem dados disponíveis.</Typography>
      </Card>
    );
  }

  const barChartHeight = Math.max(300, chartData.length * 40);

  return (
    <Card
      elevation={3}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background:
          theme.palette.mode === "dark"
            ? "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)"
            : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: (t) => t.shadows[8],
        },
      }}
    >
      {showInternalTabs && (
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: "rgba(0,0,0,0.02)",
          }}
        >
          <Tabs
            value={internalTab}
            onChange={(_, v) => setInternalTab(v)}
            variant="fullWidth"
            sx={{
              minHeight: 40,
              "& .MuiTab-root": { minHeight: 40, py: 0.5, fontSize: "0.9rem" },
            }}
          >
            <Tab label="Por Vencimento" value="vencimento" />
            <Tab label="Por Competência" value="competencia" />
          </Tabs>
        </Box>
      )}

      <Box sx={{ p: 3, flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5 }}>
          Faturamento por Convênio
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
          Total: {formatCurrency(totalGeral)}
        </Typography>

        {isMobile ? (
          // ── MOBILE: gráfico de barras horizontais ──────────────────────────
          <ResponsiveContainer width="100%" height={barChartHeight}>
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
            >
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                width={110}
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) =>
                  value.length > 15 ? `${value.slice(0, 14)}...` : value
                }
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={560}>
              <PieChart margin={{ top: 60, right: 120, bottom: 60, left: 120 }}>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius="35%"
                  outerRadius="82%"
                  paddingAngle={2}
                  dataKey="value"
                  label={renderCustomLabel}
                  labelLine={{
                    stroke: "currentColor",
                    strokeWidth: 1,
                    opacity: 0.35,
                  }}
                >
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Legenda compacta para slices < 3% que ficam sem label inline */}
            {smallSlices.length > 0 && (
              <Box
                sx={{
                  mt: 1,
                  px: 1,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  justifyContent: "center",
                }}
              >
                {smallSlices.map((d) => {
                  const colorIndex = chartData.indexOf(d);
                  return (
                    <Box
                      key={d.name}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.75,
                        bgcolor: "rgba(0,0,0,0.03)",
                        borderRadius: 1,
                        px: 1,
                        py: 0.4,
                      }}
                    >
                      <Box
                        sx={{
                          width: 9,
                          height: 9,
                          borderRadius: "50%",
                          bgcolor: COLORS[colorIndex % COLORS.length],
                          flexShrink: 0,
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {d.name}:{" "}
                        <strong>{formatPercent(d.percent)}</strong>{" "}
                        ({formatCurrency(d.value)})
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            )}
          </>
        )}
      </Box>
    </Card>
  );
}