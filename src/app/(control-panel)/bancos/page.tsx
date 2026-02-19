'use client';

import { styled } from '@mui/material/styles';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { Box } from '@mui/material';
import BancosDashboard from './BancosDashboard';
import ProjectDashboardAppHeader from '../painel/ProjectDashboardAppHeader';

const Root = styled(FusePageSimple)(({ theme }) => ({
  '& .FusePageSimple-header': {
    backgroundColor: theme.palette.background.default,
  },
  '& .FusePageSimple-content': {
    padding: 0
  }
}));

function BancosPage() {
  return (
    <Root
      scroll="content"
      header={<ProjectDashboardAppHeader pageTitle="Gestão de Bancos" />}
      content={
        <Box sx={{ width: '100%', px: { xs: 1.5, sm: 2.5, md: 3 }, py: { xs: 1.5, sm: 2, md: 3 }, minHeight: '100%' }}>
          <BancosDashboard />
        </Box>
      }
    />
  );
}

export default BancosPage;
