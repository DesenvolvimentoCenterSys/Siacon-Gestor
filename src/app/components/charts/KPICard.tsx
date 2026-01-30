import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, IconButton, Tooltip, Menu, MenuItem, ListItemIcon, ListItemText, Divider, Dialog, DialogContent, DialogActions, Button } from '@mui/material';
import { alpha } from '@mui/material/styles';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import useUser from '@auth/useUser';
import { useToggleFavoriteWidget } from '../../hooks/useDashboard';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';

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
  widgetId?: number;
  initialIsFavorite?: boolean;
  // Filter props
  showFilter?: boolean;
  filterDate?: Date | null;
  onFilterChange?: (date: Date | null) => void;
};

function KPICard({
  title,
  value,
  icon,
  trend,
  gradientColors,
  subtitle,
  widgetId,
  initialIsFavorite = false,
  showFilter = false,
  filterDate,
  onFilterChange
}: KPICardProps) {
  const { data: user } = useUser();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [tempDate, setTempDate] = useState<Date | null>(filterDate);
  const toggleFavoriteMutation = useToggleFavoriteWidget();

  useEffect(() => {
    setIsFavorite(initialIsFavorite);
  }, [initialIsFavorite]);

  useEffect(() => {
    setTempDate(filterDate);
  }, [filterDate]);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.id || !widgetId) return;

    const newStatus = !isFavorite;
    setIsFavorite(newStatus);

    toggleFavoriteMutation.mutate(
      { codUsu: Number(user.id), widgetId, isFavorite: newStatus },
      {
        onError: () => {
          setIsFavorite(!newStatus);
        }
      }
    );
  };

  const handleFilterClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setFilterAnchorEl(e.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleMonthSelect = (monthsBack: number) => {
    if (onFilterChange) {
      const newDate = new Date();
      newDate.setMonth(newDate.getMonth() - monthsBack);
      onFilterChange(newDate);
    }
    handleFilterClose();
  };

  const handleCustomDateClick = () => {
    handleFilterClose();
    setDatePickerOpen(true);
  };

  const handleDatePickerClose = () => {
    setDatePickerOpen(false);
    setTempDate(filterDate);
  };

  const handleDatePickerConfirm = () => {
    if (onFilterChange && tempDate) {
      onFilterChange(tempDate);
    }
    setDatePickerOpen(false);
  };

  const getFilterLabel = () => {
    if (!filterDate) return 'Mês atual';
    const month = filterDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
    return month.charAt(0).toUpperCase() + month.slice(1);
  };

  return (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)`,
        color: 'white',
        height: '100%',
        position: 'relative',
        overflow: 'visible',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) => theme.shadows[8],
        },
      }}
      elevation={3}
    >
      <CardContent sx={{ position: 'relative', zIndex: 1, p: { xs: 2, sm: 3 } }}>
        {/* Header with actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body2"
              sx={{
                opacity: 0.9,
                fontWeight: 600,
                fontSize: { xs: '1.25rem', sm: '1.375rem' },
                mb: showFilter ? 1.5 : 0,
              }}
            >
              {title}
            </Typography>

            {/* Elegant Filter Button - INCREASED SIZE */}
            {showFilter && (
              <Tooltip title="Alterar período" placement="top">
                <Box
                  onClick={handleFilterClick}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.75,
                    px: 2.25,
                    py: 0.875,
                    borderRadius: '14px',
                    background: alpha('#ffffff', 0.15),
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${alpha('#ffffff', 0.2)}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      background: alpha('#ffffff', 0.25),
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  <FuseSvgIcon size={20} sx={{ opacity: 0.9 }}>
                    heroicons-outline:calendar
                  </FuseSvgIcon>
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '1rem',
                      fontWeight: 600,
                      opacity: 0.95,
                      letterSpacing: '0.02em',
                    }}
                  >
                    {getFilterLabel()}
                  </Typography>
                  <FuseSvgIcon size={18} sx={{ opacity: 0.7 }}>
                    heroicons-solid:chevron-down
                  </FuseSvgIcon>
                </Box>
              </Tooltip>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {widgetId && (
              <Tooltip title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}>
                <IconButton
                  onClick={handleToggleFavorite}
                  size="small"
                  sx={{
                    color: 'white',
                    padding: 0,
                    mr: 1,
                    '&:hover': { background: alpha('#ffffff', 0.2) }
                  }}
                >
                  <FuseSvgIcon size={20} sx={{ color: isFavorite ? "#FFD700" : "inherit" }}>
                    {isFavorite ? 'heroicons-solid:star' : 'heroicons-outline:star'}
                  </FuseSvgIcon>
                </IconButton>
              </Tooltip>
            )}
            <FuseSvgIcon
              size={28}
              sx={{
                opacity: 0.3,
              }}
            >
              {icon}
            </FuseSvgIcon>
          </Box>
        </Box>

        {/* Filter Menu */}
        <Menu
          anchorEl={filterAnchorEl}
          open={Boolean(filterAnchorEl)}
          onClose={handleFilterClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          slotProps={{
            paper: {
              sx: {
                mt: 1,
                minWidth: 220,
                borderRadius: 2,
                boxShadow: (theme) => theme.shadows[8],
              }
            }
          }}
        >
          <MenuItem onClick={() => handleMonthSelect(0)} selected={filterDate?.getMonth() === new Date().getMonth()}>
            <ListItemIcon>
              <FuseSvgIcon size={18}>heroicons-outline:calendar</FuseSvgIcon>
            </ListItemIcon>
            <ListItemText>Mês atual</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleMonthSelect(1)}>
            <ListItemIcon>
              <FuseSvgIcon size={18}>heroicons-outline:arrow-left</FuseSvgIcon>
            </ListItemIcon>
            <ListItemText>Mês passado</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleMonthSelect(2)}>
            <ListItemIcon>
              <FuseSvgIcon size={18}>heroicons-outline:arrow-left</FuseSvgIcon>
            </ListItemIcon>
            <ListItemText>Há 2 meses</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleMonthSelect(3)}>
            <ListItemIcon>
              <FuseSvgIcon size={18}>heroicons-outline:arrow-left</FuseSvgIcon>
            </ListItemIcon>
            <ListItemText>Há 3 meses</ListItemText>
          </MenuItem>
          <Divider sx={{ my: 0.5 }} />
          <MenuItem onClick={handleCustomDateClick}>
            <ListItemIcon>
              <FuseSvgIcon size={18}>heroicons-outline:adjustments-horizontal</FuseSvgIcon>
            </ListItemIcon>
            <ListItemText>Selecionar data...</ListItemText>
          </MenuItem>
        </Menu>

        {/* Custom Date Picker Dialog */}
        <Dialog
          open={datePickerOpen}
          onClose={handleDatePickerClose}
          PaperProps={{
            sx: {
              borderRadius: 3,
              minWidth: 320,
            }
          }}
        >
          <DialogContent sx={{ pt: 3 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
              <DatePicker
                views={['year', 'month']}
                label="Selecione o mês e ano"
                value={tempDate}
                onChange={(newValue) => setTempDate(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    sx: { mb: 2 }
                  }
                }}
              />
            </LocalizationProvider>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleDatePickerClose} color="inherit">
              Cancelar
            </Button>
            <Button onClick={handleDatePickerConfirm} variant="contained" color="primary">
              Confirmar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Main Value */}
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
              fontSize: { xs: '1.063rem', sm: '1.125rem' },
              fontWeight: 500
            }}
          >
            {subtitle}
          </Typography>
        )}

        {/* Trend Indicator */}
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 0.5 }}>
            <FuseSvgIcon
              size={20}
              sx={{
                color: trend.isPositive ? '#4ade80' : '#f87171',
              }}
            >
              {trend.isPositive ? 'heroicons-solid:trending-up' : 'heroicons-solid:trending-down'}
            </FuseSvgIcon>
            <Typography
              variant="caption"
              sx={{
                fontSize: '1rem',
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
