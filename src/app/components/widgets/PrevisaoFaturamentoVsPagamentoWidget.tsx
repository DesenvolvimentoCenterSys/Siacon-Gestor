'use client';

import { useMemo } from 'react';
import { useTheme, alpha } from '@mui/material/styles';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { Card, CardContent, Typography, Grid, Box } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { PrevisaoFaturamentoPagamentoResumoDto } from '@/types/dashboardTypes';

interface GradientKPIProps {
  title: string;
  mainValue: string;
  icon: string;
  gradientColors: [string, string];
  sub?: string | null;
  compactSpaces?: boolean;
}

function GradientKPI({ title, mainValue, icon, gradientColors, sub, compactSpaces }: GradientKPIProps) {
  return (
    <Card
      elevation={3}
      sx={{
        background: `linear-gradient(135deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)`,
        color: 'white',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': { transform: 'translateY(-4px)', boxShadow: (t: any) => t.shadows[8] },
      }}
    >
      <CardContent
        sx={{
          position: 'relative',
          zIndex: 1,
          p: compactSpaces ? 1.3 : { xs: 2, sm: 2.5 },
          '&:last-child': { pb: compactSpaces ? 1.3 : { xs: 2, sm: 2.5 } },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: compactSpaces ? 0.5 : 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ opacity: 0.9, fontWeight: 700, fontSize: { xs: '1.5rem', sm: '1.25rem', md: '1.35rem' }, letterSpacing: 0.3 }}>
              {title}
            </Typography>
          </Box>
          <FuseSvgIcon size={32} sx={{ opacity: 0.3 }}>{icon}</FuseSvgIcon>
        </Box>
        <Typography sx={{ fontWeight: 800, mb: sub ? 0.5 : 0, fontSize: { xs: '2rem', sm: '2.2rem', md: '2.5rem' }, lineHeight: 1.1 }}>
          {mainValue}
        </Typography>
        {sub && (
          <Typography sx={{ opacity: 0.85, fontSize: { xs: '1.1rem', sm: '1.15rem' }, fontWeight: 500 }}>
            {sub}
          </Typography>
        )}
      </CardContent>
      <Box sx={{ position: 'absolute', right: -20, bottom: -20, width: 120, height: 120, borderRadius: '50%', background: alpha('#ffffff', 0.1), zIndex: 0 }} />
      <Box sx={{ position: 'absolute', right: 35, bottom: 35, width: 70, height: 70, borderRadius: '50%', background: alpha('#ffffff', 0.06), zIndex: 0 }} />
    </Card>
  );
}

interface PrevisaoWidgetProps {
  data: PrevisaoFaturamentoPagamentoResumoDto[];
}

export function PrevisaoFaturamentoVsPagamentoWidget({ data }: PrevisaoWidgetProps) {
  const theme = useTheme();
  const isMobile = useThemeMediaQuery((t) => t.breakpoints.down('md'));

  const { categories, receitaData, despesaData, lucroData, totals } = useMemo(() => {
    if (!data || data.length === 0) {
      return { categories: [], receitaData: [], despesaData: [], lucroData: [], totals: { totalReceita: 0, totalDespesa: 0, totalLucro: 0 } };
    }

    const sorted = [...data].sort((a, b) =>
      a.competencia.localeCompare(b.competencia, 'pt-BR', { numeric: true })
    );

    const formatCompetencia = (competencia: string): string => {
      if (!competencia) return '';

      if (/^\d{2}\/\d{4}$/.test(competencia)) {
        return competencia;
      }

      const brMatch = competencia.match(/^\d{2}\/(\d{2})\/(\d{4})$/);
      if (brMatch) {
        return `${brMatch[1]}/${brMatch[2]}`;
      }

      const iso = /^\d{4}-\d{2}-\d{2}$/.test(competencia) ? new Date(competencia) : null;
      const monthOnly = /^\d{4}-\d{2}$/.test(competencia)
        ? new Date(Number(competencia.slice(0, 4)), Number(competencia.slice(5, 7)) - 1, 1)
        : iso || new Date(competencia);

      if (!monthOnly || Number.isNaN(monthOnly.getTime())) {
        return competencia;
      }

      return format(monthOnly, 'MM/yyyy', { locale: ptBR });
    };

    return {
      categories: sorted.map((i) => formatCompetencia(i.competencia)),
      receitaData: sorted.map((i) => i.receita),
      despesaData: sorted.map((i) => i.despesa),
      lucroData: sorted.map((i) => i.lucratividade),
      totals: {
        totalReceita: sorted.reduce((s, i) => s + i.receita, 0),
        totalDespesa: sorted.reduce((s, i) => s + i.despesa, 0),
        totalLucro: sorted.reduce((s, i) => s + i.lucratividade, 0),
      },
    };
  }, [data]);

  const chartDynamicHeight = useMemo(() => {
    const baseHeight = 300;
    const itemHeight = 45; 
    const calculated = categories.length * itemHeight + 100;
    return calculated > baseHeight ? calculated : baseHeight;
  }, [categories.length]);

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatPercent = (v: number) => `${v.toFixed(1)}%`;

  const chartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      stacked: true,
      toolbar: { show: false },
      fontFamily: 'inherit',
      animations: { enabled: !isMobile },
      dropShadow: { enabled: true, color: '#000', top: 2, left: 0, blur: 3, opacity: 0.15 },
    },
    plotOptions: {
      bar: {
        horizontal: isMobile,
        columnWidth: '55%',
        barHeight: '60%',
        borderRadius: 4,
        dataLabels: {
          position: 'top',
        },
      },
    },
    colors: ['#23a329', '#fa600d', '#e4c725'],
    fill: { type: 'solid' },
    
    dataLabels: {
      enabled: isMobile,
      offsetX: 24,
      style: {
        fontSize: '10px',
        fontWeight: 600,
        colors: [theme.palette.text.primary],
      },
      formatter: (val: number, opts?: any) => {
        const originalSeriesArray = [receitaData, despesaData, lucroData];
        if (opts && opts.seriesIndex !== undefined && opts.dataPointIndex !== undefined) {
          const realVal = originalSeriesArray[opts.seriesIndex]?.[opts.dataPointIndex] ?? val;
          if (Math.abs(realVal) >= 1_000_000) return `${(realVal / 1_000_000).toFixed(1)}M`;
          if (Math.abs(realVal) >= 1_000) return `${(realVal / 1_000).toFixed(0)}k`;
          return realVal.toFixed(0);
        }
        return val.toString();
      },
    },
    
    stroke: { show: true, width: 2, colors: ['transparent'] },
    
    xaxis: isMobile ? {
      categories,
      labels: {
        style: { colors: theme.palette.text.secondary, fontSize: '10px' },
        formatter: (v: string | number) => {
          const num = Number(v);
          if (Number.isNaN(num)) return String(v);
          if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
          if (num >= 1_000) return `${(num / 1_000).toFixed(0)}k`;
          return num.toFixed(0);
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    } : {
      categories,
      labels: { style: { colors: theme.palette.text.secondary, fontSize: '12px' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    
    yaxis: isMobile ? {
      labels: {
        style: { colors: theme.palette.text.secondary, fontSize: '11px', fontWeight: 600 },
      },
    } : {
      labels: {
        style: { colors: theme.palette.text.secondary, fontSize: '12px' },
        formatter: (v) => {
          if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1)}M`;
          if (v >= 1_000) return `R$ ${(v / 1_000).toFixed(0)}k`;
          return `R$ ${v.toFixed(0)}`;
        },
      },
    },
    
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 4,
      yaxis: { lines: { show: !isMobile } }, 
      xaxis: { lines: { show: isMobile } },  
      padding: { left: 10, right: isMobile ? 45 : 20 },
    },
   tooltip: {
      theme: theme.palette.mode,
      shared: false,
      intersect: false,
      custom: ({ series, dataPointIndex, w }: any) => {
        const receita = Number(series?.[0]?.[dataPointIndex] ?? 0);
        const despesa = Number(series?.[1]?.[dataPointIndex] ?? 0);
        const lucro = receita - despesa;
        const percentualLucro = receita !== 0 ? (lucro / receita) * 100 : 0;
        const periodo = w?.globals?.labels?.[dataPointIndex] ?? 'Período';
        const colors = ['#23a329', '#fa600d', '#e4c725'];

        const rows = [
          { label: 'Receita', value: fmt(receita), color: colors[0] },
          { label: 'Despesa', value: fmt(despesa), color: colors[1] },
          { label: 'Lucro', value: fmt(lucro), color: colors[2] },
          { label: '% Lucro', value: formatPercent(percentualLucro), color: colors[2] },
        ];

        return `
          <div style="padding:10px 12px; min-width:190px; font-family:inherit;">
            <div style="font-weight:700; margin-bottom:8px;">${periodo}</div>
            ${rows.map((row) => `
              <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; margin-bottom:6px;">
                <span style="display:flex; align-items:center; gap:6px;">
                  <span style="width:8px; height:8px; border-radius:999px; background:${row.color}; display:inline-block;"></span>
                  ${row.label}
                </span>
                <span>${row.value}</span>
              </div>
            `).join('')}
          </div>
        `;
      },
    },
    legend: {
      show: !isMobile,
      position: 'top',
      horizontalAlign: 'right',
      offsetY: 0,
      itemMargin: { horizontal: 10, vertical: 5 },
    },
    responsive: [
      { 
        breakpoint: 600, 
        options: { 
          legend: { show: true, position: 'bottom', horizontalAlign: 'center' },
        } 
      }
    ],
  };

  const series = [
    { name: 'Receita', group: 'receita', data: isMobile ? receitaData.map(Math.abs) : receitaData },
    { name: 'Despesa', group: 'despesa', data: isMobile ? despesaData.map(Math.abs) : despesaData },
    { name: 'Lucro', group: 'lucro', data: isMobile ? lucroData.map(Math.abs) : lucroData },
  ];

  const lucro = totals.totalReceita - totals.totalDespesa;

  return (
    <Card
      className="w-full shadow-sm rounded-2xl overflow-hidden"
      elevation={0}
      sx={{ border: `1px solid ${theme.palette.divider}`, height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <Box className="flex items-center justify-between px-6 py-4 border-b p-2 ml-2">
        <Typography className="text-lg font-semibold truncate text-primary ml-5 mt-10">
          Previsão Faturamento VS Pagamento
        </Typography>
      </Box>

      <CardContent className="p-6" sx={{ flexGrow: 1, p: { xs: 2, md: 3 } }}>
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={6} md={4}>
            <GradientKPI title="Receitas" mainValue={fmt(totals.totalReceita)} icon="heroicons-outline:banknotes" gradientColors={['#23a329', '#229229']} />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <GradientKPI title="Despesas" mainValue={fmt(totals.totalDespesa)} icon="heroicons-outline:credit-card" gradientColors={['#fa600d', '#f04816']} />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <GradientKPI title="Lucro" mainValue={fmt(lucro)} icon="heroicons-outline:badge-check" gradientColors={['#e4c725', '#ddbf14']} sub="Receita - Despesa" />
          </Grid>
        </Grid>

        <Box sx={{ flex: 1, minHeight: isMobile ? chartDynamicHeight : 350 }}>
          <ReactApexChart options={chartOptions} series={series} type="bar" height="100%" />
        </Box>
      </CardContent>
    </Card>
  );
}