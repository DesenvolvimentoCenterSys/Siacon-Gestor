'use client';

import { useState } from 'react';
import { styled } from '@mui/material/styles';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { Box, Grid, Tabs, Tab } from '@mui/material';
import ProjectDashboardAppHeader from '../painel/ProjectDashboardAppHeader';
import { PrevisaoFaturamentoVsPagamentoWidget } from '../../components/widgets/PrevisaoFaturamentoVsPagamentoWidget';
import { ResumoAnualFaturamentoVsPagamentoWidget } from '../../components/widgets/ResumoAnualFaturamentoVsPagamentoWidget';
import { PrevisaoFaturamentoPorPeriodoWidget } from '../../components/widgets/PrevisaoFaturamentoPorPeriodoWidget';

const Root = styled(FusePageSimple)(({ theme }) => ({
  '& .FusePageSimple-header': {
    backgroundColor: theme.palette.background.default,
  },
  '& .FusePageSimple-content': {
    padding: 0
  }
}));

function PrevisaoFaturamentoVsPagamentoPage() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Root
      scroll="content"
      header={<ProjectDashboardAppHeader pageTitle="Previsão Faturamento VS Pagamento" />}
      content={
        <Box sx={{ width: '100%', px: { xs: 1.5, sm: 2.5, md: 3 }, py: { xs: 1.5, sm: 2, md: 3 } }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              textColor="primary"
              indicatorColor="primary"
            >
              <Tab label="Por Ano" sx={{ textTransform: 'none', fontWeight: 600 }} />
              <Tab label="Por Período" sx={{ textTransform: 'none', fontWeight: 600 }} />
            </Tabs>
          </Box>

          {activeTab === 0 && (
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              <Grid item xs={12}>
                <ResumoAnualFaturamentoVsPagamentoWidget />
              </Grid>
              <Grid item xs={12}>
                <PrevisaoFaturamentoVsPagamentoWidget />
              </Grid>
            </Grid>
          )}

          {activeTab === 1 && (
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              <Grid item xs={12}>
                <PrevisaoFaturamentoPorPeriodoWidget />
              </Grid>
            </Grid>
          )}
        </Box>
      }
    />
  );
}

export default PrevisaoFaturamentoVsPagamentoPage;
