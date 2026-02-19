'use client';

import { Box, Grid, Typography } from '@mui/material';
import { PageHeader } from '../../components/ui/PageHeader';
import { useUserFavoriteWidgets } from '../../hooks/useDashboard';
import WidgetLoading from '../../components/ui/WidgetLoading';
import useUser from '@auth/useUser';
import { FaturamentoMensalWidget } from '../../components/widgets/FaturamentoMensalWidget';
import { MensalidadeMediaWidget } from '../../components/widgets/MensalidadeMediaWidget';
import { EvolucaoFaturamentoChartWidget } from '../../components/widgets/EvolucaoFaturamentoChartWidget';
import { FaturamentoPorConvenioChartWidget } from '../../components/widgets/FaturamentoPorConvenioChartWidget';
import { TotalFaturamentoPorConvenioWidget } from '../../components/widgets/TotalFaturamentoPorConvenioWidget';

function FinancialDashboard() {
  const { data: user } = useUser();

  // Fetch user's favorite widgets
  const { data: favoriteWidgets, isLoading: isFavoritesLoading } = useUserFavoriteWidgets(user?.id ? Number(user.id) : undefined);

  return (
    <Box sx={{ width: '100%' }}>
      <PageHeader
        title="Financeiro"
        subtitle="Acompanhamento detalhado de receitas, despesas e previsões orçamentárias."
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        }
      />

      {/* KPI Cards */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 2, sm: 3 } }}>
        <Grid item xs={12} sm={6} md={3}>
          {isFavoritesLoading ? (
            <WidgetLoading height={160} />
          ) : (
            <FaturamentoMensalWidget initialIsFavorite={favoriteWidgets?.some(w => w.dashboardWidgetId === 4 && w.isFavorite)} />
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {isFavoritesLoading ? (
            <WidgetLoading height={160} />
          ) : (
            <MensalidadeMediaWidget initialIsFavorite={favoriteWidgets?.some(w => w.dashboardWidgetId === 6 && w.isFavorite)} />
          )}
        </Grid>
      </Grid>

      {/* Charts Grid */}
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        <Grid item xs={12} md={6}>
          {isFavoritesLoading ? (
            <WidgetLoading height={350} />
          ) : (
            <EvolucaoFaturamentoChartWidget initialIsFavorite={favoriteWidgets?.some(w => w.dashboardWidgetId === 7 && w.isFavorite)} />
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          {isFavoritesLoading ? (
            <WidgetLoading height={350} />
          ) : (
            <FaturamentoPorConvenioChartWidget initialIsFavorite={favoriteWidgets?.some(w => w.dashboardWidgetId === 9 && w.isFavorite)} />
          )}
        </Grid>
      </Grid>

      {/* Detailed Billing Table */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mt: { xs: 2.5, sm: 3 } }}>
        <Grid item xs={12}>
          {isFavoritesLoading ? (
            <WidgetLoading height={400} />
          ) : (
            <TotalFaturamentoPorConvenioWidget initialIsFavorite={favoriteWidgets?.some(w => w.dashboardWidgetId === 15 && w.isFavorite)} />
          )}
        </Grid>
      </Grid>
    </Box>
  );
}

export default FinancialDashboard;
