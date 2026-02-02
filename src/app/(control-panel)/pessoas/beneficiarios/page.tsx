'use client';

import { styled } from '@mui/material/styles';
import FusePageSimple from '@fuse/core/FusePageSimple';
import ProjectDashboardAppHeader from '../../painel/ProjectDashboardAppHeader';
import BeneficiariosDashboard from './BeneficiariosDashboard';
import { Box } from '@mui/material';

const Root = styled(FusePageSimple)(({ theme }) => ({
  '& .FusePageSimple-header': {
    backgroundColor: theme.palette.background.default,
  },
  '& .FusePageSimple-content': {
    padding: 0
  }
}));

function BeneficiariosPage() {
  return (
    <Root
      scroll="content"
      header={<ProjectDashboardAppHeader pageTitle="Beneficiários de Planos" />}
      content={
        <Box sx={{ px: { xs: 1.5, sm: 2.5, md: 3 }, py: { xs: 1.5, sm: 2, md: 3 } }}>
          <BeneficiariosDashboard />
        </Box>
      }
    />
  );
}

export default BeneficiariosPage;
