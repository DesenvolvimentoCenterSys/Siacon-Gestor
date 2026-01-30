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
        <Box sx={{ p: 3 }}>
          <AssociadosDashboard />
        </Box>
      }
    />
  );
}

export default AssociadosPage;
