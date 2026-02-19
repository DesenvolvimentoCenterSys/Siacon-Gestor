import { useMemo, useState } from 'react';
import { useTheme, alpha } from '@mui/material/styles';
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
	Dialog,
	DialogContent,
	DialogActions,
	Button,
	Avatar,
	Tabs,
	Tab
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import useUser from '@auth/useUser';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import WidgetLoading from '../ui/WidgetLoading';
import { useCashFlowEvolution, useToggleFavoriteWidget } from '../../hooks/useDashboard';
import { useChartDataAggregation, SeriesData } from '../../hooks/useChartDataAggregation';

interface CashFlowEvolutionWidgetProps {
	initialIsFavorite?: boolean;
}

function MetricItem({
	label,
	value,
	color,
	money = false,
	bold = false
}: {
	label: string;
	value: number;
	color: string;
	money?: boolean;
	bold?: boolean;
}) {
	return (
		<Box sx={{ display: 'flex', flexDirection: 'column' }}>
			<Typography
				variant="caption"
				color="text.secondary"
				fontWeight={500}
			>
				{label}
			</Typography>
			<Typography
				variant="body1"
				fontWeight={bold ? 700 : 600}
				sx={{ color }}
			>
				{money
					? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
					: value.toLocaleString('pt-BR')}
			</Typography>
		</Box>
	);
}

export function CashFlowEvolutionWidget({ initialIsFavorite = false }: CashFlowEvolutionWidgetProps) {
	const theme = useTheme();
	const { data: user } = useUser();
	const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('md'));

	const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
	const [endDate, setEndDate] = useState<Date>(endOfMonth(new Date()));

	// Mobile Series Toggle
	const [activeSeries, setActiveSeries] = useState<string>('entradas');

	const apiStartDate = useMemo(() => format(startDate, 'yyyy-MM-dd'), [startDate]);
	const apiEndDate = useMemo(() => format(endDate, 'yyyy-MM-dd'), [endDate]);

	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const openMenu = Boolean(anchorEl);
	const [dateRangeOpen, setDateRangeOpen] = useState(false);
	const [tempStart, setTempStart] = useState<Date>(startDate);
	const [tempEnd, setTempEnd] = useState<Date>(endDate);

	const handleClickMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.stopPropagation();
		setAnchorEl(event.currentTarget);
	};

	const handleCloseMenu = () => setAnchorEl(null);

	const handleSelectPredefined = (days: number | 'current_month') => {
		const today = new Date();

		if (days === 'current_month') {
			setStartDate(startOfMonth(today));
			setEndDate(endOfMonth(today));
		} else {
			setStartDate(subDays(today, days));
			setEndDate(today);
		}

		handleCloseMenu();
	};

	const handleCustomRangeClick = () => {
		handleCloseMenu();
		setDateRangeOpen(true);
	};

	const handleDateRangeClose = () => {
		setDateRangeOpen(false);
		setTempStart(startDate);
		setTempEnd(endDate);
	};

	const handleDateRangeConfirm = () => {
		if (tempStart && tempEnd) {
			setStartDate(tempStart);
			setEndDate(tempEnd);
		}

		setDateRangeOpen(false);
	};

	const getFilterLabel = () => {
		const start = startDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
		const end = endDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

		if (startDate.getDate() === 1 && endDate.getDate() === new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate()) {
			const month = startDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
			return (month.charAt(0).toUpperCase() + month.slice(1)).replace(' de ', ' ');
		}

		return `${start} - ${end}`;
	};

	const { data: widgetData, isLoading } = useCashFlowEvolution(apiStartDate, apiEndDate);

	const toggleFavoriteMutation = useToggleFavoriteWidget();

	const handleToggleFavorite = (e: React.MouseEvent) => {
		e.stopPropagation();

		if (!user?.id) return;

		const newStatus = !isFavorite;
		setIsFavorite(newStatus);
		toggleFavoriteMutation.mutate(
			{ codUsu: Number(user.id), widgetId: 17, isFavorite: newStatus },
			{ onError: () => setIsFavorite(!newStatus) }
		);
	};

	// Cores metálicas
	const colorEntradas = '#2E7D32'; // Verde metálico escuro
	const colorSaidas = '#C62828'; // Vermelho metálico escuro
	const colorSaldo = theme.palette.secondary.main; // Saldo

	// 1. Process Raw Data
	const rawData = useMemo(() => {
		if (!widgetData || widgetData.length === 0)
			return { dates: [], series: [], totals: { entrada: 0, saida: 0, saldo: 0 } };

		const groupedByDate = widgetData.reduce(
			(acc, curr) => {
				const dateKey = curr.data.split('T')[0];

				if (!acc[dateKey]) {
					acc[dateKey] = {
						date: dateKey,
						totalEntrada: 0,
						totalSaida: 0,
						saldoDoDia: 0,
						saldoAcumulado: curr.saldoAcumulado
					};
				}

				acc[dateKey].totalEntrada += curr.totalEntrada;
				acc[dateKey].totalSaida += Math.abs(curr.totalSaida);
				acc[dateKey].saldoDoDia += curr.saldoDoDia;
				acc[dateKey].saldoAcumulado = curr.saldoAcumulado;
				return acc;
			},
			{} as Record<string, any>
		);

		const sortedDates = Object.keys(groupedByDate).sort();

		// Prepare series for hook
		const seriesList: SeriesData[] = [
			{
				name: 'Entradas',
				data: sortedDates.map((d) => Math.abs(groupedByDate[d].totalEntrada)),
				type: 'column',
				aggregation: 'sum'
			},
			{
				name: 'Saídas',
				data: sortedDates.map((d) => Math.abs(groupedByDate[d].totalSaida)),
				type: 'column',
				aggregation: 'sum'
			},
			{
				name: 'Saldo Acumulado',
				data: sortedDates.map((d) => groupedByDate[d].saldoAcumulado),
				type: 'line',
				aggregation: 'last'
			}
		];

		const totals = widgetData.reduce(
			(acc, curr) => ({
				entrada: acc.entrada + Math.abs(curr.totalEntrada),
				saida: acc.saida + Math.abs(curr.totalSaida),
				saldo: acc.saldo + curr.totalEntrada - Math.abs(curr.totalSaida)
			}),
			{ entrada: 0, saida: 0, saldo: 0 }
		);

		return { dates: sortedDates, series: seriesList, totals };
	}, [widgetData]);

	// 2. Aggregate Data using Hook
	const aggregatedData = useChartDataAggregation({
		dates: rawData.dates,
		series: rawData.series,
		isMobile,
		maxPoints: 12 // Reduced for mobile
	});

	// 3. Filter Series for Mobile (Single Series View)
	const finalSeries = useMemo(() => {
		if (!isMobile) return aggregatedData.series;

		switch (activeSeries) {
			case 'entradas':
				return aggregatedData.series
					.filter((s) => s.name === 'Entradas')
					.map((s) => ({ ...s, type: 'area', color: colorEntradas }));
			case 'saidas':
				return aggregatedData.series
					.filter((s) => s.name === 'Saídas')
					.map((s) => ({ ...s, type: 'area', color: colorSaidas }));
			case 'saldo':
				return aggregatedData.series
					.filter((s) => s.name === 'Saldo Acumulado')
					.map((s) => ({ ...s, type: 'area', color: colorSaldo }));
			default:
				return aggregatedData.series;
		}
	}, [aggregatedData.series, isMobile, activeSeries, colorEntradas, colorSaidas, colorSaldo]);

	const maxBarValue = useMemo(() => {
		// Find max value in displayed series to set nice scale
		return Math.max(...finalSeries.flatMap((s) => s.data), 1);
	}, [finalSeries]);

	const chartOptions: ApexOptions = {
		chart: {
			type: 'line', // Base type
			stacked: false,
			toolbar: { show: false },
			zoom: { enabled: false },
			fontFamily: 'inherit',
			animations: { enabled: !isMobile } // Disable animations on mobile
		},
		colors: isMobile
			? [activeSeries === 'entradas' ? colorEntradas : activeSeries === 'saidas' ? colorSaidas : colorSaldo]
			: [colorEntradas, colorSaidas, colorSaldo],
		stroke: {
			width: isMobile ? 3 : [0, 0, 3],
			curve: 'smooth',
			colors: isMobile
				? [activeSeries === 'entradas' ? colorEntradas : activeSeries === 'saidas' ? colorSaidas : colorSaldo]
				: ['transparent', 'transparent', colorSaldo]
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
			bar: {
				columnWidth: '55%',
				borderRadius: 3
			}
		},
		dataLabels: { enabled: false },
		xaxis: {
			categories: aggregatedData.categories,
			axisBorder: { show: false },
			axisTicks: { show: false },
			tooltip: { enabled: false },
			labels: {
				show: !isMobile || aggregatedData.categories.length < 8, // Hide dense labels on mobile
				style: {
					fontSize: isMobile ? '10px' : '12px'
				}
			}
		},
		yaxis: isMobile
			? {
				// Single Y-Axis for Mobile
				labels: {
					formatter: (value) => {
						if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(1)}k`;

						return value.toFixed(0);
					},
					style: { fontSize: '10px' }
				}
			}
			: [
				{
					seriesName: 'Entradas',
					min: 0,
					forceNiceScale: true,
					title: { text: 'Movimentação', style: { color: theme.palette.text.secondary } },
					labels: {
						style: { colors: theme.palette.text.secondary },
						formatter: (value) => {
							if (value >= 1000) return `R$${(value / 1000).toFixed(0)}k`;

							return `R$${value.toFixed(0)}`;
						}
					}
				},
				{
					seriesName: 'Saídas',
					show: false,
					min: 0,
					forceNiceScale: true
				},
				{
					seriesName: 'Saldo Acumulado',
					opposite: true,
					title: { text: 'Saldo Acumulado', style: { color: colorSaldo } },
					labels: {
						style: { colors: colorSaldo },
						formatter: (value) => {
							if (Math.abs(value) >= 1000) return `R$${(value / 1000).toFixed(0)}k`;

							return `R$${value.toFixed(0)}`;
						}
					}
				}
			],
		tooltip: {
			y: {
				formatter: (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
			},
			theme: theme.palette.mode,
			fixed: {
				enabled: isMobile,
				position: 'topRight',
				offsetX: 0,
				offsetY: 0
			}
		},
		legend: {
			show: !isMobile, // Hide default legend on mobile
			position: 'top',
			horizontalAlign: 'center'
		},
		grid: {
			borderColor: theme.palette.divider,
			strokeDashArray: 3,
			padding: {
				left: isMobile ? 10 : 20,
				right: isMobile ? 10 : 20
			}
		}
	};

	if (isLoading) return <WidgetLoading height={500} />;

	return (
		<Card
			elevation={0}
			sx={{
				height: { xs: 'auto', md: '100%' },
				overflow: { xs: 'visible', md: 'hidden' },
				border: `1px solid ${theme.palette.divider}`
			}}
		>
			<CardContent sx={{ p: 0, height: { xs: 'auto', md: '100%' }, display: 'flex', flexDirection: 'column' }}>
				{/* Header */}
				<Box
					sx={{
						p: { xs: 2, md: 3 },
						pb: 2,
						display: 'flex',
						flexDirection: { xs: 'column', sm: 'row' },
						justifyContent: 'space-between',
						alignItems: { xs: 'flex-start', sm: 'center' },
						borderBottom: `1px solid ${theme.palette.divider}`,
						gap: 2
					}}
				>
					<Box>
						<Typography
							variant="h6"
							fontWeight={700}
							sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}
						>
							Evolução do Fluxo de Caixa
						</Typography>
						<Typography
							variant="body2"
							color="text.secondary"
							sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}
						>
							{isMobile && aggregatedData.period !== 'daily'
								? `Agrupado por ${aggregatedData.period === 'weekly' ? 'Semana' : 'Mês'}`
								: `Receitas e Despesas (${startDate.getFullYear()})`}
						</Typography>
					</Box>
					<Box
						sx={{
							display: 'flex',
							alignItems: 'center',
							gap: 1,
							width: { xs: '100%', sm: 'auto' },
							justifyContent: { xs: 'space-between', sm: 'flex-end' }
						}}
					>
						<Button
							size="small"
							variant="outlined"
							onClick={handleClickMenu}
							startIcon={<FuseSvgIcon size={16}>heroicons-outline:calendar</FuseSvgIcon>}
							endIcon={<FuseSvgIcon size={16}>heroicons-solid:chevron-down</FuseSvgIcon>}
							sx={{
								borderRadius: '8px',
								textTransform: 'none',
								color: 'text.secondary',
								borderColor: theme.palette.divider,
								minHeight: 44,
								whiteSpace: 'nowrap',
								flexShrink: 0
							}}
						>
							{getFilterLabel()}
						</Button>
						<Tooltip title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}>
							<IconButton
								size="small"
								onClick={handleToggleFavorite}
								sx={{ minWidth: 44, minHeight: 44 }}
							>
								<FuseSvgIcon
									size={20}
									sx={{ color: isFavorite ? '#FFD700' : 'action.disabled' }}
								>
									{isFavorite ? 'heroicons-solid:star' : 'heroicons-outline:star'}
								</FuseSvgIcon>
							</IconButton>
						</Tooltip>
					</Box>
				</Box>

				<Box
					sx={{
						p: { xs: 2, md: 3 },
						flex: 1,
						display: 'flex',
						flexDirection: 'column',
						gap: { xs: 2, md: 3 }
					}}
				>
					{/* Mobile Series Selector */}
					{isMobile && (
						<Tabs
							value={activeSeries}
							onChange={(_, v) => setActiveSeries(v)}
							variant="fullWidth"
							indicatorColor="primary"
							textColor="inherit"
							sx={{
								minHeight: 40,
								'& .MuiTabs-indicator': {
									bgcolor:
										activeSeries === 'entradas'
											? colorEntradas
											: activeSeries === 'saidas'
												? colorSaidas
												: colorSaldo
								}
							}}
						>
							<Tab
								value="entradas"
								label="Entradas"
								sx={{ color: colorEntradas, fontWeight: 700, minHeight: 40, py: 1 }}
							/>
							<Tab
								value="saidas"
								label="Saídas"
								sx={{ color: colorSaidas, fontWeight: 700, minHeight: 40, py: 1 }}
							/>
							<Tab
								value="saldo"
								label="Saldo"
								sx={{ color: colorSaldo, fontWeight: 700, minHeight: 40, py: 1 }}
							/>
						</Tabs>
					)}

					{/* Summary Metrics - Only show relevant metric in mobile based on selection or all in desktop */}
					<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
						{(!isMobile || activeSeries === 'entradas') && (
							<Box
								sx={{
									p: 2,
									borderRadius: 2,
									bgcolor: alpha(colorEntradas, 0.08),
									border: `1px solid ${alpha(colorEntradas, 0.3)}`,
									display: 'flex',
									alignItems: 'center',
									gap: 2
								}}
							>
								<Avatar sx={{ bgcolor: alpha(colorEntradas, 0.2), color: colorEntradas }}>
									<FuseSvgIcon>heroicons-outline:arrow-trending-up</FuseSvgIcon>
								</Avatar>
								<MetricItem
									label="Total Entradas"
									value={rawData.totals.entrada}
									color={colorEntradas}
									money
									bold
								/>
							</Box>
						)}

						{(!isMobile || activeSeries === 'saidas') && (
							<Box
								sx={{
									p: 2,
									borderRadius: 2,
									bgcolor: alpha(colorSaidas, 0.08),
									border: `1px solid ${alpha(colorSaidas, 0.3)}`,
									display: 'flex',
									alignItems: 'center',
									gap: 2
								}}
							>
								<Avatar sx={{ bgcolor: alpha(colorSaidas, 0.2), color: colorSaidas }}>
									<FuseSvgIcon>heroicons-outline:arrow-trending-down</FuseSvgIcon>
								</Avatar>
								<MetricItem
									label="Total Saídas"
									value={rawData.totals.saida}
									color={colorSaidas}
									money
									bold
								/>
							</Box>
						)}

						{(!isMobile || activeSeries === 'saldo') && (
							<Box
								sx={{
									p: 2,
									borderRadius: 2,
									bgcolor: alpha(colorSaldo, 0.08),
									border: `1px solid ${alpha(colorSaldo, 0.3)}`,
									display: 'flex',
									alignItems: 'center',
									gap: 2
								}}
							>
								<Avatar sx={{ bgcolor: alpha(colorSaldo, 0.2), color: colorSaldo }}>
									<FuseSvgIcon>heroicons-outline:scale</FuseSvgIcon>
								</Avatar>
								<MetricItem
									label="Resultado do Período"
									value={rawData.totals.saldo}
									color={colorSaldo}
									money
									bold
								/>
							</Box>
						)}
					</Box>

					{/* Chart */}
					<Box sx={{ flex: 1, minHeight: { xs: 250, md: 350 } }}>
						<ReactApexChart
							options={chartOptions}
							series={finalSeries}
							type={isMobile ? 'area' : 'line'}
							height="100%"
						/>
					</Box>
				</Box>
			</CardContent>

			{/* Filter Menu */}
			<Menu
				anchorEl={anchorEl}
				open={openMenu}
				onClose={handleCloseMenu}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
				transformOrigin={{ vertical: 'top', horizontal: 'left' }}
				slotProps={{ paper: { sx: { mt: 1, minWidth: 220, borderRadius: 2, boxShadow: theme.shadows[8] } } }}
			>
				<MenuItem
					onClick={() => handleSelectPredefined('current_month')}
					selected={
						startDate.getMonth() === new Date().getMonth() && endDate.getMonth() === new Date().getMonth()
					}
				>
					<ListItemIcon>
						<FuseSvgIcon size={18}>heroicons-outline:calendar</FuseSvgIcon>
					</ListItemIcon>
					<ListItemText>Mês Atual</ListItemText>
				</MenuItem>
				<MenuItem onClick={() => handleSelectPredefined(30)}>
					<ListItemIcon>
						<FuseSvgIcon size={18}>heroicons-outline:clock</FuseSvgIcon>
					</ListItemIcon>
					<ListItemText>Últimos 30 dias</ListItemText>
				</MenuItem>
				<MenuItem onClick={() => handleSelectPredefined(90)}>
					<ListItemIcon>
						<FuseSvgIcon size={18}>heroicons-outline:clock</FuseSvgIcon>
					</ListItemIcon>
					<ListItemText>Últimos 90 dias</ListItemText>
				</MenuItem>
				<Divider sx={{ my: 0.5 }} />
				<MenuItem onClick={handleCustomRangeClick}>
					<ListItemIcon>
						<FuseSvgIcon size={18}>heroicons-outline:adjustments-horizontal</FuseSvgIcon>
					</ListItemIcon>
					<ListItemText>Personalizado...</ListItemText>
				</MenuItem>
			</Menu>

			{/* Date Range Dialog */}
			<Dialog
				open={dateRangeOpen}
				onClose={handleDateRangeClose}
				PaperProps={{ sx: { borderRadius: 3, minWidth: 320 } }}
			>
				<DialogContent sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
					<LocalizationProvider
						dateAdapter={AdapterDateFns}
						adapterLocale={ptBR}
					>
						<DatePicker
							label="Data Inicial"
							value={tempStart}
							onChange={(newValue) => setTempStart(newValue || startDate)}
							slotProps={{ textField: { fullWidth: true } }}
						/>
						<DatePicker
							label="Data Final"
							value={tempEnd}
							onChange={(newValue) => setTempEnd(newValue || endDate)}
							slotProps={{ textField: { fullWidth: true } }}
						/>
					</LocalizationProvider>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2 }}>
					<Button
						onClick={handleDateRangeClose}
						color="inherit"
					>
						Cancelar
					</Button>
					<Button
						onClick={handleDateRangeConfirm}
						variant="contained"
						color="primary"
					>
						Confirmar
					</Button>
				</DialogActions>
			</Dialog>
		</Card>
	);
}
