'use client';

import { styled } from '@mui/material/styles';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { Box } from '@mui/material';
import ClientsDashboard from './ClientsDashboard';
import ProjectDashboardAppHeader from '../../painel/ProjectDashboardAppHeader';

const Root = styled(FusePageSimple)(({ theme }) => ({
  '& .FusePageSimple-header': {
    backgroundColor: theme.palette.background.default,
  },
  '& .FusePageSimple-content': {
    padding: 0
  }
}));

function ClientsPage() {
  return (
    <Root
      scroll="content"
      header={<ProjectDashboardAppHeader pageTitle="Gestão de pessoas" />}
      content={
        <Box sx={{ width: '100%', px: { xs: 1.5, sm: 2.5, md: 3 }, py: { xs: 1.5, sm: 2, md: 3 } }}>
          <ClientsDashboard />
        </Box>
      }
    />
  );
}

export default ClientsPage;
