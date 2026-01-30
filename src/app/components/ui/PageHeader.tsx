import { Box, Typography, useTheme } from '@mui/material';
import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
}

export function PageHeader({ title, subtitle, icon }: PageHeaderProps) {
  const theme = useTheme();

  return (
    <Box sx={{ mb: 4, display: 'flex', alignItems: 'flex-start' }}>
      {icon && (
        <Box
          sx={{
            mr: 3,
            p: 1.5,
            borderRadius: '12px',
            backgroundColor: (theme) => theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)',
            color: 'text.primary',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography
          variant="h4"
          sx={{
            color: 'text.primary',
            fontWeight: 800,
            letterSpacing: '-0.025em',
            lineHeight: 1.2,
            mb: 0.5,
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="subtitle1"
            sx={{
              color: 'text.secondary',
              maxWidth: '600px',
              lineHeight: 1.5,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
