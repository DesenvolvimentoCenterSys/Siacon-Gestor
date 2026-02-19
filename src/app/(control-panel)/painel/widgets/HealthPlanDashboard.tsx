'use client';

import useUser from '@auth/useUser';
import { Box, Grid, CircularProgress, Card, CardContent } from '@mui/material';
import { useAllWidgets } from '../../../hooks/useDashboard';
import { TotalVidasWidget } from '../../../components/widgets/TotalVidasWidget';
import { TotalEmpresasWidget } from '../../../components/widgets/TotalEmpresasWidget';
import { TotalCpfWidget } from '../../../components/widgets/TotalCpfWidget';
import { AgeGroupChartWidget } from '../../../components/widgets/AgeGroupChartWidget';
import { GenderDonutChartWidget } from '../../../components/widgets/GenderDonutChartWidget';
import { NovasVidasWidget } from '../../../components/widgets/NovasVidasWidget';
import { VidasPorConvenioWidget } from '../../../components/widgets/VidasPorConvenioWidget';
import { TotalFiliadosWidget } from '../../../components/widgets/TotalFiliadosWidget';
import { FaturamentoMensalWidget } from '../../../components/widgets/FaturamentoMensalWidget';
import { TaxaUtilizacaoWidget } from '../../../components/widgets/TaxaUtilizacaoWidget';
import { MensalidadeMediaWidget } from '../../../components/widgets/MensalidadeMediaWidget';
import { TotalFaturamentoPorConvenioWidget } from '../../../components/widgets/TotalFaturamentoPorConvenioWidget';
import { EventAnalyticsWidget } from '../../../components/widgets/EventAnalyticsWidget';
import { CashFlowEvolutionWidget } from '../../../components/widgets/CashFlowEvolutionWidget';
import { EvolucaoFaturamentoChartWidget } from '../../../components/widgets/EvolucaoFaturamentoChartWidget';
import { FaturamentoPorConvenioChartWidget } from '../../../components/widgets/FaturamentoPorConvenioChartWidget';
import { TotalUsuariosConvenioWidget } from '../../../components/widgets/TotalUsuariosConvenioWidget';
import { DependentesTitularesWidget } from '../../../components/widgets/DependentesTitularesWidget';
import { Suspense } from 'react';

// Loading component for individual widgets
function WidgetLoader({ height = 200 }: { height?: number }) {
  return (
    <Card sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <CardContent>
        <CircularProgress size={40} />
      </CardContent>
    </Card>
  );
}

function HealthPlanDashboard() {
  const { data: user } = useUser();
  const { data: favoriteWidgets, isLoading: widgetsLoading } = useAllWidgets(
    user?.id ? Number(user.id) : undefined,
    undefined,
    true
  );

  const kpiWidgetIds = [2, 3, 4, 5, 6, 13, 23, 11];
  const chartWidgetIds = [7, 9, 8, 10, 24, 14, 15, 16, 17];

  const kpiWidgets = favoriteWidgets?.filter(w => kpiWidgetIds.includes(w.dashboardWidgetId)) || [];
  const chartWidgets = favoriteWidgets?.filter(w => chartWidgetIds.includes(w.dashboardWidgetId)) || [];

  // Show loading spinner while fetching favorite widgets configuration
  if (widgetsLoading) {
    return (
      <Box sx={{ p: 5, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* KPI Cards Grid - Always 4 per row */}
      {kpiWidgets.length > 0 && (
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 2, sm: 3 } }}>
          {kpiWidgets.map((widget) => {
            if (widget.dashboardWidgetId === 2) {
              return (
                <Grid item xs={12} sm={6} md={3} key={widget.id}>
                  <Suspense fallback={<WidgetLoader height={150} />}>
                    <TotalVidasWidget initialIsFavorite={widget.isFavorite} />
                  </Suspense>
                </Grid>
              );
            }
            if (widget.dashboardWidgetId === 3) {
              return (
                <Grid item xs={12} sm={6} md={3} key={widget.id}>
                  <Suspense fallback={<WidgetLoader height={150} />}>
                    <TotalEmpresasWidget initialIsFavorite={widget.isFavorite} />
                  </Suspense>
                </Grid>
              );
            }
            if (widget.dashboardWidgetId === 4) {
              return (
                <Grid item xs={12} sm={6} md={3} key={widget.id}>
                  <Suspense fallback={<WidgetLoader height={150} />}>
                    <FaturamentoMensalWidget initialIsFavorite={widget.isFavorite} />
                  </Suspense>
                </Grid>
              );
            }
            if (widget.dashboardWidgetId === 5) {
              return (
                <Grid item xs={12} sm={6} md={3} key={widget.id}>
                  <Suspense fallback={<WidgetLoader height={150} />}>
                    <TaxaUtilizacaoWidget initialIsFavorite={widget.isFavorite} />
                  </Suspense>
                </Grid>
              );
            }
            if (widget.dashboardWidgetId === 6) {
              return (
                <Grid item xs={12} sm={6} md={3} key={widget.id}>
                  <Suspense fallback={<WidgetLoader height={150} />}>
                    <MensalidadeMediaWidget initialIsFavorite={widget.isFavorite} />
                  </Suspense>
                </Grid>
              );
            }
            if (widget.dashboardWidgetId === 23) {
              return (
                <Grid item xs={12} sm={6} md={3} key={widget.id}>
                  <Suspense fallback={<WidgetLoader height={150} />}>
                    <TotalCpfWidget initialIsFavorite={widget.isFavorite} />
                  </Suspense>
                </Grid>
              );
            }
            if (widget.dashboardWidgetId === 13) {
              return (
                <Grid item xs={12} sm={6} md={3} key={widget.id}>
                  <Suspense fallback={<WidgetLoader height={150} />}>
                    <NovasVidasWidget initialIsFavorite={widget.isFavorite} />
                  </Suspense>
                </Grid>
              );
            }
            if (widget.dashboardWidgetId === 11) {
              return (
                <Grid item xs={12} sm={6} md={3} key={widget.id}>
                  <Suspense fallback={<WidgetLoader height={160} />}>
                    <DependentesTitularesWidget initialIsFavorite={widget.isFavorite} />
                  </Suspense>
                </Grid>
              );
            }
            return null;
          })}
        </Grid>
      )}

      {/* Charts Grid - Always 2 per row */}
      {chartWidgets.length > 0 && (
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {chartWidgets.map((widget) => {
            if (widget.dashboardWidgetId === 7) {
              return (
                <Grid item xs={12} md={6} key={widget.id}>
                  <Suspense fallback={<WidgetLoader height={400} />}>
                    <EvolucaoFaturamentoChartWidget initialIsFavorite={widget.isFavorite} />
                  </Suspense>
                </Grid>
              );
            }
            if (widget.dashboardWidgetId === 9) {
              return (
                <Grid item xs={12} md={6} key={widget.id}>
                  <Suspense fallback={<WidgetLoader height={400} />}>
                    <FaturamentoPorConvenioChartWidget initialIsFavorite={widget.isFavorite} />
                  </Suspense>
                </Grid>
              );
            }
            if (widget.dashboardWidgetId === 8) {
              return (
                <Grid item xs={12} md={6} key={widget.id}>
                  <Suspense fallback={<WidgetLoader height={400} />}>
                    <AgeGroupChartWidget initialIsFavorite={widget.isFavorite} />
                  </Suspense>
                </Grid>
              );
            }
            if (widget.dashboardWidgetId === 24) {
              return (
                <Grid item xs={12} md={6} key={widget.id}>
                  <Suspense fallback={<WidgetLoader height={400} />}>
                    <GenderDonutChartWidget initialIsFavorite={widget.isFavorite} />
                  </Suspense>
                </Grid>
              );
            }
            if (widget.dashboardWidgetId === 10) {
              return (
                <Grid item xs={12} md={6} key={widget.id}>
                  <Suspense fallback={<WidgetLoader height={400} />}>
                    <VidasPorConvenioWidget initialIsFavorite={widget.isFavorite} />
                  </Suspense>
                </Grid>
              );
            }
            if (widget.dashboardWidgetId === 14) {
              return (
                <Grid item xs={12} md={12} key={widget.id}>
                  <Suspense fallback={<WidgetLoader height={400} />}>
                    <TotalUsuariosConvenioWidget initialIsFavorite={widget.isFavorite} />
                  </Suspense>
                </Grid>
              );
            }
            if (widget.dashboardWidgetId === 15) {
              return (
                <Grid item xs={12} md={12} key={widget.id}>
                  <Suspense fallback={<WidgetLoader height={400} />}>
                    <TotalFaturamentoPorConvenioWidget initialIsFavorite={widget.isFavorite} />
                  </Suspense>
                </Grid>
              );
            }
            if (widget.dashboardWidgetId === 16) {
              return (
                <Grid item xs={12} md={12} key={widget.id}>
                  <Suspense fallback={<WidgetLoader height={400} />}>
                    <EventAnalyticsWidget initialIsFavorite={widget.isFavorite} />
                  </Suspense>
                </Grid>
              );
            }
            if (widget.dashboardWidgetId === 17) {
              return (
                <Grid item xs={12} md={12} key={widget.id}>
                  <Suspense fallback={<WidgetLoader height={500} />}>
                    <CashFlowEvolutionWidget initialIsFavorite={widget.isFavorite} />
                  </Suspense>
                </Grid>
              );
            }
            return null;
          })}
        </Grid>
      )}
    </Box>
  );
}

export default HealthPlanDashboard;
