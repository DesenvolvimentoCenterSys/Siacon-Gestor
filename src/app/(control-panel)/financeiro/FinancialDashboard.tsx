"use client";

import { useMemo } from "react";
import { Box, Grid } from "@mui/material";
import { format } from "date-fns";
import { 
  useUserFavoriteWidgets, 
  useFaturamentoDetalhadoConvenio 
} from "../../hooks/useDashboard";
import WidgetLoading from "../../components/ui/WidgetLoading";
import useUser from "@auth/useUser";
import { useDateFilter, ConvenioOption } from "../../hooks/useDateFilter";
import { DateRangeFilterWidget } from "../../components/widgets/DateRangeFilterWidget";
import { FaturamentoMensalWidget } from "../../components/widgets/FaturamentoMensalWidget";
import { MensalidadeMediaWidget } from "../../components/widgets/MensalidadeMediaWidget";
import { TotalFaturamentoPorConvenioWidget } from "../../components/widgets/TotalFaturamentoPorConvenioWidget";
import { FaturamentoPorConvenioDonutWidget } from "../../components/widgets/FaturamentoPorConvenioDonutWidget";

function FinancialDashboard() {
  const { data: user } = useUser();
  const dateFilter = useDateFilter();

  const { data: favoriteWidgets, isLoading: isFavoritesLoading } =
    useUserFavoriteWidgets(user?.id ? Number(user.id) : undefined);

  const conveniosIds = useMemo(() => 
    dateFilter.convenios.map((item) => Number(item.id)).filter((id) => !Number.isNaN(id)),
    [dateFilter.convenios]
  );

  const operadorasIds = useMemo(() => 
    dateFilter.operadoras.map((item) => Number(item.id)).filter((id) => !Number.isNaN(id)),
    [dateFilter.operadoras]
  );

  const startStr = dateFilter.startDate ? format(dateFilter.startDate, "yyyy-MM-dd") : undefined;
  const endStr = dateFilter.endDate ? format(dateFilter.endDate, "yyyy-MM-dd") : undefined;
  const searchBy = dateFilter.tab === "competencia" ? "C" : "V";

  const { 
    data: faturamentoConveniosData, 
    isLoading: isLoadingFaturamentoConvenios,
    isError: isErrorFaturamentoConvenios 
  } = useFaturamentoDetalhadoConvenio(
    startStr,
    endStr,
    searchBy,
    conveniosIds,
    operadorasIds
  );

  const filterProps = useMemo(() => ({
    startDate: dateFilter.startDate,
    endDate: dateFilter.endDate,
    tab: dateFilter.tab,
    convenios: conveniosIds,
    operadoras: operadorasIds
  }), [
    dateFilter.startDate, 
    dateFilter.endDate, 
    dateFilter.tab, 
    conveniosIds, 
    operadorasIds
  ]);

  return (
    <Box sx={{ width: "100%" }}>
      <DateRangeFilterWidget
        startDate={dateFilter.startDate}
        endDate={dateFilter.endDate}
        tab={dateFilter.tab}
        convenios={dateFilter.convenios}
        operadoras={dateFilter.operadoras}
        setStartDate={dateFilter.setStartDate}
        setEndDate={dateFilter.setEndDate}
        setTab={dateFilter.setTab}
        setConvenios={dateFilter.setConvenios}
        setOperadoras={dateFilter.setOperadoras}
        reset={dateFilter.reset}
      />

      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 2, sm: 3 } }} alignItems="stretch">
        <Grid item xs={12} md={4}>
          <Box sx={{ height: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
            {isFavoritesLoading ? <WidgetLoading height={160} /> : <FaturamentoMensalWidget {...filterProps} />}
            {isFavoritesLoading ? <WidgetLoading height={160} /> : <MensalidadeMediaWidget {...filterProps} />}
          </Box>
        </Grid>
        <Grid item xs={12} md={8}>
          <Box sx={{ height: "100%", minHeight: 340 }}>
            {isFavoritesLoading ? (
              <WidgetLoading height="100%" /> 
            ) : (
              <FaturamentoPorConvenioDonutWidget 
                data={faturamentoConveniosData}
                isLoading={isLoadingFaturamentoConvenios}
                isError={isErrorFaturamentoConvenios}
              />
            )}
          </Box>
        </Grid>
      </Grid>

      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mt: { xs: 2.5, sm: 3 } }}>
        <Grid item xs={12} md={12}>
          {isFavoritesLoading ? (
            <WidgetLoading height={400} />
          ) : (
            <TotalFaturamentoPorConvenioWidget
              data={faturamentoConveniosData}
              isLoading={isLoadingFaturamentoConvenios}
              startDate={dateFilter.startDate}
              endDate={dateFilter.endDate}
              tab={dateFilter.tab}
              initialIsFavorite={favoriteWidgets?.some((w) => w.dashboardWidgetId === 15 && w.isFavorite)}
            />
          )}
        </Grid>
      </Grid>
    </Box>
  );
}

export default FinancialDashboard;