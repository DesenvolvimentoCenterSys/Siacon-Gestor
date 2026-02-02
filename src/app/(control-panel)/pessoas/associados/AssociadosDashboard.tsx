import { Box, Grid, Typography } from '@mui/material';
import { TotalFiliadosWidget } from '../../../components/widgets/TotalFiliadosWidget';
import useUser from '@auth/useUser';
import { useUserFavoriteWidgets } from '../../../hooks/useDashboard';
import WidgetLoading from '../../../components/ui/WidgetLoading';

function AssociadosDashboard() {
  const { data: user } = useUser();
  const { data: favoriteWidgets, isLoading: isFavoritesLoading } = useUserFavoriteWidgets(user?.id ? Number(user.id) : undefined);

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
        Visão Geral de Associados
      </Typography>

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {/* Total Filiados Widget */}
        <Grid item xs={12} md={6}>
          {isFavoritesLoading ? (
            <WidgetLoading height={400} />
          ) : (
            <TotalFiliadosWidget initialIsFavorite={favoriteWidgets?.some(w => w.dashboardWidgetId === 14 && w.isFavorite)} />
          )}
        </Grid>
      </Grid>
    </Box>
  );
}

export default AssociadosDashboard;
