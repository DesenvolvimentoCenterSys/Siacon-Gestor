'use client';

import { Box, Grid, Typography } from '@mui/material';
import { PageHeader } from '../../components/ui/PageHeader';
import { useUserFavoriteWidgets } from '../../hooks/useDashboard';
import WidgetLoading from '../../components/ui/WidgetLoading';
import useUser from '@auth/useUser';
import { TaxaUtilizacaoWidget } from '../../components/widgets/TaxaUtilizacaoWidget';
import { DependentesTitularesWidget } from '../../components/widgets/DependentesTitularesWidget';

function ConveniosDashboard() {
  const { data: user } = useUser();

  // Fetch user's favorite widgets
  const { data: favoriteWidgets, isLoading: isFavoritesLoading } = useUserFavoriteWidgets(user?.id ? Number(user.id) : undefined);
  return (
    <Box sx={{ width: '100%' }}>
      <PageHeader
        title="Convênios e Operadoras"
        subtitle="Análise detalhada de performance por operadora e gestão de contratos."
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
          </svg>
        }
      />

      {/* KPI Cards */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 2, sm: 3 } }}>
        <Grid item xs={12} sm={6} md={3}>
          {isFavoritesLoading ? (
            <WidgetLoading height={160} />
          ) : (
            <TaxaUtilizacaoWidget initialIsFavorite={favoriteWidgets?.some(w => w.dashboardWidgetId === 5 && w.isFavorite)} />
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {isFavoritesLoading ? (
            <WidgetLoading height={160} />
          ) : (
            <DependentesTitularesWidget initialIsFavorite={favoriteWidgets?.some(w => w.dashboardWidgetId === 11 && w.isFavorite)} />
          )}
        </Grid>
      </Grid>

      {/* Other Widgets */}


      {/* Charts Grid - Empty for now */}
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {/* Charts will be added here */}
      </Grid>
    </Box>
  );
}

export default ConveniosDashboard;
