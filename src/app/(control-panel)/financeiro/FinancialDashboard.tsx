"use client";

import { useMemo } from "react";
import { Box, Grid } from "@mui/material";
import { PageHeader } from "../../components/ui/PageHeader";
import { useUserFavoriteWidgets } from "../../hooks/useDashboard";
import WidgetLoading from "../../components/ui/WidgetLoading";
import useUser from "@auth/useUser";
import { useDateFilter } from "../../hooks/useDateFilter";
import { DateRangeFilterWidget } from "../../components/widgets/DateRangeFilterWidget";
import { FaturamentoMensalWidget } from "../../components/widgets/FaturamentoMensalWidget";
import { MensalidadeMediaWidget } from "../../components/widgets/MensalidadeMediaWidget";
import { ResultadoFinanceiroWidget } from "../../components/widgets/ResultadoFinanceiroWidget";
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

  const servicosIds = useMemo(() => 
    dateFilter.servicos.map((item) => Number(item.id)).filter((id) => !Number.isNaN(id)),
    [dateFilter.servicos]
  );

  const centrosCustoIds = useMemo(() => 
    dateFilter.centrosCusto.map((item) => Number(item.id)).filter((id) => !Number.isNaN(id)),
    [dateFilter.centrosCusto]
  );

  const planosContasIds = useMemo(() => 
    dateFilter.planosContas.map((item) => Number(item.id)).filter((id) => !Number.isNaN(id)),
    [dateFilter.planosContas]
  );


  const filterProps = useMemo(() => ({
    startDate: dateFilter.startDate,
    endDate: dateFilter.endDate,
    tab: dateFilter.tab,
    convenios: conveniosIds,
    servicos: servicosIds,
    centrosCusto: centrosCustoIds,
    planosContas: planosContasIds,
  }), [
    dateFilter.startDate, 
    dateFilter.endDate, 
    dateFilter.tab, 
    conveniosIds, 
    servicosIds, 
    centrosCustoIds, 
    planosContasIds
  ]);

  return (
    <Box sx={{ width: "100%" }}>
      <DateRangeFilterWidget
        startDate={dateFilter.startDate}
        endDate={dateFilter.endDate}
        tab={dateFilter.tab}
        convenios={dateFilter.convenios}
        servicos={dateFilter.servicos}
        centrosCusto={dateFilter.centrosCusto}
        planosContas={dateFilter.planosContas}
        setStartDate={dateFilter.setStartDate}
        setEndDate={dateFilter.setEndDate}
        setTab={dateFilter.setTab}
        setConvenios={dateFilter.setConvenios}
        setServicos={dateFilter.setServicos}
        setCentrosCusto={dateFilter.setCentrosCusto}
        setPlanosContas={dateFilter.setPlanosContas}
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
            {isFavoritesLoading ? <WidgetLoading height="100%" /> : <FaturamentoPorConvenioDonutWidget {...filterProps} />}
          </Box>
        </Grid>
      </Grid>


      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mt: { xs: 2.5, sm: 3 } }}>
        <Grid item xs={12} md={12}>
          {isFavoritesLoading ? (
            <WidgetLoading height={400} />
          ) : (
            <TotalFaturamentoPorConvenioWidget
              {...filterProps}
              initialIsFavorite={favoriteWidgets?.some((w) => w.dashboardWidgetId === 15 && w.isFavorite)}
            />
          )}
        </Grid>
      </Grid>
    </Box>
  );
}

export default FinancialDashboard;