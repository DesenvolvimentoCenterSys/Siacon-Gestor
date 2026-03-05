'use client';

import { useMemo, useState } from 'react';
import { useTheme, alpha } from '@mui/material/styles';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  Grid
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { useResumoMensalFinanceiroPorPeriodo } from '../../hooks/useDashboard';
import WidgetLoading from '../ui/WidgetLoading';

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function getDefaultStartDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  return `${year}-01`;
}

function getDefaultEndDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function monthInputToISODate(monthStr: string, isEnd: boolean): string {
  const [year, month] = monthStr.split('-');
  if (isEnd) {
    const lastDay = new Date(Number(year), Number(month), 0).getDate();
    return `${year}-${month}-${String(lastDay).padStart(2, '0')}`;
  }
  return `${year}-${month}-01`;
}

function formatMonthLabel(mes: number, year?: number): string {
  const label = MONTH_NAMES[mes - 1] || `Mês ${mes}`;
  return year ? `${label}/${year}` : label;
}

export function PrevisaoFaturamentoPorPeriodoWidget() {
  const theme = useTheme();
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('md'));

  const [startMonth, setStartMonth] = useState(getDefaultStartDate());
  const [endMonth, setEndMonth] = useState(getDefaultEndDate());
  const [appliedStart, setAppliedStart] = useState(getDefaultStartDate());
  const [appliedEnd, setAppliedEnd] = useState(getDefaultEndDate());

  const startDate = monthInputToISODate(appliedStart, false);
  const endDate = monthInputToISODate(appliedEnd, true);

  const { data, isLoading } = useResumoMensalFinanceiroPorPeriodo(startDate, endDate);

  const handleApplyFilter = () => {
    setAppliedStart(startMonth);
    setAppliedEnd(endMonth);
  };

  const { categories, cobrancaSemVencidoData, vencidoData, pagamentoData, totals } = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        categories: [] as string[],
        cobrancaSemVencidoData: [],
        vencidoData: [],
        pagamentoData: [],
        totals: { totalCobranca: 0, totalPagamento: 0, totalVencido: 0 }
      };
    }

    const sortedData = [...data].sort((a, b) => a.mes - b.mes);

    const totalCobranca = sortedData.reduce((sum, item) => sum + item.totalCobranca, 0);
    const totalPagamento = sortedData.reduce((sum, item) => sum + item.totalPagamento, 0);
    const totalVencido = sortedData.reduce((sum, item) => sum + (item.totalVencido || 0), 0);

    return {
      categories: sortedData.map((item) => formatMonthLabel(item.mes)),
      cobrancaSemVencidoData: sortedData.map((item) => {
        const vencido = item.totalVencido || 0;
        return Math.max(item.totalCobranca - vencido, 0);
      }),
      vencidoData: sortedData.map((item) => item.totalVencido || 0),
      pagamentoData: sortedData.map((item) => item.totalPagamento),
      totals: { totalCobranca, totalPagamento, totalVencido }
    };
  }, [data]);

  const chartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      stacked: true,
      toolbar: { show: false },
      fontFamily: 'inherit',
      animations: { enabled: !isMobile },
      dropShadow: {
        enabled: true,
        color: '#000',
        top: 2,
        left: 0,
        blur: 3,
        opacity: 0.15
      }
    },
    plotOptions: {
      bar: {
        columnWidth: '55%',
        borderRadius: 4,
      }
    },
    colors: [
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.error.main
    ],
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'vertical',
        shadeIntensity: 0.5,
        gradientToColors: [
          theme.palette.success.light,
          theme.palette.warning.light,
          theme.palette.error.light
        ],
        inverseColors: true,
        opacityFrom: 1,
        opacityTo: 0.8,
        stops: [0, 50, 100]
      }
    },
    dataLabels: { enabled: false },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
      categories,
      labels: {
        style: {
          colors: theme.palette.text.secondary,
          fontSize: isMobile ? '10px' : '12px'
        }
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
      yaxis: { lines: { show: true } },
      xaxis: { lines: { show: false } },
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
      }
    },
    legend: {
      show: !isMobile,
      position: 'top',
      horizontalAlign: 'right',
      offsetY: 10,
      itemMargin: { horizontal: 10, vertical: 5 }
    },
    responsive: [
      {
        breakpoint: 600,
        options: {
          legend: {
            show: true,
            position: 'bottom',
            horizontalAlign: 'center'
          }
        }
      }
    ]
  };

  const series = [
    { name: 'Previsão Faturamento', group: 'cobranca', data: cobrancaSemVencidoData },
    { name: 'Vencido / Inadimplência', group: 'cobranca', data: vencidoData },
    { name: 'Pagamento', group: 'pagamento', data: pagamentoData }
  ];

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

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
      <Box className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-4 border-b gap-3">
        <Typography className="text-lg font-semibold truncate text-primary">
          Previsão Faturamento VS Pagamento — Por Período
        </Typography>
        <Box className="flex items-center gap-2 flex-wrap">
          <TextField
            type="month"
            label="Início"
            value={startMonth}
            onChange={(e) => setStartMonth(e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 150 }}
          />
          <TextField
            type="month"
            label="Fim"
            value={endMonth}
            onChange={(e) => setEndMonth(e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 150 }}
          />
          <Button
            variant="contained"
            size="small"
            onClick={handleApplyFilter}
            startIcon={<FuseSvgIcon size={16}>heroicons-outline:funnel</FuseSvgIcon>}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 2
            }}
          >
            Filtrar
          </Button>
        </Box>
      </Box>

      {/* Painel de Totais */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          px: { xs: 2, md: 3 },
          pt: 2,
        }}
      >
        <Box
          sx={{
            flex: '1 1 auto',
            minWidth: 140,
            p: 1.5,
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.success.main, 0.08),
            borderLeft: `4px solid ${theme.palette.success.main}`,
          }}
        >
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            Total Previsão Faturamento
          </Typography>
          <Typography variant="subtitle1" fontWeight={700} color="success.main">
            {formatCurrency(totals.totalCobranca)}
          </Typography>
        </Box>

        <Box
          sx={{
            flex: '1 1 auto',
            minWidth: 140,
            p: 1.5,
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.error.main, 0.08),
            borderLeft: `4px solid ${theme.palette.error.main}`,
          }}
        >
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            Total Pagamento
          </Typography>
          <Typography variant="subtitle1" fontWeight={700} color="error.main">
            {formatCurrency(totals.totalPagamento)}
          </Typography>
        </Box>

        <Box
          sx={{
            flex: '1 1 auto',
            minWidth: 140,
            p: 1.5,
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.warning.main, 0.08),
            borderLeft: `4px solid ${theme.palette.warning.main}`,
          }}
        >
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            Total Vencido / Inadimplência
          </Typography>
          <Typography variant="subtitle1" fontWeight={700} color="warning.main">
            {formatCurrency(totals.totalVencido)}
          </Typography>
        </Box>
      </Box>

      <CardContent
        className="p-6"
        sx={{ flexGrow: 1, p: { xs: 2, md: 3 } }}
      >
        {isLoading ? (
          <WidgetLoading height={320} />
        ) : (
          <Box sx={{ flex: 1, minHeight: { xs: 250, md: 320 } }}>
            <ReactApexChart
              options={chartOptions}
              series={series}
              type="bar"
              height="100%"
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
