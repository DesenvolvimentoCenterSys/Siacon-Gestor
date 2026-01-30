'use client';

import { styled } from '@mui/material/styles';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { Box } from '@mui/material';
import ProjectDashboardAppHeader from '../../painel/ProjectDashboardAppHeader';

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
        <Box sx={{ p: 3 }}>
          {/* Blank Content */}
        </Box>
      }
    />
  );
}

export default BeneficiariosPage;
