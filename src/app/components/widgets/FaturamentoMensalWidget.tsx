import { useMemo } from "react";
import { useSessionUrlFilter } from "@auth/useSessionUrlFilter";
import { useTheme } from "@mui/material/styles";
import { format } from "date-fns";
import { Box, Tabs, Tab, Card } from "@mui/material";
import { KPICard } from "../../components/charts";
import {
  useFaturamentoMensal,
  useFaturamentoMensalReferencia,
} from "../../hooks/useDashboard";
import WidgetLoading from "../../components/ui/WidgetLoading";
import type { DateFilterTab } from "../../hooks/useDateFilter";

interface FaturamentoMensalWidgetProps {
  startDate?: Date | null;
  endDate?: Date | null;
  tab?: DateFilterTab;
}

export function FaturamentoMensalWidget({
  startDate,
  endDate,
  tab,
}: FaturamentoMensalWidgetProps) {
  const theme = useTheme();

  const [selectedDate, setSelectedDate] = useSessionUrlFilter<Date | null>(
    "financeiro_fat_mensal_selectedDate",
    new Date(),
    (d) => (d ? d.toISOString() : ""),
    (s) => (s ? new Date(s) : null),
  );

  const [tabIndex, setTabIndex] = useSessionUrlFilter<number>(
    "financeiro_fat_mensal_tabIndex",
    0,
    String,
    Number,
  );

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const showInternalTabs = tab === undefined;
  const effectiveTabIndex =
    tab !== undefined ? (tab === "vencimento" ? 0 : 1) : tabIndex;

  const effectiveDate = startDate ?? selectedDate;

  const startStr = useMemo(() => {
    if (startDate) return format(startDate, "yyyy-MM-dd");
    if (selectedDate)
      return format(
        new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
        "yyyy-MM-dd",
      );
    return undefined;
  }, [startDate, selectedDate]);

  const endStr = useMemo(() => {
    if (endDate) return format(endDate, "yyyy-MM-dd");
    if (selectedDate)
      return format(
        new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0),
        "yyyy-MM-dd",
      );
    return undefined;
  }, [endDate, selectedDate]);

  const { data: faturamentoDataVencimento, isLoading: isLoadingVencimento } =
    useFaturamentoMensal(startStr, endStr);
  const { data: faturamentoDataCompetencia, isLoading: isLoadingCompetencia } =
    useFaturamentoMensalReferencia(startStr, endStr);

  const faturamentoData =
    effectiveTabIndex === 0
      ? faturamentoDataVencimento
      : faturamentoDataCompetencia;

  const faturamentoAnterior = faturamentoDataVencimento;
  console.log("Faturamento do período anterior:", faturamentoAnterior);
  const isLoading =
    effectiveTabIndex === 0 ? isLoadingVencimento : isLoadingCompetencia;

  const kpiData = useMemo(() => {
    if (!faturamentoData) return null;
    const faturamento = (faturamentoData.anterior || 0).toLocaleString('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});
    console.log("Faturamento do período anterior:", faturamento);
    return {
      title: "Faturamento do Período",
      value: faturamentoData.total || 0,
      subtitle: faturamentoData.message || "faturamento do período",
      icon: "heroicons-outline:currency-dollar",
      gradientColors: ["#cf20a3", "#c21474"] as [string, string],
      trend: {
        value: (
          <>
            {faturamentoData.percentageChange > 0 ? "+" : ""}
            {faturamentoData.percentageChange}% vs período anterior
            <br />
            {faturamentoData.periodoAnterior} = {faturamento}
          </>
        ),
        isPositive: faturamentoData.percentageChange >= 0,
      } as any,
      widgetId: 4,
    };
  }, [faturamentoData, theme]);

  if (isLoading) return <WidgetLoading height={160} />;
  if (!kpiData) return null;

  return (
    <Card
      elevation={3}
      sx={{
        height: "100%",
        p: 0,
        background: `linear-gradient(135deg, ${kpiData.gradientColors[0]} 0%, ${kpiData.gradientColors[1]} 100%)`,
        color: "white",
        position: "relative",
        overflow: "hidden",
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
            borderColor: "rgba(255,255,255,0.2)",
            bgcolor: "rgba(0,0,0,0.1)",
          }}
        >
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            variant="fullWidth"
            textColor="inherit"
            TabIndicatorProps={{ style: { backgroundColor: "white" } }}
            sx={{
              minHeight: 40,
              "& .MuiTab-root": {
                minHeight: 40,
                py: 0.5,
                fontSize: "1.0rem",
                color: "rgb(255, 255, 255)",
                "&.Mui-selected": { color: "white" },
              },
            }}
          >
            <Tab label="Por Vencimento" />
            <Tab label="Por Competência" />
          </Tabs>
        </Box>
      )}

      <Box
        sx={{
          flexGrow: 1,
          height: showInternalTabs ? "calc(100% - 40px)" : "100%",
          "& .MuiCard-root": {
            boxShadow: "none",
            background: "transparent",
            height: "100%",
          },
        }}
      >
        <KPICard
          {...kpiData}
          value={kpiData.value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
          showFilter={!startDate}
          filterDate={effectiveDate}
          onFilterChange={setSelectedDate}
        />
      </Box>
    </Card>
  );
}
