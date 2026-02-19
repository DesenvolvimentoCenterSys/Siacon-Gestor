'use client';

import { Box, Grid, Typography } from '@mui/material';
import { PageHeader } from '../../components/ui/PageHeader';
import { useUserFavoriteWidgets } from '../../hooks/useDashboard';
import WidgetLoading from '../../components/ui/WidgetLoading';
import useUser from '@auth/useUser';
import { EventAnalyticsWidget } from '../../components/widgets/EventAnalyticsWidget';

function EventosDashboard() {
  const { data: user } = useUser();

  // Fetch user's favorite widgets
  const { data: favoriteWidgets, isLoading: isFavoritesLoading } = useUserFavoriteWidgets(user?.id ? Number(user.id) : undefined);

  return (
    <Box sx={{ width: '100%' }}>
      <PageHeader
        title="Eventos"
        subtitle="Análise financeira e de performance dos eventos."
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
          </svg>
        }
      />

      {/* Main Widget Grid */}
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        <Grid item xs={12}>
          {isFavoritesLoading ? (
            <WidgetLoading height={400} />
          ) : (
            <EventAnalyticsWidget initialIsFavorite={favoriteWidgets?.some(w => w.dashboardWidgetId === 16 && w.isFavorite)} />
          )}
        </Grid>
      </Grid>
    </Box>
  );
}

export default EventosDashboard;
