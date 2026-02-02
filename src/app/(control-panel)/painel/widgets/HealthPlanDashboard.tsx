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

  const kpiWidgetIds = [2, 3, 4, 13];
  const chartWidgetIds = [8, 10, 24, 14];

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
            return null;
          })}
        </Grid>
      )}

      {/* Charts Grid - Always 2 per row */}
      {chartWidgets.length > 0 && (
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {chartWidgets.map((widget) => {
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
                <Grid item xs={12} md={6} key={widget.id}>
                  <Suspense fallback={<WidgetLoader height={400} />}>
                    <TotalFiliadosWidget initialIsFavorite={widget.isFavorite} />
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
