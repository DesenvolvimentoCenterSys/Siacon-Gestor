'use client';

import useUser from '@auth/useUser';
import { Box, Grid } from '@mui/material';
import { useAllWidgets } from '../../../hooks/useDashboard';
import { TotalVidasWidget } from '../../../components/widgets/TotalVidasWidget';
import { TotalEmpresasWidget } from '../../../components/widgets/TotalEmpresasWidget';
import { TotalCpfWidget } from '../../../components/widgets/TotalCpfWidget';
import { AgeGroupChartWidget } from '../../../components/widgets/AgeGroupChartWidget';
import { GenderDonutChartWidget } from '../../../components/widgets/GenderDonutChartWidget';
import { NovasVidasWidget } from '../../../components/widgets/NovasVidasWidget';
import FuseLoading from '@fuse/core/FuseLoading';


function HealthPlanDashboard() {
  const { data: user } = useUser();
  const { data: favoriteWidgets, isLoading: widgetsLoading } = useAllWidgets(
    user?.id ? Number(user.id) : undefined,
    undefined,
    true
  );

  const kpiWidgetIds = [2, 3, 4, 12];
  const chartWidgetIds = [8, 24];

  const kpiWidgets = favoriteWidgets?.filter(w => kpiWidgetIds.includes(w.dashboardWidgetId)) || [];
  const chartWidgets = favoriteWidgets?.filter(w => chartWidgetIds.includes(w.dashboardWidgetId)) || [];

  return (
    <Box sx={{ width: '100%' }}>
      {/* KPI Cards Grid - Always 4 per row */}
      {kpiWidgets.length > 0 && (
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 2, sm: 3 } }}>
          {kpiWidgets.map((widget) => {
            if (widget.dashboardWidgetId === 2) {
              return (
                <Grid item xs={12} sm={6} md={3} key={widget.id}>
                  <TotalVidasWidget initialIsFavorite={widget.isFavorite} />
                </Grid>
              );
            }
            if (widget.dashboardWidgetId === 3) {
              return (
                <Grid item xs={12} sm={6} md={3} key={widget.id}>
                  <TotalEmpresasWidget initialIsFavorite={widget.isFavorite} />
                </Grid>
              );
            }
            if (widget.dashboardWidgetId === 4) {
              return (
                <Grid item xs={12} sm={6} md={3} key={widget.id}>
                  <TotalCpfWidget initialIsFavorite={widget.isFavorite} />
                </Grid>
              );
            }
            if (widget.dashboardWidgetId === 12) {
              return (
                <Grid item xs={12} sm={6} md={3} key={widget.id}>
                  <NovasVidasWidget initialIsFavorite={widget.isFavorite} />
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
                  <AgeGroupChartWidget initialIsFavorite={widget.isFavorite} />
                </Grid>
              );
            }
            if (widget.dashboardWidgetId === 24) {
              return (
                <Grid item xs={12} md={6} key={widget.id}>
                  <GenderDonutChartWidget initialIsFavorite={widget.isFavorite} />
                </Grid>
              );
            }
            return null;
          })}
        </Grid>
      )}

      {widgetsLoading && (
        <Box sx={{ p: 5, display: 'flex', justifyContent: 'center' }}>
          <FuseLoading />
        </Box>
      )}
    </Box>
  );
}

export default HealthPlanDashboard;
