'use client';

import { useMemo, useState } from 'react';
import { useSessionUrlFilter } from '@auth/useSessionUrlFilter';
import { useTheme, alpha } from '@mui/material/styles';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Tooltip,
  Menu,
  MenuItem,
  ListItemText,
  Button
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { useResumoMensalFinanceiro } from '../../hooks/useDashboard';
import WidgetLoading from '../ui/WidgetLoading';

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export function PrevisaoFaturamentoVsPagamentoWidget() {
  const theme = useTheme();
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('md'));
  const [selectedYear, setSelectedYear] = useSessionUrlFilter<number>(
    'financeiro_prev_fat_pag_year',
    new Date().getFullYear(),
    String,
    Number
  );

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

  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  }, []);

  const { data, isLoading } = useResumoMensalFinanceiro(selectedYear);

  const { categories, cobrancaData, pagamentoData } = useMemo(() => {
    if (!data || data.length === 0) {
      return { categories: MONTH_NAMES, cobrancaData: [], pagamentoData: [] };
    }

    const sortedData = [...data].sort((a, b) => a.mes - b.mes);

    return {
      categories: sortedData.map((item) => MONTH_NAMES[item.mes - 1] || `Mês ${item.mes}`),
      cobrancaData: sortedData.map((item) => item.totalCobranca),
      pagamentoData: sortedData.map((item) => item.totalPagamento)
    };
  }, [data]);

  const chartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      fontFamily: 'inherit',
      animations: {
        enabled: !isMobile
      }
    },
    plotOptions: {
      bar: {
        columnWidth: '55%',
        borderRadius: 4,
      }
    },
    colors: [theme.palette.primary.main, theme.palette.success.main],
    dataLabels: {
      enabled: false
    },
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
    { name: 'Cobrança', data: cobrancaData },
    { name: 'Pagamento', data: pagamentoData }
  ];

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
        <Typography className="text-lg font-semibold truncate text-primary">
          Previsão Faturamento VS Pagamento
        </Typography>
        <Box className="flex items-center gap-2">
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
        </Box>
      </Box>

      <CardContent
        className="p-6"
        sx={{ flexGrow: 1, p: { xs: 2, md: 3 } }}
      >
        <Box sx={{ flex: 1, minHeight: { xs: 250, md: 320 } }}>
          <ReactApexChart
            options={chartOptions}
            series={series}
            type="bar"
            height="100%"
          />
        </Box>
      </CardContent>
    </Card>
  );
}
