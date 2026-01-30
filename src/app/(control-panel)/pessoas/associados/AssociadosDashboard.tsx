import { Box, Grid, Typography } from '@mui/material';
import { TotalFiliadosWidget } from '../../../components/widgets/TotalFiliadosWidget';

function AssociadosDashboard() {
  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
        Visão Geral de Associados
      </Typography>

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {/* Total Filiados Widget */}
        <Grid item xs={12} md={6}>
          <TotalFiliadosWidget />
        </Grid>
      </Grid>
    </Box>
  );
}

export default AssociadosDashboard;
