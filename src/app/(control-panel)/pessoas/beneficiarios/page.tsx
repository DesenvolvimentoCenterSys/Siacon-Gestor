'use client';

import { styled } from '@mui/material/styles';
import FusePageSimple from '@fuse/core/FusePageSimple';
import ProjectDashboardAppHeader from '../../painel/ProjectDashboardAppHeader';
import BeneficiariosDashboard from './BeneficiariosDashboard';

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
      content={<BeneficiariosDashboard />}
    />
  );
}

export default BeneficiariosPage;
