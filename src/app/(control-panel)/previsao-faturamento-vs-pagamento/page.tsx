'use client';

import { styled } from '@mui/material/styles';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { Box, Grid } from '@mui/material';
import ProjectDashboardAppHeader from '../painel/ProjectDashboardAppHeader';
import { PrevisaoFaturamentoVsPagamentoWidget } from '../../components/widgets/PrevisaoFaturamentoVsPagamentoWidget';
import { ResumoAnualFaturamentoVsPagamentoWidget } from '../../components/widgets/ResumoAnualFaturamentoVsPagamentoWidget';

const Root = styled(FusePageSimple)(({ theme }) => ({
  '& .FusePageSimple-header': {
    backgroundColor: theme.palette.background.default,
  },
  '& .FusePageSimple-content': {
    padding: 0
  }
}));

function PrevisaoFaturamentoVsPagamentoPage() {
  return (
    <Root
      scroll="content"
      header={<ProjectDashboardAppHeader pageTitle="Previsão Faturamento VS Pagamento" />}
      content={
        <Box sx={{ width: '100%', px: { xs: 1.5, sm: 2.5, md: 3 }, py: { xs: 1.5, sm: 2, md: 3 } }}>
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            <Grid item xs={12}>
              <ResumoAnualFaturamentoVsPagamentoWidget />
            </Grid>
            <Grid item xs={12}>
              <PrevisaoFaturamentoVsPagamentoWidget />
            </Grid>
          </Grid>
        </Box>
      }
    />
  );
}

export default PrevisaoFaturamentoVsPagamentoPage;
