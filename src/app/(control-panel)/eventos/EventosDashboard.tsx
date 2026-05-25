'use client';

import { Box, Grid, Typography } from '@mui/material';
import { PageHeader } from '../../components/ui/PageHeader';
import { useUserFavoriteWidgets } from '../../hooks/useDashboard';
import WidgetLoading from '../../components/ui/WidgetLoading';
import useUser from '@auth/useUser';
import { EventAnalyticsWidget } from '../../components/widgets/EventAnalyticsWidget';

function EventosDashboard() {
  const { data: user } = useUser();


  return (
    <Box sx={{ width: '100%' }}>
      {/* Main Widget Grid */}
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        <Grid item xs={12}>
            <EventAnalyticsWidget/>
        </Grid>
      </Grid>
    </Box>
  );
}

export default EventosDashboard;
