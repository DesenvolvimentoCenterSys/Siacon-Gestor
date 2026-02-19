import { useMemo, useState } from 'react';
import { useTheme, alpha } from '@mui/material/styles';
import { Card, CardContent, Typography, Box, IconButton, Tooltip, Menu, MenuItem, ListItemIcon, ListItemText, Divider, Dialog, DialogContent, DialogActions, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, Chip, LinearProgress } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useTotalFaturamentoPorConvenio, useToggleFavoriteWidget } from '../../hooks/useDashboard';
import WidgetLoading from '../ui/WidgetLoading';
import useUser from '@auth/useUser';
import { format, subMonths } from 'date-fns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { ResumoFaturamentoDto } from '../../services/dashboardService';

interface TotalFaturamentoPorConvenioWidgetProps {
  initialIsFavorite?: boolean;
}

function MetricItem({ label, value, color, money = false, bold = false }: { label: string, value: number, color: string, money?: boolean, bold?: boolean }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Typography variant="caption" color="text.secondary" fontWeight={500}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={bold ? 700 : 500} sx={{ color: color }}>
        {money
          ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
          : value.toLocaleString('pt-BR')}
      </Typography>
    </Box>
  );
}

function SummaryCard({ title, data, icon, color }: { title: string, data: ResumoFaturamentoDto, icon: string, color: string }) {
  return (
    <Box sx={{
      p: 2,
      borderRadius: 2,
      bgcolor: alpha(color, 0.05),
      border: `1px solid ${alpha(color, 0.2)}`,
      flex: 1,
      minWidth: { xs: '100%', sm: 200 },
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: color }}>
        <FuseSvgIcon size={20}>{icon}</FuseSvgIcon>
        <Typography variant="subtitle1" fontWeight={700} color="text.primary">
          {title}
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        <MetricItem label="Total Geral" value={data.totalGeral} color="text.primary" money bold />
        <MetricItem label="Pago" value={data.totalPago} color="success.main" money />
        <MetricItem label="Aberto" value={data.totalAberto} color="warning.main" money />
        <MetricItem label="Vencido" value={data.totalVencido} color="error.main" money />
      </Box>
    </Box>
  );
}

export function TotalFaturamentoPorConvenioWidget({ initialIsFavorite = false }: TotalFaturamentoPorConvenioWidgetProps) {
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
  const { data: widgetData, isLoading } = useTotalFaturamentoPorConvenio(apiDate);

  // Favorite Logic
  const toggleFavoriteMutation = useToggleFavoriteWidget();

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.id) return;
    const newStatus = !isFavorite;
    setIsFavorite(newStatus);
    toggleFavoriteMutation.mutate(
      { codUsu: Number(user.id), widgetId: 15, isFavorite: newStatus },
      { onError: () => setIsFavorite(!newStatus) }
    );
  };

  if (isLoading) return <WidgetLoading height={400} />;

  const defaultResumo: ResumoFaturamentoDto = {
    totalGeral: 0,
    totalPago: 0,
    totalAberto: 0,
    totalVencido: 0
  };

  const data = widgetData || {
    dataReferencia: new Date().toISOString(),
    geral: defaultResumo,
    porConvenio: []
  };

  // Safe Access Helper
  const safeResumo = (resumo?: ResumoFaturamentoDto) => resumo || defaultResumo;

  return (
    <Card elevation={0} sx={{ height: { xs: 'auto', md: '100%' }, overflow: 'hidden', border: `1px solid ${theme.palette.divider}` }}>
      <CardContent sx={{ p: 0, height: { xs: 'auto', md: '100%' }, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ p: { xs: 2, md: 3 }, pb: 2, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, borderBottom: `1px solid ${theme.palette.divider}`, gap: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>
              Faturamento por Convênio
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
              {format(filterDate, 'MMM/yyyy', { locale: ptBR })}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: { xs: '100%', sm: 'auto' }, justifyContent: { xs: 'space-between', sm: 'flex-end' } }}>
            {/* Filtro Mês */}
            <Button
              size="small"
              variant="outlined"
              onClick={(e: any) => setAnchorEl(e.currentTarget)}
              startIcon={<FuseSvgIcon size={16}>heroicons-outline:calendar</FuseSvgIcon>}
              endIcon={<FuseSvgIcon size={16}>heroicons-solid:chevron-down</FuseSvgIcon>}
              sx={{ borderRadius: '8px', textTransform: 'none', color: 'text.secondary', borderColor: theme.palette.divider, minHeight: 44, whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              {format(filterDate, 'MMM yyyy', { locale: ptBR })}
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              {[0, 1, 2, 3].map(i => {
                const d = subMonths(new Date(), i);
                return (
                  <MenuItem key={i} onClick={() => { setFilterDate(d); setAnchorEl(null); }}>
                    {format(d, 'MMMM yyyy', { locale: ptBR })}
                  </MenuItem>
                );
              })}
              <Divider sx={{ my: 0.5 }} />
              <MenuItem onClick={handleCustomDateClick}>
                <ListItemIcon>
                  <FuseSvgIcon size={18}>heroicons-outline:adjustments-horizontal</FuseSvgIcon>
                </ListItemIcon>
                <ListItemText>Selecionar data...</ListItemText>
              </MenuItem>
            </Menu>

            {/* Favorito */}
            <Tooltip title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}>
              <IconButton size="small" onClick={handleToggleFavorite} sx={{ minWidth: 44, minHeight: 44 }}>
                <FuseSvgIcon size={20} sx={{ color: isFavorite ? "#FFD700" : "action.disabled" }}>
                  {isFavorite ? 'heroicons-solid:star' : 'heroicons-outline:star'}
                </FuseSvgIcon>
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Divider />

        {/* Table/List */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 0 }}>
          <TableContainer>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper', py: 2 }}>Convênio</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, bgcolor: 'background.paper', py: 2, width: { xs: 80, sm: 100 } }}>% Total</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, bgcolor: 'background.paper', py: 2 }}>Faturamento</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, bgcolor: 'background.paper', py: 2, display: { xs: 'none', sm: 'table-cell' } }}>Pago</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, bgcolor: 'background.paper', py: 2, display: { xs: 'none', sm: 'table-cell' } }}>Aberto</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, bgcolor: 'background.paper', py: 2, display: { xs: 'none', sm: 'table-cell' } }}>Vencido</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.porConvenio.map((item) => {
                  const safeFaturamento = safeResumo(item.faturamento);
                  return (
                    <TableRow key={item.codConvenio} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main,
                              fontSize: '0.875rem',
                              fontWeight: 600
                            }}
                          >
                            {item.nomeConvenio ? item.nomeConvenio.charAt(0) : '?'}
                          </Avatar>
                          <Typography variant="body2" fontWeight={500}>
                            {item.nomeConvenio || 'Sem Nome'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={item.percentual || 0}
                            sx={{
                              width: { xs: 30, sm: 50 },
                              height: 6,
                              borderRadius: 1,
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 1
                              }
                            }}
                          />
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                            {(item.percentual || 0).toFixed(1)}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={700}>
                          {safeFaturamento.totalGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                        <Typography variant="body2" color="success.main" fontWeight={500}>
                          {safeFaturamento.totalPago.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                        <Typography variant="body2" color="warning.main" fontWeight={500}>
                          {safeFaturamento.totalAberto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                        <Typography variant="body2" color="error.main" fontWeight={500}>
                          {safeFaturamento.totalVencido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {data.porConvenio.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                        <FuseSvgIcon size={40} color="action">heroicons-outline:inbox</FuseSvgIcon>
                        <Typography>Nenhum dado encontrado para o período selecionado.</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
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
    </Card >
  );
}
