'use client';

import { Box, Grid, Typography } from '@mui/material';
import { PageHeader } from '../../components/ui/PageHeader';

function ConveniosDashboard() {
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

      {/* KPI Cards - Empty for now */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 2, sm: 3 } }}>
        {/* Cards will be added here */}
      </Grid>

      {/* Charts Grid - Empty for now */}
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {/* Charts will be added here */}
      </Grid>
    </Box>
  );
}

export default ConveniosDashboard;
