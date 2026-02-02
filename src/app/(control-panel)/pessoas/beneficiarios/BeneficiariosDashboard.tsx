import { Box, Grid } from '@mui/material';
import { VidasPorConvenioWidget } from '../../../components/widgets/VidasPorConvenioWidget';

export default function BeneficiariosDashboard() {
  return (
    <Box className="w-full p-6">
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <VidasPorConvenioWidget />
        </Grid>
      </Grid>
    </Box>
  );
}
