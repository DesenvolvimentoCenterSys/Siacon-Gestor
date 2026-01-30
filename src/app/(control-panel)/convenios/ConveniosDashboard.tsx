'use client';

import { Box, Grid, Typography } from '@mui/material';

function ConveniosDashboard() {
  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" className="font-bold text-3xl tracking-tight">
          Análise detalhada por operadora
        </Typography>
      </Box>

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
