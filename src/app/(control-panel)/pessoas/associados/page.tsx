'use client';

import { styled } from '@mui/material/styles';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { Box } from '@mui/material';
import AssociadosDashboard from './AssociadosDashboard';
import ProjectDashboardAppHeader from '../../painel/ProjectDashboardAppHeader';

const Root = styled(FusePageSimple)(({ theme }) => ({
  '& .FusePageSimple-header': {
    backgroundColor: theme.palette.background.default,
  },
  '& .FusePageSimple-content': {
    padding: 0
  }
}));

function AssociadosPage() {
  return (
    <Root
      scroll="content"
      header={<ProjectDashboardAppHeader pageTitle="Associados/Filiados" />}
      content={
        <Box sx={{ px: { xs: 1.5, sm: 2.5, md: 3 }, py: { xs: 1.5, sm: 2, md: 3 } }}>
          <AssociadosDashboard />
        </Box>
      }
    />
  );
}

export default AssociadosPage;
