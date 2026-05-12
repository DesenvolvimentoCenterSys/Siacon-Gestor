'use client';

import { Box, Typography } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import WidgetLoading from '../../components/ui/WidgetLoading';
import useUser from '@auth/useUser';
import { AccumulatedDelinquencyWidget } from '../../components/widgets/AccumulatedDelinquencyWidget';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

function InadimplenciaDashboard() {
  const theme = useTheme();
  const { data: user } = useUser();

  return (
    <Box sx={{ width: '100%' }}>
      {/* Page title */}

      {/* Widget */}
      {user ? (
        <AccumulatedDelinquencyWidget />
      ) : (
        <WidgetLoading height={520} />
      )}
    </Box>
  );
}

export default InadimplenciaDashboard;
