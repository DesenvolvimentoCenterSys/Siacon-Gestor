'use client';

import { useMemo, useState, useRef } from 'react';
import { useTheme, alpha } from '@mui/material/styles';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import {
  Card, CardContent, Typography, Box, Grid,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, useMediaQuery,
  IconButton,
} from '@mui/material';
import { format, parse, isValid } from 'date-fns';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import type { EvolucaoFinanceiraPayloadDto } from '@/types/dashboardTypes';
import { fontSize } from '@mui/system';


const currencyFmt = (v: number) =>
  v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const shortFmt = (v: number): string => {
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
  return `${v.toFixed(0)}`;
};

const MONTH_NAMES_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const parseCompetencia = (competencia: string): Date => {
  const parsed = parse(competencia, 'MM/yyyy', new Date());
  return isValid(parsed) ? parsed : new Date(0);
};

const formatCompetencia = (competencia: string): string => {
  const parsed = parseCompetencia(competencia);
  return isValid(parsed)
    ? `${MONTH_NAMES_PT[parsed.getMonth()]}/${parsed.getFullYear()}`
    : competencia;
};

interface RowDef {
  key: 'faturamento' | 'receitaEntradaCaixa' | 'despesaSaidaCaixa' | 'lucroPrejuizo';
  label: string;
  color: string;
  isNegativeRed?: boolean;
}

const ROWS: RowDef[] = [
  { key: 'faturamento',          label: 'Faturamento',          color: '#1565C0' },
  { key: 'receitaEntradaCaixa',  label: 'Receita (Entrada Cx)', color: '#23a329' },
  { key: 'despesaSaidaCaixa',    label: 'Despesas (Saída Cx)',   color: '#db2020' },
  { key: 'lucroPrejuizo',        label: 'Lucro / Prejuízo',      color: '#f1bd12', isNegativeRed: true },
];



interface KpiCardProps {
  label: string;
  value: number;
  gradientColors: [string, string];
  icon: React.ReactNode;
}

function KpiCard({ label, value, gradientColors, icon }: KpiCardProps) {
  const isNeg = value < 0;
  return (
    <Card
      elevation={3}
      sx={{
        background: `linear-gradient(135deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)`,
        color: 'white',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': { transform: 'translateY(-4px)', boxShadow: 8 },
      }}
    >
      <CardContent sx={{ position: 'relative', zIndex: 1, p: { xs: 2.5, sm: 2.5 }, '&:last-child': { pb: { xs: 2.5, sm: 2.5 } } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Typography sx={{ opacity: 0.9, fontWeight: 700, fontSize: { xs: '1.3rem', sm: '1.3rem' }, letterSpacing: 0.3 }}>
            {label}
          </Typography>
          <Box sx={{ opacity: 0.3, fontSize: 28 }}>{icon}</Box>
        </Box>
        <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.8rem', sm: '1.9rem', md: '2.1rem' }, lineHeight: 1.1 }}>
          {currencyFmt(value)}
        </Typography>
        {isNeg && (
          <Chip label="Prejuízo" size="small" sx={{ mt: 1, bgcolor: alpha('#fff', 0.25), color: 'white', fontWeight: 700, fontSize: '0.75rem' }} />
        )}
      </CardContent>
      <Box sx={{ position: 'absolute', right: -20, bottom: -20, width: 120, height: 120, borderRadius: '50%', background: alpha('#fff', 0.1), zIndex: 0 }} />
      <Box sx={{ position: 'absolute', right: 35, bottom: 35, width: 70, height: 70, borderRadius: '50%', background: alpha('#fff', 0.06), zIndex: 0 }} />
    </Card>
  );
}



const IconBanknote = () => (
  <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
  </svg>
);
const IconArrowDown = () => (
  <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6 9 12.75l4.286-4.286a11.948 11.948 0 0 1 4.306 6.43l.776 2.898m0 0 3.182-5.511m-3.182 5.51-5.511-3.181" />
  </svg>
);
const IconArrowUp = () => (
  <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.307a11.95 11.95 0 0 1 5.814-5.519l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
  </svg>
);
const IconScale = () => (
  <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.97Zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.97Z" />
  </svg>
);


const IconChevronLeft = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
  </svg>
);
const IconChevronRight = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
  </svg>
);



interface MobileMonthCardProps {
  item: any;
  index: number;
  total: number;
  theme: any;
}

function MobileMonthCard({ item, index, total, theme }: MobileMonthCardProps) {
  const lucroPrejuizoNeg = item.lucroPrejuizo < 0;
  const rows: { label: string; value: number; color: string; isSpecial?: boolean }[] = [
    { label: 'Faturamento',        value: item.faturamento,         color: '#1565C0' },
    { label: 'Receita (Entrada)',   value: item.receitaEntradaCaixa, color: '#23a329' },
    { label: 'Despesas (Saída)',    value: item.despesaSaidaCaixa,   color: '#db2020' },
    { label: 'Lucro / Prejuízo',   value: item.lucroPrejuizo,       color: lucroPrejuizoNeg ? theme.palette.error.main : '#f1bd12', isSpecial: true },
  ];

  return (
    <Box sx={{ minWidth: '100%', p: 0.5 }}>
      <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', border: `1px solid ${theme.palette.divider}` }}>
        <Box
          sx={{
            background: `linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)`,
            px: 2.5,
            py: 2.5,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography sx={{ color: 'white', fontWeight: 800, fontSize: '1.45rem', letterSpacing: 0.5 }}>
            {formatCompetencia(item.competencia)}
          </Typography>
          <Typography sx={{ color: alpha('#fff', 0.7), fontSize: '1.2rem', fontWeight: 600 }}>
            {index + 1} / {total}
          </Typography>
        </Box>

        <Box sx={{ p: 0 }}>
          {rows.map((row, i) => (
            <Box
              key={row.label}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2.5,
                py: 2.2, 
                bgcolor: i % 2 === 0 ? 'transparent' : alpha(theme.palette.action.hover, 0.04),
                borderTop: i === rows.length - 1
                  ? `2px solid ${theme.palette.divider}`
                  : `1px solid ${alpha(theme.palette.divider, 0.5)}`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: row.color, flexShrink: 0 }} />
                <Typography sx={{ fontSize: '1.25rem', fontWeight: row.isSpecial ? 700 : 500, color: theme.palette.text.secondary }}>
                  {row.label}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: row.isSpecial ? row.color : theme.palette.text.primary }}>
                {currencyFmt(row.value)}
              </Typography>
            </Box>
          ))}
        </Box>
      </Card>
    </Box>
  );
}



interface MobileCarouselProps {
  items: any[];
  theme: any;
}

function MobileCarousel({ items, theme }: MobileCarouselProps) {
  const [current, setCurrent] = useState(items.length - 1);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const goTo = (idx: number) => {
    if (idx < 0 || idx >= items.length) return;
    setCurrent(idx);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = (touchStartX.current ?? 0) - (touchEndX.current ?? 0);
    if (Math.abs(diff) > 40) {
      if (diff > 0) goTo(current + 1);
      else goTo(current - 1);
    }
  };

  return (
    <Box>
      <Box
        sx={{ overflow: 'hidden', position: 'relative' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Box
          sx={{
            display: 'flex',
            transform: `translateX(-${current * 100}%)`,
            transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {items.map((item, idx) => (
            <MobileMonthCard key={item.competencia} item={item} index={idx} total={items.length} theme={theme} />
          ))}
        </Box>
      </Box>

      {/* Controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2, gap: 1.5 }}>
        <IconButton
          size="small"
          onClick={() => goTo(current - 1)}
          disabled={current === 0}
          sx={{ bgcolor: theme.palette.action.hover, '&:not(:disabled):hover': { bgcolor: theme.palette.action.selected } }}
        >
          <IconChevronLeft />
        </IconButton>

        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
          {items.map((item, idx) => (
            <Box
              key={item.competencia}
              onClick={() => goTo(idx)}
              sx={{
                width: idx === current ? 20 : 8,
                height: 8,
                fontSize: '1.2em',
                borderRadius: 4,
                bgcolor: idx === current ? '#1565C0' : alpha('#1565C0', 0.25),
                cursor: 'pointer',
                transition: 'all 0.25s ease',
              }}
            />
          ))}
        </Box>

        <IconButton
          size="small"
          onClick={() => goTo(current + 1)}
          disabled={current === items.length - 1}
          sx={{ bgcolor: theme.palette.action.hover, '&:not(:disabled):hover': { bgcolor: theme.palette.action.selected } }}
        >
          <IconChevronRight />
        </IconButton>
      </Box>

      <Typography align="center" sx={{ mt: 1, color: 'text.secondary', fontSize: '1.1rem', fontWeight: 600 }}>
        {formatCompetencia(items[current]?.competencia ?? '')}
      </Typography>
    </Box>
  );
}



interface MobileBarChartProps {
  items: any[];
  theme: any;
}

function MobileBarChart({ items, theme }: MobileBarChartProps) {
  const barHeight = 16;
  const chartHeight = Math.max(320, items.length * 52 + 80);

  // 1. Guardamos os valores originais (com os negativos reais) para mostrar nos textos
  const originalSeries = [
    items.map((i) => i.faturamento),
    items.map((i) => i.receitaEntradaCaixa),
    items.map((i) => i.despesaSaidaCaixa),
  ];

  const options: ApexOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      fontFamily: 'inherit',
      animations: { enabled: true, speed: 500 },
      zoom: { enabled: false },
      selection: { enabled: false },
    },
    plotOptions: {
      bar: {
        horizontal: true, // "o" perdido removido daqui
        barHeight: `${barHeight}px`,
        borderRadius: 4,
        dataLabels: {
          position: 'top',         
        },
      },
    },
    colors: ['#1565C0', '#23a329', '#db2020'],
    xaxis: {
      labels: {
        style: { colors: theme.palette.text.secondary, fontSize: '10px', fontWeight: 600 },
        // Correção de tipagem: converte para Number antes de enviar ao shortFmt
        formatter: (val: string | number) => {
          const num = Number(val);
          return Number.isNaN(num) ? String(val) : shortFmt(num);
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: theme.palette.text.secondary, fontSize: '11px', fontWeight: 700 },
        maxWidth: 72,
      },
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 4,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } },
      // Aumentado o right padding para o label não ser cortado devido ao offsetX
      padding: { left: 0, right: 40, top: 0, bottom: 0 },
    },
    dataLabels: {
      enabled: true,
      textAnchor: 'start',       
      offsetX: 24, // Afastamento maior para não encostar na barra
      style: {
        fontSize: '10px',
        fontWeight: 700,
        colors: [theme.palette.text.primary],
      },
      // Exibe o valor original (com o sinal negativo real)
      formatter: (val: number, opts?: any) => {
        if (opts?.seriesIndex !== undefined && opts?.dataPointIndex !== undefined) {
          const realVal = originalSeries[opts.seriesIndex][opts.dataPointIndex];
          return shortFmt(realVal);
        }
        return shortFmt(val);
      },
      background: { enabled: false },
    },
    tooltip: {
      theme: theme.palette.mode,
      shared: false,
      intersect: true,
      y: { 
        formatter: (val: number, opts?: any) => {
          if (opts?.seriesIndex !== undefined && opts?.dataPointIndex !== undefined) {
            const realVal = originalSeries[opts.seriesIndex][opts.dataPointIndex];
            realVal;
          }
          return currencyFmt(val);
        }
      },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'left',
      fontSize: '11px',
      itemMargin: { horizontal: 8 },
      labels: { colors: theme.palette.text.primary },
    },
  };

  const optionsWithCategories: ApexOptions = {
    ...options,
    xaxis: {
      ...options.xaxis,
      categories: items.map((i) => formatCompetencia(i.competencia)),
    },
  };

  const series = [
    { name: 'Faturamento',   data: originalSeries[0].map(Math.abs) },
    { name: 'Entrada Caixa', data: originalSeries[1].map(Math.abs) },
    { name: 'Saída Caixa',   data: originalSeries[2].map(Math.abs) },
  ];

  return (
    <ReactApexChart
      options={optionsWithCategories}
      series={series}
      type="bar"
      height={chartHeight}
    />
  );
}


interface ResumoFinanceiroMensalWidgetProps {
  data: EvolucaoFinanceiraPayloadDto | undefined;
  isLoading?: boolean;
}

export function ResumoFinanceiroMensalWidget({ data, isLoading }: ResumoFinanceiroMensalWidgetProps) {
  const theme = useTheme();
  const isMobile = useThemeMediaQuery((t) => t.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  const items = useMemo(() => {
    if (!data?.items?.length) return [];
    const sorted = [...data.items].sort(
      (a, b) => parseCompetencia(a.competencia).getTime() - parseCompetencia(b.competencia).getTime()
    );
    return sorted.slice(-12);
  }, [data]);

  // ── Desktop chart options (line) ──
  const desktopChartOptions: ApexOptions = useMemo(() => ({
    chart: {
      type: 'line',
      toolbar: { show: false },
      fontFamily: 'inherit',
      animations: { enabled: true, speed: 600 },
      dropShadow: { enabled: true, color: '#000', top: 2, left: 0, blur: 4, opacity: 0.08 },
      zoom: { enabled: false },
      selection: { enabled: false },
    },
    stroke: { curve: 'smooth', width: [3, 3, 3] },
    colors: ['#1565C0', '#23a329', '#db2020'],
    markers: { size: 5, strokeWidth: 2, hover: { size: 7 } },
    xaxis: {
      categories: items.map((i) => formatCompetencia(i.competencia)),
      labels: { style: { colors: theme.palette.text.secondary, fontSize: '12px', fontWeight: '600' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: theme.palette.text.secondary, fontSize: '12px' },
        formatter: shortFmt,
      },
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 4,
      yaxis: { lines: { show: true } },
      xaxis: { lines: { show: false } },
      padding: { left: 16, right: 16 },
    },
    tooltip: {
      theme: theme.palette.mode,
      shared: true,
      intersect: false,
      y: { formatter: currencyFmt },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      fontSize: '13px',
      itemMargin: { horizontal: 10, vertical: 4 },
      labels: { colors: theme.palette.text.primary },
    },
    dataLabels: { enabled: false },
  }), [items, theme]);

  const chartSeries = useMemo(() => [
    { name: 'Faturamento',   data: items.map((i) => i.faturamento) },
    { name: 'Entrada Caixa', data: items.map((i) => i.receitaEntradaCaixa) },
    { name: 'Saída Caixa',   data: items.map((i) => i.despesaSaidaCaixa) },
  ], [items]);

  const isEmpty = !isLoading && items.length === 0;

  const cellStyle = {
    fontSize: isSmall ? '1.15rem' : '1.20rem',
    whiteSpace: 'nowrap' as const,
    py: 1.4,
    px: { xs: 0.75, sm: 1.5 },
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>


      <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, overflow: 'hidden' }}>
        <Box
          sx={{
            px: 3,
            py: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
            bgcolor: alpha(theme.palette.background.default, 0.5),
          }}
        >
          <Typography variant="h5" fontWeight={700} sx={{ fontSize: { xs: '1.75rem', sm: '1.75rem' } }}>
            Resumo Financeiro Mensal
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '1.4rem', sm: '1.4rem' } }}>
            Comparativo mensal: Faturamento · Receita · Despesas · Lucro
          </Typography>
        </Box>

        {isEmpty ? (
          <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
            <Typography>Nenhum dado encontrado. Selecione o período e clique em Pesquisar.</Typography>
          </Box>
        ) : isSmall ? (
          <Box sx={{ p: 2 }}>
            <MobileCarousel items={items} theme={theme} />
          </Box>
        ) : (
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table size="small" stickyHeader sx={{ tableLayout: 'auto' }}>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      ...cellStyle,
                      fontWeight: 700,
                      bgcolor: 'background.paper',
                      fontSize: '1.2em',
                      backgroundImage: `linear-gradient(${alpha(theme.palette.primary.main, 0.08)}, ${alpha(theme.palette.primary.main, 0.08)})`,
                      minWidth: 190,
                      position: 'sticky',
                      left: 0,
                      zIndex: 3,
                      boxShadow: '4px 0 8px -2px rgba(0,0,0,0.08)',
                    }}
                  >
                    Indicador
                  </TableCell>

                  {items.map((item) => (
                    <TableCell
                      key={item.competencia}
                      align="right"
                      sx={{
                        ...cellStyle,
                        fontWeight: 700,
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        minWidth: 125,
                        px: { xs: 1.5, sm: 1.8 },
                      }}
                    >
                      {formatCompetencia(item.competencia)}
                    </TableCell>
                  ))}

                  <TableCell
                    align="right"
                    sx={{
                      ...cellStyle,
                      fontWeight: 700,
                      bgcolor: alpha(theme.palette.primary.main, 0.15),
                      minWidth: 155,
                    }}
                  >
                    Total
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {ROWS.map((row, rowIdx) => {
                  const total = (data as any)?.[
                    row.key === 'faturamento'         ? 'totalFaturamento'         :
                    row.key === 'receitaEntradaCaixa' ? 'totalReceitaEntradaCaixa' :
                    row.key === 'despesaSaidaCaixa'   ? 'totalDespesaSaidaCaixa'   :
                                                        'totalLucroPrejuizo'
                  ] ?? 0;
                  const isLucro = row.key === 'lucroPrejuizo';

                  return (
                    <TableRow
                      key={row.key}
                      sx={{
                        bgcolor: rowIdx % 2 === 0 ? 'transparent' : alpha(theme.palette.action.hover, 0.03),
                        '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.07) },
                      }}
                    >
                      <TableCell
                        sx={{
                          ...cellStyle,
                          fontWeight: 700,
                          position: 'sticky',
                          left: 0,
                          zIndex: 1,
                          bgcolor: theme.palette.background.paper,
                          borderLeft: `4px solid ${row.color}`,
                          boxShadow: '4px 0 8px -2px rgba(0,0,0,0.05)',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                          <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: row.color, flexShrink: 0 }} />
                          {row.label}
                        </Box>
                      </TableCell>

                      {items.map((item) => {
                        const v: number = item[row.key];
                        const color = isLucro && v < 0 ? theme.palette.error.main : undefined;
                        return (
                          <TableCell key={item.competencia} align="right" sx={{ ...cellStyle, color }}>
                            <Typography
                              variant="body2"
                              fontWeight={500}
                              sx={{ color: 'inherit', fontSize: '1.3em' }}
                            >
                              {currencyFmt(v)}
                            </Typography>
                          </TableCell>
                        );
                      })}

                      <TableCell
                        align="right"
                        sx={{
                          ...cellStyle,
                          fontWeight: 800,
                          bgcolor: alpha(theme.palette.primary.main, 0.06),
                          color: isLucro && total < 0 ? theme.palette.error.main : row.color,
                        }}
                      >
                        {currencyFmt(total)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      <Grid container spacing={2}>
        {[
          {
            label: 'Faturamento Total',
            value: data?.totalFaturamento ?? 0,
            gradientColors: ['#1565C0', '#0D47A1'] as [string, string],
            icon: <IconBanknote />,
          },
          {
            label: 'Receita (Entrada Caixa)',
            value: data?.totalReceitaEntradaCaixa ?? 0,
            gradientColors: ['#23a329', '#1a7a1e'] as [string, string],
            icon: <IconArrowUp />,
          },
          {
            label: 'Despesas (Saída Caixa)',
            value: data?.totalDespesaSaidaCaixa ?? 0,
            gradientColors: ['#db2020', '#c7281d'] as [string, string],
            icon: <IconArrowDown />,
          },
          {
            label: 'Lucro / Prejuízo',
            value: data?.totalLucroPrejuizo ?? 0,
            gradientColors: (
              (data?.totalLucroPrejuizo ?? 0) < 0
                ? ['#c62828', '#b71c1c']
                : ['#f1bd12', '#c9960a']
            ) as [string, string],
            icon: <IconScale />,
          },
        ].map((kpi) => (
          <Grid key={kpi.label} item xs={12} sm={6} md={3}>
            <KpiCard {...kpi} />
          </Grid>
        ))}
      </Grid>

      {!isEmpty && (
        <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, overflow: 'hidden' }}>
          <Box
            sx={{
              px: 3,
              py: 2,
              borderBottom: `1px solid ${theme.palette.divider}`,
              bgcolor: alpha(theme.palette.background.default, 0.5),
            }}
          >
            <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1.35rem', sm: '1.5rem' } }}>
              Evolução do Período
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.95rem', sm: '1.05rem' } }}>              {isSmall
                ? 'Faturamento · Entrada · Saída por mês'
                : 'Faturamento · Entrada Caixa · Saída Caixa — mês a mês'}
            </Typography>
          </Box>
          <CardContent sx={{ p: { xs: 1.5, md: 3 } }}>
            {isSmall ? (
              <MobileBarChart items={items} theme={theme} />
            ) : (
              <Box sx={{ minHeight: { xs: 260, md: 340 } }}>
                <ReactApexChart
                  options={desktopChartOptions}
                  series={chartSeries}
                  type="line"
                  height="100%"
                />
              </Box>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}