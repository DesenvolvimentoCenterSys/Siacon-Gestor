'use client';

import { styled } from '@mui/material/styles';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { Box } from '@mui/material';
import ConveniosDashboard from './ConveniosDashboard';
import ProjectDashboardAppHeader from '../painel/ProjectDashboardAppHeader';

const Root = styled(FusePageSimple)(({ theme }) => ({
  '& .FusePageSimple-header': {
    backgroundColor: theme.palette.background.default,
  },
  '& .FusePageSimple-content': {
    padding: 0
  }
}));

function ConveniosPage() {
  return (
    <Root
      scroll="content"
      header={<ProjectDashboardAppHeader pageTitle="Gestão de Convênios" />}
      content={
        <Box sx={{ width: '100%', px: { xs: 2, sm: 3, md: 3 }, py: { xs: 2, md: 3 } }}>
          <ConveniosDashboard />
        </Box>
      }
    />
  );
}

export default ConveniosPage;
