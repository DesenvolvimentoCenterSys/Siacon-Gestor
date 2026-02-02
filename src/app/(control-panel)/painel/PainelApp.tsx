'use client';
import ProjectDashboardAppHeader from './ProjectDashboardAppHeader';
import { styled } from '@mui/material/styles';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { Box } from '@mui/material';
import HealthPlanDashboard from './widgets/HealthPlanDashboard';

const Root = styled(FusePageSimple)(({ theme }) => ({
  '& .FusePageSimple-header': {
    backgroundColor: theme.palette.background.default,
  },
  '& .FusePageSimple-content': {
    padding: 0
  }
}));

function PainelApp() {
  return (
    <Root
      scroll="content"
      header={<ProjectDashboardAppHeader />}
      content={
        <Box sx={{ width: '100%', px: { xs: 1.5, sm: 2.5, md: 3 }, py: { xs: 1.5, sm: 2, md: 3 } }}>
          <HealthPlanDashboard />
        </Box>
      }
    />
  );
}

export default PainelApp;
