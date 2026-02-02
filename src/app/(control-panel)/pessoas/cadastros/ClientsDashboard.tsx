'use client';

import { Box, Grid, Typography } from '@mui/material';
import { useUserFavoriteWidgets } from '../../../hooks/useDashboard';
import WidgetLoading from '../../../components/ui/WidgetLoading';
import { PageHeader } from '../../../components/ui/PageHeader';
import { TotalVidasWidget } from '../../../components/widgets/TotalVidasWidget';
import { TotalEmpresasWidget } from '../../../components/widgets/TotalEmpresasWidget';
import { TotalCpfWidget } from '../../../components/widgets/TotalCpfWidget';
import useUser from '@auth/useUser';
import { AgeGroupChartWidget } from '../../../components/widgets/AgeGroupChartWidget';
import { GenderDonutChartWidget } from '../../../components/widgets/GenderDonutChartWidget';
import { NovasVidasWidget } from '../../../components/widgets/NovasVidasWidget';


function ClientsDashboard() {
  const { data: user } = useUser();

  // Fetch user's favorite widgets
  const { data: favoriteWidgets, isLoading: isFavoritesLoading } = useUserFavoriteWidgets(user?.id ? Number(user.id) : undefined);

  return (
    <Box sx={{ width: '100%' }}>
      <PageHeader
        title="Visão Geral da Base de Pessoas"
        subtitle="Acompanhe os principais indicadores de cadastro da sua base."
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
        }
      />

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
        <Grid item xs={12} sm={6} md={3}>
          {isFavoritesLoading ? (
            <WidgetLoading height={160} />
          ) : (
            <TotalCpfWidget initialIsFavorite={favoriteWidgets?.some(w => w.dashboardWidgetId === 4 && w.isFavorite)} />
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {isFavoritesLoading ? (
            <WidgetLoading height={160} />
          ) : (
            <NovasVidasWidget initialIsFavorite={favoriteWidgets?.some(w => w.dashboardWidgetId === 13 && w.isFavorite)} />
          )}
        </Grid>

      </Grid>



      {/* Charts Grid */}
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        <Grid item xs={12} md={6}>
          {isFavoritesLoading ? (
            <WidgetLoading height={400} />
          ) : (
            <AgeGroupChartWidget initialIsFavorite={favoriteWidgets?.some(w => w.dashboardWidgetId === 8 && w.isFavorite)} />
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          {isFavoritesLoading ? (
            <WidgetLoading height={400} />
          ) : (
            <GenderDonutChartWidget initialIsFavorite={favoriteWidgets?.some(w => w.dashboardWidgetId === 24 && w.isFavorite)} />
          )}
        </Grid>
      </Grid>
    </Box >
  );
}

export default ClientsDashboard;
