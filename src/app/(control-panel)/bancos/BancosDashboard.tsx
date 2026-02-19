'use client';

import { Box, Grid } from '@mui/material';
import { PageHeader } from '../../components/ui/PageHeader';
import { useUserFavoriteWidgets } from '../../hooks/useDashboard';
import WidgetLoading from '../../components/ui/WidgetLoading';
import useUser from '@auth/useUser';
import { FinancialEvolutionWidget } from '../../components/widgets/FinancialEvolutionWidget';

function BancosDashboard() {
  const { data: user } = useUser();
  const { data: favoriteWidgets, isLoading: isFavoritesLoading } = useUserFavoriteWidgets(
    user?.id ? Number(user.id) : undefined
  );

  return (
    <Box sx={{ width: '100%' }}>
      <PageHeader
        title="Bancos"
        subtitle="Evolução financeira por banco — recebimentos, pagamentos e saldo."
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
          </svg>
        }
      />

      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ height: 'calc(100vh - 200px)' }}>
        <Grid item xs={12} sx={{ height: '100%' }}>
          {isFavoritesLoading ? (
            <WidgetLoading height="100%" />
          ) : (
            <FinancialEvolutionWidget
              initialIsFavorite={favoriteWidgets?.some(w => w.dashboardWidgetId === 18 && w.isFavorite)}
            />
          )}
        </Grid>
      </Grid>
    </Box>
  );
}

export default BancosDashboard;
