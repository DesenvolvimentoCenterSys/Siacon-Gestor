import { Card, CardContent, Typography, Box } from '@mui/material';
import { alpha } from '@mui/material/styles';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

type KPICardProps = {
  title: string;
  value: string | number;
  icon: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  gradientColors: [string, string];
  subtitle?: string;
};

function KPICard({ title, value, icon, trend, gradientColors, subtitle }: KPICardProps) {
  return (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)`,
        color: 'white',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) => theme.shadows[8],
        },
      }}
      elevation={3}
    >
      <CardContent sx={{ position: 'relative', zIndex: 1, p: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography
            variant="body2"
            sx={{
              opacity: 0.9,
              fontWeight: 600,
              fontSize: { xs: '0.875rem', sm: '1rem' },
            }}
          >
            {title}
          </Typography>
          <FuseSvgIcon
            size={28}
            sx={{
              opacity: 0.3,
              position: 'absolute',
              right: 16,
              top: 16,
            }}
          >
            {icon}
          </FuseSvgIcon>
        </Box>

        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            mb: 0.5,
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
          }}
        >
          {value}
        </Typography>

        {subtitle && (
          <Typography
            variant="caption"
            sx={{
              opacity: 0.9,
              fontSize: { xs: '0.8rem', sm: '0.9rem' },
              fontWeight: 500
            }}
          >
            {subtitle}
          </Typography>
        )}

        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 0.5 }}>
            <FuseSvgIcon
              size={16}
              sx={{
                color: trend.isPositive ? '#4ade80' : '#f87171',
              }}
            >
              {trend.isPositive ? 'heroicons-solid:trending-up' : 'heroicons-solid:trending-down'}
            </FuseSvgIcon>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: trend.isPositive ? '#4ade80' : '#f87171',
              }}
            >
              {trend.value}
            </Typography>
          </Box>
        )}
      </CardContent>

      {/* Background decoration */}
      <Box
        sx={{
          position: 'absolute',
          right: -20,
          bottom: -20,
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: alpha('#ffffff', 0.1),
          zIndex: 0,
        }}
      />
    </Card>
  );
}

export default KPICard;
