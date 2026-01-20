'use client';
import ProjectDashboardAppHeader from './ProjectDashboardAppHeader';
import { styled } from '@mui/material/styles';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { Box } from '@mui/system';

const Root = styled(FusePageSimple)(({ theme }) => ({
  '& .FusePageSimple-header': {
    backgroundColor: theme.palette.background.default,
  },
}));

function PainelApp() {
  return (
    <Root
      header={<ProjectDashboardAppHeader />}
      content={
        <Box sx={{ width: '100%', px: { xs: 2, md: 4 } }}>
          <Box sx={{ mb: 3 }}>

          </Box>
        </Box>
      }
    />
  );
}

export default PainelApp;
