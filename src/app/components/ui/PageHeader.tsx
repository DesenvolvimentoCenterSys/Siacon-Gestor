import { Box, Typography, useTheme } from '@mui/material';
import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  icon?: ReactNode;
  compact?: boolean; 
}

export function PageHeader({ title, subtitle, icon, compact }: PageHeaderProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        mb: compact ? 2 : 4,
        display: 'flex',
        alignItems: 'center', 
        gap: compact ? 1.5 : 3,
        flexWrap: 'nowrap',
        minWidth: 0, 
      }}
    >
      {icon && (
        <Box
          sx={{
            flexShrink: 0, 
            p: compact ? 1 : 1.5,
            borderRadius: '12px',
            backgroundColor:
              theme.palette.mode === 'light'
                ? 'rgba(0, 0, 0, 0.05)'
                : 'rgba(255, 255, 255, 0.05)',
            color: 'text.primary',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '& svg': {
              width: compact ? 20 : 32,
              height: compact ? 20 : 32,
            },
          }}
        >
          {icon}
        </Box>
      )}

      <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {title && (
          <Typography
            variant={compact ? 'subtitle1' : 'h4'}
            sx={{
              color: 'text.primary',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              lineHeight: 1.2,
              mb: subtitle ? 0.5 : 0,
              whiteSpace: { xs: 'normal', sm: 'nowrap' },
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {title}
          </Typography>
        )}
        {subtitle && (
          <Typography
            variant={compact ? 'body1' : 'subtitle1'}
            sx={{
              color: 'text.secondary',
              fontWeight:'bold',
              lineHeight: 1.4,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );
}