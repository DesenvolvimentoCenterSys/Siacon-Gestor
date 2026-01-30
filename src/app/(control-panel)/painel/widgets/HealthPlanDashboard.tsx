'use client';

import useUser from '@auth/useUser';
import { Box, Grid } from '@mui/material';
import { useAllWidgets } from '../../../hooks/useDashboard';
import { TotalVidasWidget } from '../../../components/widgets/TotalVidasWidget';
import { TotalEmpresasWidget } from '../../../components/widgets/TotalEmpresasWidget';

function HealthPlanDashboard() {
  const { data: user } = useUser();
  const { data: favoriteWidgets, isLoading: widgetsLoading } = useAllWidgets(
    user?.id ? Number(user.id) : undefined,
    undefined,
    true
  );
  return (
    <Box sx={{ width: '100%' }}>
      {/* KPI Cards */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 2, sm: 3 } }}>
        {widgetsLoading ? (
          <Box sx={{ p: 2 }}>Carregando favoritos...</Box>
        ) : (
          favoriteWidgets?.map((widget) => {
            // Map widget ID to component
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
            return null;
          })
        )}
      </Grid>

      {/* Charts Grid */}
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {/* Charts will be added here */}
      </Grid>
    </Box>
  );
}

export default HealthPlanDashboard;
