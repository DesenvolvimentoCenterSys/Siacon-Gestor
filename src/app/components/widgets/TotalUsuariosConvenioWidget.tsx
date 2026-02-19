import { useMemo, useState } from 'react';
import { useTheme, alpha } from '@mui/material/styles';
import { Card, CardContent, Typography, Box, IconButton, Tooltip, Menu, MenuItem, ListItemIcon, ListItemText, Divider, Dialog, DialogContent, DialogActions, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, Chip } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useTotalUsuariosConvenio, useToggleFavoriteWidget } from '../../hooks/useDashboard';
import WidgetLoading from '../ui/WidgetLoading';
import useUser from '@auth/useUser';
import { format } from 'date-fns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { ResumoUsuariosDto } from '../../services/dashboardService';

interface TotalUsuariosConvenioWidgetProps {
  initialIsFavorite?: boolean;
}

function MetricItem({ label, value, color, money = false }: { label: string, value: number, color: string, money?: boolean }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Typography variant="caption" color="text.secondary" fontWeight={500}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={700} sx={{ color: color }}>
        {money
          ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
          : value.toLocaleString('pt-BR')}
      </Typography>
    </Box>
  );
}

function SummaryCard({ title, data, icon, color }: { title: string, data: ResumoUsuariosDto, icon: string, color: string }) {
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
        <MetricItem label="Ativos" value={data.totalAtivos} color="text.primary" />
        <MetricItem label="Faturamento" value={data.faturamentoTotal} color="text.primary" money />
        <MetricItem label="Novos" value={data.totalNovos} color="success.main" />
        <MetricItem label="Desligados" value={data.totalDesligados} color="error.main" />
      </Box>
    </Box>
  );
}

export function TotalUsuariosConvenioWidget({ initialIsFavorite = false }: TotalUsuariosConvenioWidgetProps) {
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
  const { data: widgetData, isLoading } = useTotalUsuariosConvenio(apiDate);

  // Favorite Logic
  const toggleFavoriteMutation = useToggleFavoriteWidget();

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.id) return;
    const newStatus = !isFavorite;
    setIsFavorite(newStatus);
    toggleFavoriteMutation.mutate(
      { codUsu: Number(user.id), widgetId: 14, isFavorite: newStatus },
      { onError: () => setIsFavorite(!newStatus) }
    );
  };

  if (isLoading) return <WidgetLoading height={400} />;

  const defaultResumo: ResumoUsuariosDto = {
    totalAtivos: 0,
    totalDesligados: 0,
    totalNovos: 0,
    valorDesligados: 0,
    valorNovos: 0,
    faturamentoTotal: 0
  };

  const data = widgetData || {
    dataReferencia: new Date().toISOString(),
    geral: defaultResumo,
    pf: defaultResumo,
    pj: defaultResumo,
    porConvenio: []
  };

  return (
    <Card elevation={0} sx={{ height: '100%', overflow: 'hidden', border: `1px solid ${theme.palette.divider}` }}>
      <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ p: { xs: 2, md: 3 }, pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: `1px solid ${theme.palette.divider}`, gap: 1, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>
              Total Usuários por Convênio
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
              Visão geral de vidas, movimentações e faturamento
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Filter Button */}
            <Button
              size="small"
              variant="outlined"
              onClick={(e: any) => handleClickMenu(e)}
              startIcon={<FuseSvgIcon size={16}>heroicons-outline:calendar</FuseSvgIcon>}
              endIcon={<FuseSvgIcon size={16}>heroicons-solid:chevron-down</FuseSvgIcon>}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                color: 'text.secondary',
                borderColor: 'divider',
                minHeight: 44 // Touch target
              }}
            >
              {getFilterLabel()}
            </Button>

            <Tooltip title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}>
              <IconButton size="small" onClick={handleToggleFavorite} sx={{ minWidth: 44, minHeight: 44 }}>
                <FuseSvgIcon size={20} sx={{ color: isFavorite ? "#FFD700" : "action.disabled" }}>
                  {isFavorite ? 'heroicons-solid:star' : 'heroicons-outline:star'}
                </FuseSvgIcon>
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Summary Cards */}
        <Box sx={{ p: { xs: 2, md: 3 }, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, flexWrap: 'wrap', bgcolor: alpha(theme.palette.background.default, 0.5) }}>
          <SummaryCard
            title="Consolidado Geral"
            data={data.geral || defaultResumo}
            icon="heroicons-outline:chart-pie"
            color={theme.palette.primary.main}
          />
          <SummaryCard
            title="Pessoa Física (PF)"
            data={data.pf || defaultResumo}
            icon="heroicons-outline:user"
            color={theme.palette.info.main}
          />
          <SummaryCard
            title="Pessoa Jurídica (PJ)"
            data={data.pj || defaultResumo}
            icon="heroicons-outline:building-office-2"
            color={theme.palette.warning.main}
          />
        </Box>

        <Divider />

        {/* Table/List */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 0 }}>
          <TableContainer>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper', py: 2 }}>Convênio</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, bgcolor: 'background.paper', py: 2 }}>Ativos</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, bgcolor: 'background.paper', py: 2 }}>Novos</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, bgcolor: 'background.paper', py: 2, display: { xs: 'none', sm: 'table-cell' } }}>Desligados</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, bgcolor: 'background.paper', py: 2, display: { xs: 'none', sm: 'table-cell' } }}>Faturamento</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.porConvenio.map((item) => {
                  const safeGeral = item.geral || defaultResumo;
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
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600}>
                          {safeGeral.totalAtivos.toLocaleString('pt-BR')}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        {safeGeral.totalNovos > 0 ? (
                          <Chip
                            label={`+${safeGeral.totalNovos}`}
                            size="small"
                            sx={{
                              bgcolor: alpha(theme.palette.success.main, 0.1),
                              color: theme.palette.success.main,
                              height: 24,
                              fontWeight: 600
                            }}
                          />
                        ) : '-'}
                      </TableCell>
                      <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                        {safeGeral.totalDesligados > 0 ? (
                          <Typography variant="body2" color="error.main" fontWeight={500}>
                            -{safeGeral.totalDesligados}
                          </Typography>
                        ) : '-'}
                      </TableCell>
                      <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                        <Typography variant="body2" fontWeight={500}>
                          {safeGeral.faturamentoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {data.porConvenio.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>
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
    </Card>
  );
}
