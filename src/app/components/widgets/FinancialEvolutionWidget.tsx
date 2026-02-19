'use client';

import { useMemo, useState, useEffect } from 'react';
import { useTheme, alpha } from '@mui/material/styles';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import {
	Card,
	CardContent,
	Typography,
	Box,
	IconButton,
	Tooltip,
	Menu,
	MenuItem,
	ListItemIcon,
	ListItemText,
	Divider,
	Button,
	Dialog,
	DialogContent,
	DialogActions,
	Chip,
	Tabs,
	Tab
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import useUser from '@auth/useUser';
import { format } from 'date-fns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import WidgetLoading from '../ui/WidgetLoading';
import { FinancialEvolutionDto } from '../../services/dashboardService';
import { useFinancialEvolution, useToggleFavoriteWidget, useUserFavoriteWidgets } from '../../hooks/useDashboard';
import { useChartDataAggregation, SeriesData } from '../../hooks/useChartDataAggregation';

interface FinancialEvolutionWidgetProps {
	initialIsFavorite?: boolean;
}

const WIDGET_ID = 18;

export function FinancialEvolutionWidget({ initialIsFavorite = false }: FinancialEvolutionWidgetProps) {
	const theme = useTheme();
	const { data: user } = useUser();
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('md'));

	// Filter state
	const [filterDate, setFilterDate] = useState<Date>(new Date());
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const openMenu = Boolean(anchorEl);
	const [datePickerOpen, setDatePickerOpen] = useState(false);
	const [tempDate, setTempDate] = useState<Date>(filterDate);
	const [selectedBank, setSelectedBank] = useState<string>('Todos');

	// Mobile Series Toggle
	const [activeSeries, setActiveSeries] = useState<string>('receber');

	const apiDate = useMemo(() => {
		return format(new Date(filterDate.getFullYear(), filterDate.getMonth(), 1), 'yyyy-MM-dd');
	}, [filterDate]);

	useEffect(() => {
		setTempDate(filterDate);
	}, [filterDate]);

	// Filter menu handlers
	const handleClickMenu = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget);
	const handleCloseMenu = () => setAnchorEl(null);
	const handleSelectMonth = (monthsAgo: number) => {
		const d = new Date();
		d.setMonth(d.getMonth() - monthsAgo);
		setFilterDate(d);
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
		if (tempDate) setFilterDate(tempDate);

		setDatePickerOpen(false);
	};

	// Data
	const { data: widgetData, isLoading } = useFinancialEvolution(apiDate);
	const { data: favoriteWidgets } = useUserFavoriteWidgets(user?.id ? Number(user.id) : undefined);
	const toggleFavoriteMutation = useToggleFavoriteWidget();

	// Favorite logic
	const backendIsFavorite = useMemo(() => {
		if (!favoriteWidgets) return initialIsFavorite;

		return favoriteWidgets.some(
			(w: { dashboardWidgetId: number; isFavorite: boolean }) => w.dashboardWidgetId === WIDGET_ID && w.isFavorite
		);
	}, [favoriteWidgets, initialIsFavorite]);

	const [optimisticStatus, setOptimisticStatus] = useState<boolean | null>(null);
	const isFavorite = optimisticStatus !== null ? optimisticStatus : backendIsFavorite;

	useEffect(() => {
		if (optimisticStatus !== null && backendIsFavorite === optimisticStatus) setOptimisticStatus(null);
	}, [backendIsFavorite, optimisticStatus]);

	const handleToggleFavorite = (e: React.MouseEvent) => {
		e.stopPropagation();

		if (!user?.id) return;

		const newStatus = !isFavorite;
		setOptimisticStatus(newStatus);
		toggleFavoriteMutation.mutate(
			{ codUsu: Number(user.id), widgetId: WIDGET_ID, isFavorite: newStatus },
			{ onError: () => setOptimisticStatus(null) }
		);
	};

	// Colors
	const colorReceber = '#2E7D32'; // verde metálico
	const colorPagar = '#C62828'; // vermelho metálico
	const colorSaldo = theme.palette.secondary.main;

	// Derived data
	const banks = useMemo(() => {
		if (!widgetData) return [];

		return ['Todos', ...Array.from(new Set(widgetData.map((d: FinancialEvolutionDto) => d.nomeBanco)))];
	}, [widgetData]);

	const filteredData = useMemo(() => {
		if (!widgetData) return [];

		if (selectedBank === 'Todos') return widgetData;

		return widgetData.filter((d: FinancialEvolutionDto) => d.nomeBanco === selectedBank);
	}, [widgetData, selectedBank]);

	// 1. Process Raw Data
	const rawData = useMemo(() => {
		if (!filteredData || filteredData.length === 0)
			return { dates: [], series: [], totals: { receber: 0, pagar: 0, saldoDia: 0, saldoAcumulado: 0 } };

		const dates = filteredData.map((d: FinancialEvolutionDto) => d.data.split('T')[0]);

		const seriesList: SeriesData[] = [
			{
				name: 'A Receber',
				data: filteredData.map((d) => Math.abs(d.totalReceber)),
				type: 'column',
				aggregation: 'sum'
			},
			{
				name: 'A Pagar',
				data: filteredData.map((d) => Math.abs(d.totalPagar)),
				type: 'column',
				aggregation: 'sum'
			},
			{
				name: 'Saldo Acumulado',
				data: filteredData.map((d) => d.saldoAcumulado),
				type: 'line',
				aggregation: 'last'
			}
		];

		const totals = filteredData.reduce(
			(acc, d: FinancialEvolutionDto) => ({
				receber: acc.receber + Math.abs(d.totalReceber),
				pagar: acc.pagar + Math.abs(d.totalPagar),
				saldoDia: filteredData.length > 0 ? filteredData[filteredData.length - 1].saldoDoDia : 0,
				saldoAcumulado: filteredData.length > 0 ? filteredData[filteredData.length - 1].saldoAcumulado : 0
			}),
			{ receber: 0, pagar: 0, saldoDia: 0, saldoAcumulado: 0 }
		);

		return { dates, series: seriesList, totals };
	}, [filteredData]);

	// 2. Aggregate Data using Hook
	const aggregatedData = useChartDataAggregation({
		dates: rawData.dates,
		series: rawData.series,
		isMobile,
		maxPoints: 12
	});

	// 3. Filter Series for Mobile
	const finalSeries = useMemo(() => {
		if (!isMobile) return aggregatedData.series;

		switch (activeSeries) {
			case 'receber':
				return aggregatedData.series
					.filter((s) => s.name === 'A Receber')
					.map((s) => ({ ...s, type: 'area', color: colorReceber }));
			case 'pagar':
				return aggregatedData.series
					.filter((s) => s.name === 'A Pagar')
					.map((s) => ({ ...s, type: 'area', color: colorPagar }));
			case 'saldo':
				return aggregatedData.series
					.filter((s) => s.name === 'Saldo Acumulado')
					.map((s) => ({ ...s, type: 'area', color: colorSaldo }));
			default:
				return aggregatedData.series;
		}
	}, [aggregatedData.series, isMobile, activeSeries, colorReceber, colorPagar, colorSaldo]);

	const mobileSeriesColor = useMemo(() => {
		if (activeSeries === 'receber') return colorReceber;

		if (activeSeries === 'pagar') return colorPagar;

		return colorSaldo;
	}, [activeSeries, colorReceber, colorPagar, colorSaldo]);

	const chartOptions: ApexOptions = {
		chart: {
			type: 'line',
			stacked: false,
			toolbar: { show: false },
			zoom: { enabled: false },
			fontFamily: 'inherit',
			animations: { enabled: !isMobile }
		},
		colors: isMobile ? [mobileSeriesColor] : [colorReceber, colorPagar, colorSaldo],
		stroke: {
			width: isMobile ? 3 : [0, 0, 3],
			curve: 'smooth',
			colors: isMobile ? [mobileSeriesColor] : ['transparent', 'transparent', colorSaldo]
		},
		fill: {
			type: isMobile ? 'gradient' : 'solid',
			gradient: {
				shadeIntensity: 1,
				opacityFrom: 0.4,
				opacityTo: 0.1,
				stops: [0, 100]
			}
		},
		plotOptions: {
			bar: { columnWidth: '55%', borderRadius: 3 }
		},
		dataLabels: { enabled: false },
		xaxis: {
			categories: aggregatedData.categories,
			axisBorder: { show: false },
			axisTicks: { show: false },
			tooltip: { enabled: false },
			labels: {
				show: !isMobile || aggregatedData.categories.length < 8,
				style: { colors: theme.palette.text.secondary, fontSize: isMobile ? '10px' : '12px' }
			}
		},
		yaxis: isMobile
			? {
					labels: {
						formatter: (v) => {
							if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(1)}k`;

							return v.toFixed(0);
						},
						style: { fontSize: '10px' }
					}
				}
			: [
					{
						seriesName: 'A Receber',
						min: 0,
						forceNiceScale: true,
						title: {
							text: 'Movimentação',
							style: { color: theme.palette.text.secondary }
						},
						labels: {
							style: { colors: theme.palette.text.secondary },
							formatter: (v) => {
								if (v >= 1000) return `R$${(v / 1000).toFixed(0)}k`;

								return `R$${v.toFixed(0)}`;
							}
						}
					},
					{
						seriesName: 'A Pagar',
						show: false,
						min: 0,
						forceNiceScale: true
					},
					{
						seriesName: 'Saldo Acumulado',
						opposite: true,
						title: {
							text: 'Saldo Acumulado',
							style: { color: colorSaldo }
						},
						labels: {
							style: { colors: colorSaldo },
							formatter: (v) => {
								if (Math.abs(v) >= 1000) return `R$${(v / 1000).toFixed(0)}k`;

								return `R$${v.toFixed(0)}`;
							}
						}
					}
				],
		tooltip: {
			y: {
				formatter: (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
			},
			theme: theme.palette.mode,
			fixed: {
				enabled: isMobile,
				position: 'topRight',
				offsetX: 0,
				offsetY: 0
			}
		},
		legend: { show: !isMobile, position: 'top', horizontalAlign: 'center' },
		grid: {
			borderColor: theme.palette.divider,
			strokeDashArray: 3,
			padding: {
				left: isMobile ? 10 : 20,
				right: isMobile ? 10 : 20
			}
		}
	};

	const formatCurrency = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

	const metricCards = [
		{
			label: 'A Receber',
			value: rawData.totals.receber,
			color: colorReceber,
			icon: 'heroicons-outline:arrow-trending-up',
			key: 'receber'
		},
		{
			label: 'A Pagar',
			value: rawData.totals.pagar,
			color: colorPagar,
			icon: 'heroicons-outline:arrow-trending-down',
			key: 'pagar'
		},
		{
			label: 'Saldo do Dia',
			value: rawData.totals.saldoDia,
			color: theme.palette.warning.main,
			icon: 'heroicons-outline:calendar-days',
			key: 'saldo_dia'
		},
		{
			label: 'Saldo Acumulado',
			value: rawData.totals.saldoAcumulado,
			color: colorSaldo,
			icon: 'heroicons-outline:chart-bar-square',
			key: 'saldo'
		}
	];

	if (isLoading) return <WidgetLoading height={500} />;

	return (
		<Card
			className="w-full shadow-sm rounded-2xl overflow-hidden"
			elevation={0}
			sx={{
				border: `1px solid ${theme.palette.divider}`,
				height: '100%',
				display: 'flex',
				flexDirection: 'column'
			}}
		>
			{/* Header */}
			<Box className="flex items-center justify-between px-6 py-4 border-b">
				<Typography className="text-lg font-semibold truncate text-primary">
					{isMobile && aggregatedData.period !== 'daily'
						? `Evolução (${aggregatedData.period === 'weekly' ? 'Semana' : 'Mês'})`
						: 'Evolução Financeira por Banco'}
				</Typography>
				<Box className="flex items-center gap-2">
					{/* Date filter */}
					<Tooltip title="Filtrar por data">
						<IconButton
							size="small"
							onClick={handleClickMenu}
						>
							<FuseSvgIcon size={20}>heroicons-outline:calendar</FuseSvgIcon>
						</IconButton>
					</Tooltip>
					<Menu
						anchorEl={anchorEl}
						open={openMenu}
						onClose={handleCloseMenu}
					>
						<MenuItem onClick={() => handleSelectMonth(0)}>
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
						<MenuItem onClick={() => handleSelectMonth(3)}>
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

					{/* Date Picker Dialog */}
					<Dialog
						open={datePickerOpen}
						onClose={handleDatePickerClose}
						PaperProps={{ sx: { borderRadius: 3, minWidth: 320, zIndex: 1400 } }}
						sx={{ zIndex: 1300 }}
					>
						<DialogContent sx={{ pt: 3 }}>
							<LocalizationProvider
								dateAdapter={AdapterDateFns}
								adapterLocale={ptBR}
							>
								<DatePicker
									views={['year', 'month']}
									label="Selecione o mês e ano"
									value={tempDate}
									onChange={(v) => setTempDate(v || filterDate)}
									slotProps={{
										textField: { fullWidth: true, sx: { mb: 2 } },
										popper: { sx: { zIndex: 9999 } }
									}}
								/>
							</LocalizationProvider>
						</DialogContent>
						<DialogActions sx={{ px: 3, pb: 2 }}>
							<Button
								onClick={handleDatePickerClose}
								color="inherit"
							>
								Cancelar
							</Button>
							<Button
								onClick={handleDatePickerConfirm}
								variant="contained"
								color="primary"
							>
								Confirmar
							</Button>
						</DialogActions>
					</Dialog>

					{/* Favorite toggle */}
					<Tooltip title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}>
						<IconButton
							onClick={handleToggleFavorite}
							size="small"
						>
							<FuseSvgIcon
								sx={{ color: isFavorite ? '#FFD700' : 'action.active' }}
								size={20}
							>
								{isFavorite ? 'heroicons-solid:star' : 'heroicons-outline:star'}
							</FuseSvgIcon>
						</IconButton>
					</Tooltip>
				</Box>
			</Box>

			<CardContent
				sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3, '&:last-child': { pb: 3 } }}
			>
				{/* Bank filter chips */}
				{banks.length > 1 && (
					<Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
						{banks.map((bank) => (
							<Chip
								key={bank}
								label={bank}
								size="small"
								onClick={() => setSelectedBank(bank)}
								variant={selectedBank === bank ? 'filled' : 'outlined'}
								color={selectedBank === bank ? 'primary' : 'default'}
								sx={{ fontWeight: selectedBank === bank ? 700 : 400 }}
							/>
						))}
					</Box>
				)}

				{/* Mobile Series Selector */}
				{isMobile && (
					<Tabs
						value={activeSeries}
						onChange={(_, v) => setActiveSeries(v as string)}
						variant="fullWidth"
						indicatorColor="primary"
						textColor="inherit"
						sx={{
							minHeight: 40,
							mb: 2,
							'& .MuiTabs-indicator': {
								bgcolor: mobileSeriesColor
							}
						}}
					>
						<Tab
							value="receber"
							label="Receber"
							sx={{ color: colorReceber, fontWeight: 700, minHeight: 40, py: 1 }}
						/>
						<Tab
							value="pagar"
							label="Pagar"
							sx={{ color: colorPagar, fontWeight: 700, minHeight: 40, py: 1 }}
						/>
						<Tab
							value="saldo"
							label="Saldo"
							sx={{ color: colorSaldo, fontWeight: 700, minHeight: 40, py: 1 }}
						/>
					</Tabs>
				)}

				{/* Metric summary cards */}
				<Box
					sx={{
						display: 'grid',
						gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
						gap: 2,
						mb: 3
					}}
				>
					{metricCards.map((m) => {
						// On mobile, show only the selected series metric + default ones if needed, or just show all in a stack?
						// The request says "Se houver mais de uma linha: Exibir apenas uma por vez".
						// But for KPI cards, it's useful to see context.
						// Let's filtering matching cards to handle screen space if needed.
						// However, metric cards are valuable summary.
						// Let's keep them all but ensure they stack nicely (handled by grid).
						// Optionally highlight the active one.
						if (isMobile && m.key !== 'saldo_dia' && m.key !== activeSeries) return null; // Experimental: show only active + saldo do dia

						return (
							<Box
								key={m.label}
								sx={{
									p: 2,
									borderRadius: 2,
									backgroundColor: alpha(m.color, 0.08),
									border: `1px solid ${alpha(m.color, 0.2)}`
								}}
							>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
									<FuseSvgIcon
										size={16}
										sx={{ color: m.color }}
									>
										{m.icon}
									</FuseSvgIcon>
									<Typography
										variant="caption"
										sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}
									>
										{m.label}
									</Typography>
								</Box>
								<Typography
									variant="h6"
									sx={{ fontWeight: 700, color: m.color, fontSize: '0.95rem' }}
								>
									{formatCurrency(m.value)}
								</Typography>
							</Box>
						);
					})}
				</Box>

				{/* Chart */}
				{filteredData.length === 0 ? (
					<Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
						<Typography color="text.secondary">
							Nenhum dado encontrado para o período selecionado.
						</Typography>
					</Box>
				) : (
					<Box sx={{ flex: 1, minHeight: { xs: 250, md: 320 } }}>
						<ReactApexChart
							options={chartOptions}
							series={finalSeries}
							type={isMobile ? 'area' : 'line'}
							height="100%"
						/>
					</Box>
				)}

				{/* Footer info */}
				<Box sx={{ mt: 1, textAlign: 'right' }}>
					<Typography
						variant="caption"
						color="text.disabled"
					>
						Referência: {format(filterDate, 'MMMM/yyyy', { locale: ptBR })}
						{selectedBank !== 'Todos' ? ` · ${selectedBank}` : ''}
					</Typography>
				</Box>
			</CardContent>
		</Card>
	);
}
