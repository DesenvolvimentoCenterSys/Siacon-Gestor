import { useMemo } from 'react';
import { parseISO, format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export type AggregationType = 'sum' | 'avg' | 'last' | 'first';

export interface SeriesData {
	name: string;
	data: number[];
	type?: string;
	aggregation?: AggregationType;
}

interface UseChartDataAggregationProps {
	dates: string[]; // ISO YYYY-MM-DD
	series: SeriesData[];
	isMobile: boolean;
	maxPoints?: number;
}

interface AggregationResult {
	categories: string[];
	series: SeriesData[];
	displayDates: string[];
	period: 'daily' | 'weekly' | 'monthly';
}

export function useChartDataAggregation({
	dates,
	series,
	isMobile,
	maxPoints = 15
}: UseChartDataAggregationProps): AggregationResult {
	return useMemo(() => {
		if (!isMobile || dates.length <= maxPoints) {
			return {
				categories: dates.map((d) => format(parseISO(d), 'dd/MM')),
				series,
				displayDates: dates,
				period: 'daily'
			};
		}

		const aggregate = (period: 'weekly' | 'monthly'): AggregationResult | null => {
			const groups: Record<string, { displayDate: Date; indices: number[] }> = {};

			dates.forEach((dateStr, index) => {
				const date = parseISO(dateStr);
				let groupKey = '';
				let displayDate: Date;

				if (period === 'weekly') {
					const start = startOfWeek(date, { weekStartsOn: 0 });
					groupKey = format(start, 'yyyy-II');
					displayDate = endOfWeek(date, { weekStartsOn: 0 });
				} else {
					const start = startOfMonth(date);
					groupKey = format(start, 'yyyy-MM');
					displayDate = endOfMonth(date);
				}

				if (!groups[groupKey]) {
					groups[groupKey] = { displayDate, indices: [] };
				}

				groups[groupKey].indices.push(index);
			});

			const groupKeys = Object.keys(groups).sort();

			if (period === 'weekly' && groupKeys.length > maxPoints) {
				return null;
			}

			const newCategories = groupKeys.map((k) => {
				const d = groups[k].displayDate;
				return period === 'weekly' ? format(d, 'dd/MM') : format(d, 'MMM/yy', { locale: ptBR });
			});

			const newDisplayDates = groupKeys.map((k) => format(groups[k].displayDate, 'yyyy-MM-dd'));

			const newSeries = series.map((s) => {
				const newData = groupKeys.map((k) => {
					const { indices } = groups[k];
					const values = indices.map((i) => s.data[i]);

					if (values.length === 0) return 0;
					const method = s.aggregation || 'sum';

					switch (method) {
						case 'avg':
							return values.reduce((a, b) => a + b, 0) / values.length;
						case 'last':
							return values[values.length - 1];
						case 'first':
							return values[0];
						case 'sum':
						default:
							return values.reduce((a, b) => a + b, 0);
					}
				});

				return {
					...s,
					data: newData
				};
			});

			return {
				categories: newCategories,
				series: newSeries,
				displayDates: newDisplayDates,
				period
			};
		};
		const weekly = aggregate('weekly');

		if (weekly) return weekly;
		const monthly = aggregate('monthly');
		return monthly;
	}, [dates, series, isMobile, maxPoints]);
}
