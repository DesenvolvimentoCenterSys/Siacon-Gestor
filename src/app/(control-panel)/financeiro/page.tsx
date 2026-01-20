'use client';

import { styled } from '@mui/material/styles';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { Box } from '@mui/material';
import FinancialDashboard from './FinancialDashboard';
import ProjectDashboardAppHeader from '../painel/ProjectDashboardAppHeader';

const Root = styled(FusePageSimple)(({ theme }) => ({
  '& .FusePageSimple-header': {
    backgroundColor: theme.palette.background.default,
  },
  '& .FusePageSimple-content': {
    padding: 0
  }
}));

function FinancialPage() {
  return (
    <Root
      scroll="content"
      header={<ProjectDashboardAppHeader pageTitle="Gestão Financeira" />}
      content={
        <Box sx={{ width: '100%', px: { xs: 2, sm: 3, md: 3 }, py: { xs: 2, md: 3 } }}>
          <FinancialDashboard />
        </Box>
      }
    />
  );
}

export default FinancialPage;
