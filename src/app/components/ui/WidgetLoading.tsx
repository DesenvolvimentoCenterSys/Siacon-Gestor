import { Box, CircularProgress } from '@mui/material';

export default function WidgetLoading({ height = 350 }: { height?: number | string }) {
  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: height,
      width: '100%',
      backgroundColor: 'action.hover',
      borderRadius: 2
    }}>
      <CircularProgress />
    </Box>
  );
}
