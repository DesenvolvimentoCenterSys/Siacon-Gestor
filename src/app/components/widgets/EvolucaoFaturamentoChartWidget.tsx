import { useMemo, useState } from 'react';
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
	Button,
	Tabs,
	Tab
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import useUser from '@auth/useUser';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { useEvolucaoFaturamento, useToggleFavoriteWidget } from '../../hooks/useDashboard';
import WidgetLoading from '../ui/WidgetLoading';
import { useChartDataAggregation, SeriesData } from '../../hooks/useChartDataAggregation';

interface EvolucaoFaturamentoChartWidgetProps {
	initialIsFavorite?: boolean;
}

export function EvolucaoFaturamentoChartWidget({ initialIsFavorite = false }: EvolucaoFaturamentoChartWidgetProps) {
	const theme = useTheme();
	const { data: user } = useUser();
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('md'));
	const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

	// Mobile Series Toggle
	const [activeSeries, setActiveSeries] = useState<string>('pago');

	// Year Filter Menu
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const openMenu = Boolean(anchorEl);

	const handleClickMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleCloseMenu = () => {
		setAnchorEl(null);
	};

	const handleSelectYear = (year: number) => {
		setSelectedYear(year);
		handleCloseMenu();
	};

	// Generate last 5 years for filter
	const availableYears = useMemo(() => {
		const currentYear = new Date().getFullYear();
		return Array.from({ length: 5 }, (_, i) => currentYear - i);
	}, []);

	// Data Fetching
	const { data: chartData, isLoading } = useEvolucaoFaturamento(selectedYear);

	// Favorite Logic
	const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
	const toggleFavoriteMutation = useToggleFavoriteWidget();

	const handleToggleFavorite = () => {
		if (!user?.id) return;

		const newStatus = !isFavorite;
		setIsFavorite(newStatus);
		toggleFavoriteMutation.mutate(
			{ codUsu: Number(user.id), widgetId: 7, isFavorite: newStatus },
			{ onError: () => setIsFavorite(!newStatus) }
		);
	};

	// 1. Process Raw Data
	const rawData = useMemo(() => {
		if (!chartData?.meses) return { dates: [], series: [] };

		const sortedData = [...chartData.meses].sort((a, b) => a.mes - b.mes);

		// Convert month numbers to dates (using current year or selected year)
		// We treat the "mes" field as 1-12. Construct a dummy date YYYY-MM-01
		const dates = sortedData.map((item) => {
			const d = new Date(selectedYear, item.mes - 1, 1);
			return d.toISOString().split('T')[0]; // YYYY-MM-DD
		});

		const seriesList: SeriesData[] = [
			{ name: 'Valor Pago', data: sortedData.map((item) => item.valorPago), type: 'area', aggregation: 'sum' },
			{
				name: 'Valor Previsto',
				data: sortedData.map((item) => item.valorPrevisto),
				type: 'area',
				aggregation: 'sum'
			}
		];

		return { dates, series: seriesList };
	}, [chartData, selectedYear]);

	// 2. Aggregate Data using Hook (even for monthly data to handle layout/interactions consistently)
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
			case 'pago':
				return aggregatedData.series
					.filter((s: SeriesData) => s.name === 'Valor Pago')
					.map((s: SeriesData) => ({ ...s, color: theme.palette.success.main }));
			case 'previsto':
				return aggregatedData.series
					.filter((s: SeriesData) => s.name === 'Valor Previsto')
					.map((s: SeriesData) => ({ ...s, color: theme.palette.info.main }));
			default:
				return aggregatedData.series;
		}
	}, [aggregatedData.series, isMobile, activeSeries, theme.palette.success.main, theme.palette.info.main]);

	const chartOptions: ApexOptions = {
		chart: {
			type: 'area',
			toolbar: { show: false },
			zoom: { enabled: false },
			fontFamily: 'inherit',
			animations: {
				enabled: !isMobile
			}
		},
		colors: isMobile
			? [activeSeries === 'pago' ? theme.palette.success.main : theme.palette.info.main]
			: [theme.palette.success.main, theme.palette.info.main],
		fill: {
			type: 'gradient',
			gradient: {
				shadeIntensity: 1,
				opacityFrom: 0.7,
				opacityTo: 0.9,
				stops: [0, 90, 100]
			}
		},
		dataLabels: {
			enabled: false
		},
		stroke: {
			curve: 'smooth',
			width: isMobile ? 3 : 3
		},
		xaxis: {
			categories: aggregatedData.categories,
			labels: {
				style: {
					colors: theme.palette.text.secondary,
					fontSize: isMobile ? '10px' : '12px'
				},
				show: !isMobile || aggregatedData.categories.length < 8
			},
			axisBorder: { show: false },
			axisTicks: { show: false }
		},
		yaxis: isMobile
			? {
					labels: {
						formatter: (value) => {
							if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;

							if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;

							return value.toFixed(0);
						},
						style: { fontSize: '10px' }
					}
				}
			: {
					labels: {
						style: {
							colors: theme.palette.text.secondary,
							fontSize: '12px'
						},
						formatter: (value) => {
							if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1)}M`;

							if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}k`;

							return `R$ ${value.toFixed(0)}`;
						}
					}
				},
		grid: {
			borderColor: theme.palette.divider,
			strokeDashArray: 4,
			yaxis: {
				lines: { show: true }
			},
			xaxis: {
				lines: { show: false }
			},
			padding: {
				left: isMobile ? 10 : 20,
				right: isMobile ? 10 : 20
			}
		},
		tooltip: {
			theme: theme.palette.mode,
			y: {
				formatter(val) {
					return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
				}
			},
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
			horizontalAlign: 'right',
			offsetY: 10,
			itemMargin: {
				horizontal: 10,
				vertical: 5
			}
		}
	};

	if (isLoading) return <WidgetLoading height={350} />;

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
			<Box className="flex items-center justify-between px-6 py-4 border-b">
				<Typography className="text-lg font-semibold truncate text-primary">Evolução do Faturamento</Typography>
				<Box className="flex items-center gap-2">
					{/* Year Filter */}
					<Tooltip title="Filtrar por ano">
						<Button
							size="small"
							onClick={handleClickMenu}
							endIcon={<FuseSvgIcon size={16}>heroicons-outline:calendar</FuseSvgIcon>}
							sx={{
								mr: 2,
								borderRadius: 2,
								backgroundColor: (theme) => alpha(theme.palette.info.main, 0.1),
								color: 'info.main',
								textTransform: 'none',
								minWidth: 'auto',
								px: 2,
								'&:hover': {
									backgroundColor: (theme) => alpha(theme.palette.info.main, 0.2)
								}
							}}
						>
							<Typography
								variant="body2"
								sx={{ fontWeight: 'bold' }}
							>
								{selectedYear}
							</Typography>
						</Button>
					</Tooltip>
					<Menu
						anchorEl={anchorEl}
						open={openMenu}
						onClose={handleCloseMenu}
					>
						{availableYears.map((year) => (
							<MenuItem
								key={year}
								onClick={() => handleSelectYear(year)}
								selected={year === selectedYear}
							>
								<ListItemText>{year}</ListItemText>
							</MenuItem>
						))}
					</Menu>

					{/* Favorite Toggle */}
					<Tooltip title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}>
						<IconButton
							onClick={handleToggleFavorite}
							size="small"
						>
							<FuseSvgIcon
								sx={{ color: isFavorite ? '#FFD700' : 'inherit' }}
								size={20}
							>
								{isFavorite ? 'heroicons-solid:star' : 'heroicons-outline:star'}
							</FuseSvgIcon>
						</IconButton>
					</Tooltip>
				</Box>
			</Box>

			<CardContent
				className="p-6"
				sx={{ flexGrow: 1, p: { xs: 2, md: 3 } }}
			>
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
								bgcolor: activeSeries === 'pago' ? theme.palette.success.main : theme.palette.info.main
							}
						}}
					>
						<Tab
							value="pago"
							label="Valor Pago"
							sx={{ color: theme.palette.success.main, fontWeight: 700, minHeight: 40, py: 1 }}
						/>
						<Tab
							value="previsto"
							label="Valor Previsto"
							sx={{ color: theme.palette.info.main, fontWeight: 700, minHeight: 40, py: 1 }}
						/>
					</Tabs>
				)}

				<Box sx={{ flex: 1, minHeight: { xs: 250, md: 320 } }}>
					<ReactApexChart
						options={chartOptions}
						series={finalSeries}
						type="area"
						height="100%"
					/>
				</Box>
			</CardContent>
		</Card>
	);
}
