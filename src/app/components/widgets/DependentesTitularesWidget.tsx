import { useMemo, useState, useEffect } from 'react';
import { useTheme, alpha } from '@mui/material/styles';
import { Card, CardContent, Typography, Box, IconButton, Tooltip, Menu, MenuItem, ListItemIcon, ListItemText, Divider, Dialog, DialogContent, DialogActions, Button } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useDependentesTitularesCount, useToggleFavoriteWidget } from '../../hooks/useDashboard';
import WidgetLoading from '../ui/WidgetLoading';
import useUser from '@auth/useUser';
import { format } from 'date-fns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';

interface DependentesTitularesWidgetProps {
  initialIsFavorite?: boolean;
}

export function DependentesTitularesWidget({ initialIsFavorite = false }: DependentesTitularesWidgetProps) {
  const theme = useTheme();
  const { data: user } = useUser();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);

  // Filter State
  const [filterDate, setFilterDate] = useState<Date>(new Date());

  const apiDate = useMemo(() => {
    return format(new Date(filterDate.getFullYear(), filterDate.getMonth(), 1), 'yyyy-MM-dd');
  }, [filterDate]);

  // Filter Menu State
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(filterDate);

  const handleClickMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleSelectMonth = (monthsAgo: number) => {
    const newDate = new Date();
    newDate.setMonth(newDate.getMonth() - monthsAgo);
    setFilterDate(newDate);
    handleCloseMenu();
  };

  const handleCustomDateClick = () => {
    handleCloseMenu();
    setDatePickerOpen(true);
  };

  const handleDatePickerClose = () => {
    setDatePickerOpen(false);
    setTempDate(filterDate);
  };

  const handleDatePickerConfirm = () => {
    if (tempDate) {
      setFilterDate(tempDate);
    }
    setDatePickerOpen(false);
  };

  const getFilterLabel = () => {
    const month = filterDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
    return month.charAt(0).toUpperCase() + month.slice(1);
  };

  // Data Fetching
  const { data: widgetData, isLoading } = useDependentesTitularesCount(apiDate);

  // Favorite Logic
  const toggleFavoriteMutation = useToggleFavoriteWidget();

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.id) return;
    const newStatus = !isFavorite;
    setIsFavorite(newStatus);
    toggleFavoriteMutation.mutate(
      { codUsu: Number(user.id), widgetId: 11, isFavorite: newStatus },
      { onError: () => setIsFavorite(!newStatus) }
    );
  };

  if (isLoading) return <WidgetLoading height={180} />;

  const data = widgetData || {
    titulares: 0,
    dependentes: 0,
    titularesLastMonth: 0,
    dependentesLastMonth: 0,
    titularesGrowth: 0,
    dependentesGrowth: 0
  };

  // KPI Card Styling (Blue Theme matching Taxa de Utilização)
  const gradientColors = [theme.palette.info.main, theme.palette.info.dark];

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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body2"
              sx={{
                opacity: 0.9,
                fontWeight: 600,
                fontSize: { xs: '1.25rem', sm: '1.375rem' },
                mb: 1.5,
              }}
            >
              Titulares vs Dependentes
            </Typography>

            {/* Elegant Filter Button */}
            <Tooltip title="Alterar período" placement="top">
              <Box
                onClick={(e: any) => handleClickMenu(e)}
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
          </Box>

          <Box sx={{ display: 'flex', gap: 0.5 }}>
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
            <FuseSvgIcon
              size={28}
              sx={{
                opacity: 0.3,
              }}
            >
              heroicons-outline:users
            </FuseSvgIcon>
          </Box>
        </Box>

        {/* Content Section (2 Columns) */}
        <Box sx={{ display: 'flex', gap: 4 }}>
          {/* Titulares */}
          <Box>
            <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.9rem', fontWeight: 500 }}>
              Titulares
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.8rem', sm: '2.2rem' },
                lineHeight: 1.2
              }}
            >
              {data.titulares.toLocaleString('pt-BR')}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, gap: 0.5 }}>
              <FuseSvgIcon
                size={16}
                sx={{
                  color: data.titularesGrowth >= 0 ? '#4ade80' : '#f87171',
                }}
              >
                {data.titularesGrowth >= 0 ? 'heroicons-solid:trending-up' : 'heroicons-solid:trending-down'}
              </FuseSvgIcon>
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: data.titularesGrowth >= 0 ? '#4ade80' : '#f87171',
                }}
              >
                {Math.abs(data.titularesGrowth).toFixed(1)}% vs anterior
              </Typography>
            </Box>
          </Box>

          {/* Divider */}
          <Box sx={{ width: '1px', bgcolor: alpha('#ffffff', 0.2) }} />

          {/* Dependentes */}
          <Box>
            <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.9rem', fontWeight: 500 }}>
              Dependentes
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.8rem', sm: '2.2rem' },
                lineHeight: 1.2
              }}
            >
              {data.dependentes.toLocaleString('pt-BR')}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, gap: 0.5 }}>
              <FuseSvgIcon
                size={16}
                sx={{
                  color: data.dependentesGrowth >= 0 ? '#4ade80' : '#f87171',
                }}
              >
                {data.dependentesGrowth >= 0 ? 'heroicons-solid:trending-up' : 'heroicons-solid:trending-down'}
              </FuseSvgIcon>
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: data.dependentesGrowth >= 0 ? '#4ade80' : '#f87171',
                }}
              >
                {Math.abs(data.dependentesGrowth).toFixed(1)}% vs anterior
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Filter Menu */}
        <Menu
          anchorEl={anchorEl}
          open={openMenu}
          onClose={handleCloseMenu}
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
          <MenuItem onClick={() => handleSelectMonth(0)} selected={filterDate?.getMonth() === new Date().getMonth()}>
            <ListItemIcon>
              <FuseSvgIcon size={18}>heroicons-outline:calendar</FuseSvgIcon>
            </ListItemIcon>
            <ListItemText>Mês atual</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleSelectMonth(1)}>
            <ListItemIcon>
              <FuseSvgIcon size={18}>heroicons-outline:arrow-left</FuseSvgIcon>
            </ListItemIcon>
            <ListItemText>Mês passado</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleSelectMonth(2)}>
            <ListItemIcon>
              <FuseSvgIcon size={18}>heroicons-outline:arrow-left</FuseSvgIcon>
            </ListItemIcon>
            <ListItemText>Há 2 meses</ListItemText>
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
                onChange={(newValue) => setTempDate(newValue || filterDate)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    sx: { mb: 2 }
                  },
                  popper: {
                    sx: {
                      zIndex: 99999,
                    }
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
