'use client';

import { Box, Grid, Typography } from '@mui/material';
import { useUserFavoriteWidgets } from '../../../hooks/useDashboard';
import WidgetLoading from '../../../components/ui/WidgetLoading';
import { TotalVidasWidget } from '../../../components/widgets/TotalVidasWidget';
import { TotalEmpresasWidget } from '../../../components/widgets/TotalEmpresasWidget';
import useUser from '@auth/useUser';

function ClientsDashboard() {
  const { data: user } = useUser();

  // Fetch user's favorite widgets
  const { data: favoriteWidgets, isLoading: isFavoritesLoading } = useUserFavoriteWidgets(user?.id ? Number(user.id) : undefined);

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" className="font-bold text-3xl tracking-tight">
          Visão geral da base de pessoas cadastrados
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 2, sm: 3 } }}>
        <Grid item xs={12} sm={6} md={3}>
          {isFavoritesLoading ? (
            <WidgetLoading height={160} />
          ) : (
            <TotalVidasWidget initialIsFavorite={favoriteWidgets?.some(w => w.dashboardWidgetId === 2 && w.isFavorite)} />
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {isFavoritesLoading ? (
            <WidgetLoading height={160} />
          ) : (
            <TotalEmpresasWidget initialIsFavorite={favoriteWidgets?.some(w => w.dashboardWidgetId === 3 && w.isFavorite)} />
          )}
        </Grid>
      </Grid>

      {/* Charts Grid - Empty for now */}
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {/* Charts will be added here */}
      </Grid>
    </Box>
  );
}

export default ClientsDashboard;
