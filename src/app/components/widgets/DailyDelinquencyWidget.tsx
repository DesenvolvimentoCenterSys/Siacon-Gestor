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
	ListItemText,
	Avatar,
	Tabs,
	Tab
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import useUser from '@auth/useUser';
import { format, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import WidgetLoading from '../ui/WidgetLoading';
import { useDailyDelinquency, useToggleFavoriteWidget, useUserFavoriteWidgets } from '../../hooks/useDashboard';
import { useChartDataAggregation, SeriesData } from '../../hooks/useChartDataAggregation';

interface DailyDelinquencyWidgetProps {
	initialIsFavorite?: boolean;
}

const WIDGET_ID = 20;

type RangePreset = '7d' | '30d' | '90d' | 'currentMonth' | 'lastMonth';

const PRESET_LABELS: Record<RangePreset, string> = {
	'7d': 'Últimos 7 dias',
	'30d': 'Últimos 30 dias',
	'90d': 'Últimos 90 dias',
	currentMonth: 'Mês atual',
	lastMonth: 'Mês passado'
};

function getRange(preset: RangePreset): { start: Date; end: Date } {
	const today = new Date();
	switch (preset) {
		case '7d':
			return { start: subDays(today, 6), end: today };
		case '30d':
			return { start: subDays(today, 29), end: today };
		case '90d':
			return { start: subDays(today, 89), end: today };
		case 'currentMonth':
			return { start: startOfMonth(today), end: endOfMonth(today) };
		case 'lastMonth': {
			const prev = subMonths(today, 1);
			return { start: startOfMonth(prev), end: endOfMonth(prev) };
		}
		default:
			return { start: subDays(today, 29), end: today };
	}
}

export function DailyDelinquencyWidget({ initialIsFavorite = false }: DailyDelinquencyWidgetProps) {
	const theme = useTheme();
	const { data: user } = useUser();
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('md'));

	// Period selector
	const [preset, setPreset] = useState<RangePreset>('30d');
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const openMenu = Boolean(anchorEl);

	// Mobile Series Toggle
	const [activeSeries, setActiveSeries] = useState<string>('diario');

	const { start, end } = useMemo(() => getRange(preset), [preset]);
	const apiStart = useMemo(() => format(start, 'yyyy-MM-dd'), [start]);
	const apiEnd = useMemo(() => format(end, 'yyyy-MM-dd'), [end]);

	// Data
	const { data: widgetData, isLoading } = useDailyDelinquency(apiStart, apiEnd);
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

	// Colors — diária: azul metálico / vermelho escuro
	const colorDiario = '#1565C0'; // azul metálico
	const colorAcumulado = '#B71C1C'; // vermelho escuro

	// 1. Process Raw Data
	const rawData = useMemo(() => {
		if (!widgetData || widgetData.length === 0)
			return { dates: [], series: [], totals: { diario: 0, acumulado: 0 } };

		const sorted = [...widgetData].sort((a, b) => a.data.localeCompare(b.data));
		const dates = sorted.map((d) => d.data.split('T')[0]);

		const seriesList: SeriesData[] = [
			{ name: 'Diário', data: sorted.map((d) => d.valorDiario), type: 'column', aggregation: 'sum' },
			{ name: 'Acumulado', data: sorted.map((d) => d.valorAcumulado), type: 'line', aggregation: 'last' }
		];

		const totalDiario = sorted.reduce((s, d) => s + d.valorDiario, 0);
		const totalAcumulado = sorted.length > 0 ? sorted[sorted.length - 1].valorAcumulado : 0;
		const peak = sorted.reduce((max, d) => (d.valorDiario > max.valorDiario ? d : max), sorted[0]);
		const avgDiario = totalDiario / sorted.length;
		// Variation last 2 days
		const last2 = sorted.slice(-2);
		const variation =
			last2.length === 2 && last2[0].valorDiario !== 0
				? ((last2[1].valorDiario - last2[0].valorDiario) / last2[0].valorDiario) * 100
				: 0;

		return {
			dates,
			series: seriesList,
			stats: { totalDiario, totalAcumulado, peak, avgDiario, variation }
		};
	}, [widgetData]);

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
			case 'diario':
				return aggregatedData.series
					.filter((s: SeriesData) => s.name === 'Diário')
					.map((s: SeriesData) => ({ ...s, type: 'area', color: colorDiario }));
			case 'acumulado':
				return aggregatedData.series
					.filter((s: SeriesData) => s.name === 'Acumulado')
					.map((s: SeriesData) => ({ ...s, type: 'area', color: colorAcumulado }));
			default:
				return aggregatedData.series;
		}
	}, [aggregatedData.series, isMobile, activeSeries, colorDiario, colorAcumulado]);

	const formatCurrency = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

	const chartOptions: ApexOptions = {
		chart: {
			type: 'line',
			stacked: false,
			toolbar: { show: false },
			zoom: { enabled: false },
			fontFamily: 'inherit',
			animations: { enabled: !isMobile, speed: 600 }
		},
		colors: isMobile ? [activeSeries === 'diario' ? colorDiario : colorAcumulado] : [colorDiario, colorAcumulado],
		stroke: {
			width: isMobile ? 3 : [0, 3],
			curve: 'smooth',
			colors: isMobile
				? [activeSeries === 'diario' ? colorDiario : colorAcumulado]
				: ['transparent', colorAcumulado]
		},
		plotOptions: {
			bar: {
				columnWidth: '60%',
				borderRadius: 3,
				borderRadiusApplication: 'end'
			}
		},
		fill: {
			type: isMobile ? 'gradient' : ['solid', 'solid'],
			gradient: {
				shade: 'dark',
				type: 'vertical',
				shadeIntensity: 0.4,
				opacityFrom: 0.9,
				opacityTo: 0.55,
				stops: [0, 100]
			}
		},
		dataLabels: { enabled: false },
		xaxis: {
			categories: aggregatedData.categories,
			tickAmount: Math.min(12, aggregatedData.categories.length ?? 0),
			axisBorder: { show: false },
			axisTicks: { show: false },
			labels: {
				rotate: -30,
				style: { colors: theme.palette.text.secondary, fontSize: isMobile ? '10px' : '11px' },
				show: !isMobile || aggregatedData.categories.length < 8
			},
			tooltip: { enabled: false }
		},
		yaxis: isMobile
			? {
					labels: {
						formatter: (v) => {
							if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;

							return v.toFixed(0);
						},
						style: { fontSize: '10px' }
					}
				}
			: [
					{
						seriesName: 'Diário',
						min: 0,
						forceNiceScale: true,
						title: {
							text: 'Valor Diário',
							style: { color: colorDiario, fontSize: '11px' }
						},
						labels: {
							style: { colors: colorDiario },
							formatter: (v) => (v >= 1000 ? `R$${(v / 1000).toFixed(1)}k` : `R$${v.toFixed(0)}`)
						}
					},
					{
						seriesName: 'Acumulado',
						opposite: true,
						title: {
							text: 'Acumulado',
							style: { color: colorAcumulado, fontSize: '11px' }
						},
						labels: {
							style: { colors: colorAcumulado },
							formatter: (v) => (v >= 1000 ? `R$${(v / 1000).toFixed(1)}k` : `R$${v.toFixed(0)}`)
						}
					}
				],
		tooltip: {
			shared: true,
			intersect: false,
			theme: theme.palette.mode,
			x: {
				formatter: (_, opts: { dataPointIndex: number }) =>
					aggregatedData?.categories[opts.dataPointIndex] ?? ''
			},
			y: { formatter: (v) => formatCurrency(v) },
			fixed: {
				enabled: isMobile,
				position: 'topRight',
				offsetX: 0,
				offsetY: 0
			}
		},
		legend: {
			show: !isMobile,
			position: 'top',
			horizontalAlign: 'center',
			labels: { colors: theme.palette.text.secondary }
		},
		grid: {
			borderColor: theme.palette.divider,
			strokeDashArray: 3,
			padding: {
				left: isMobile ? 10 : 20,
				right: isMobile ? 10 : 20
			}
		},
		markers: {
			size: [0, 3],
			colors: [colorDiario, colorAcumulado],
			strokeWidth: 0,
			hover: { size: 6 }
		}
	};

	if (isLoading) return <WidgetLoading height={480} />;

	return (
		<Card
			elevation={0}
			sx={{
				border: `1px solid ${theme.palette.divider}`,
				display: 'flex',
				flexDirection: 'column',
				borderRadius: 3,
				overflow: 'hidden',
				background:
					theme.palette.mode === 'dark'
						? `linear-gradient(145deg, ${alpha(colorDiario, 0.07)} 0%, ${theme.palette.background.paper} 40%)`
						: `linear-gradient(145deg, ${alpha(colorDiario, 0.03)} 0%, ${theme.palette.background.paper} 40%)`
			}}
		>
			{/* ─── Header ─── */}
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					px: 3,
					py: 2.5,
					borderBottom: `1px solid ${theme.palette.divider}`,
					background: alpha(colorDiario, 0.04)
				}}
			>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
					<Avatar sx={{ bgcolor: alpha(colorDiario, 0.12), width: 40, height: 40, color: colorDiario }}>
						<FuseSvgIcon size={22}>heroicons-outline:calendar-days</FuseSvgIcon>
					</Avatar>
					<Box>
						<Typography
							variant="h6"
							sx={{ fontWeight: 700, lineHeight: 1.2 }}
						>
							Inadimplência Diária
						</Typography>
						<Typography
							variant="caption"
							sx={{ color: theme.palette.text.secondary }}
						>
							{isMobile && aggregatedData.period !== 'daily'
								? `Agrupado por ${aggregatedData.period === 'weekly' ? 'Semana' : 'Mês'}`
								: `${format(start, 'dd/MM/yyyy', { locale: ptBR })} → ${format(end, 'dd/MM/yyyy', { locale: ptBR })}`}
						</Typography>
					</Box>
				</Box>

				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					{/* Period selector */}
					<Tooltip title="Selecionar período">
						<Box
							component="button"
							onClick={(e: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(e.currentTarget)}
							sx={{
								px: 1.5,
								py: 0.5,
								borderRadius: 1.5,
								border: `1px solid ${alpha(colorDiario, 0.35)}`,
								bgcolor: alpha(colorDiario, 0.08),
								color: colorDiario,
								fontWeight: 700,
								fontSize: '0.78rem',
								cursor: 'pointer',
								display: 'flex',
								alignItems: 'center',
								gap: 0.5,
								'&:hover': { bgcolor: alpha(colorDiario, 0.15) }
							}}
						>
							<FuseSvgIcon size={14}>
								{openMenu ? 'heroicons-outline:chevron-up' : 'heroicons-outline:chevron-down'}
							</FuseSvgIcon>
							{PRESET_LABELS[preset]}
						</Box>
					</Tooltip>
					<Menu
						anchorEl={anchorEl}
						open={openMenu}
						onClose={() => setAnchorEl(null)}
					>
						{(Object.keys(PRESET_LABELS) as RangePreset[]).map((p) => (
							<MenuItem
								key={p}
								selected={p === preset}
								onClick={() => {
									setPreset(p);
									setAnchorEl(null);
								}}
							>
								<ListItemText>{PRESET_LABELS[p]}</ListItemText>
							</MenuItem>
						))}
					</Menu>

					{/* Favorite */}
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

			<CardContent sx={{ display: 'flex', flexDirection: 'column', p: 3, '&:last-child': { pb: 3 } }}>
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
								bgcolor: activeSeries === 'diario' ? colorDiario : colorAcumulado
							}
						}}
					>
						<Tab
							value="diario"
							label="Diário"
							sx={{ color: colorDiario, fontWeight: 700, minHeight: 40, py: 1 }}
						/>
						<Tab
							value="acumulado"
							label="Acumulado"
							sx={{ color: colorAcumulado, fontWeight: 700, minHeight: 40, py: 1 }}
						/>
					</Tabs>
				)}

				{/* ─── KPI Cards ─── */}
				<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
					{[
						{
							label: 'Total no Período',
							value: formatCurrency(rawData.stats?.totalDiario ?? 0),
							icon: 'heroicons-outline:banknotes',
							color: colorDiario,
							key: 'diario'
						},
						{
							label: 'Saldo Acumulado',
							value: formatCurrency(rawData.stats?.totalAcumulado ?? 0),
							icon: 'heroicons-outline:arrow-trending-up',
							color: colorAcumulado,
							key: 'acumulado'
						},
						{
							label: 'Pico Diário',
							value: rawData.stats?.peak ? formatCurrency(rawData.stats.peak.valorDiario) : '—',
							icon: 'heroicons-outline:arrow-up-circle',
							color: '#0D47A1',
							sub: rawData.stats?.peak
								? format(new Date(rawData.stats.peak.data), 'dd/MM/yy', { locale: ptBR })
								: null,
							key: 'peak'
						},
						{
							label: 'Variação (2 últimos dias)',
							value: rawData.stats
								? `${rawData.stats.variation > 0 ? '+' : ''}${rawData.stats.variation.toFixed(1)}%`
								: '—',
							icon:
								rawData.stats && rawData.stats.variation >= 0
									? 'heroicons-outline:arrow-trending-up'
									: 'heroicons-outline:arrow-trending-down',
							color: rawData.stats && rawData.stats.variation >= 0 ? colorAcumulado : '#2E7D32',
							sub: null,
							key: 'variation'
						}
					].map((card) => {
						// Filter KPI cards on mobile if needed
						if (isMobile && card.key !== activeSeries && card.key !== 'variation' && card.key !== 'peak')
							return null;

						return (
							<Box
								key={card.label}
								sx={{
									p: 2,
									borderRadius: 2,
									bgcolor: alpha(card.color, 0.06),
									border: `1px solid ${alpha(card.color, 0.18)}`
								}}
							>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
									<FuseSvgIcon
										size={17}
										sx={{ color: card.color }}
									>
										{card.icon}
									</FuseSvgIcon>
									<Typography
										sx={{
											color: theme.palette.text.secondary,
											fontWeight: 700,
											fontSize: '0.9rem'
										}}
									>
										{card.label}
									</Typography>
								</Box>
								<Typography
									sx={{ fontWeight: 800, color: card.color, fontSize: '1.6rem', lineHeight: 1.1 }}
								>
									{card.value}
								</Typography>
								{card.sub && (
									<Typography
										variant="caption"
										sx={{ color: theme.palette.text.disabled, fontSize: '0.65rem' }}
									>
										{card.sub}
									</Typography>
								)}
							</Box>
						);
					})}
				</Box>

				{/* ─── Chart ─── */}
				{!rawData ? (
					<Box sx={{ minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
						<Box sx={{ textAlign: 'center' }}>
							<FuseSvgIcon
								size={48}
								sx={{ color: alpha(colorDiario, 0.25), mb: 1 }}
							>
								heroicons-outline:face-smile
							</FuseSvgIcon>
							<Typography
								color="text.secondary"
								variant="body2"
								fontWeight={500}
							>
								Nenhuma inadimplência no período selecionado 🎉
							</Typography>
						</Box>
					</Box>
				) : (
					<Box sx={{ minHeight: 300 }}>
						<ReactApexChart
							options={chartOptions}
							series={finalSeries}
							type={isMobile ? 'area' : 'line'}
							height={320}
						/>
					</Box>
				)}
			</CardContent>
		</Card>
	);
}
