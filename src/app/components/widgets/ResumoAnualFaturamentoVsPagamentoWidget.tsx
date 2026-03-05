'use client';

import { useMemo } from 'react';
import { useSessionUrlFilter } from '@auth/useSessionUrlFilter';
import { Card, CardContent, Typography, Grid } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useResumoMensalFinanceiro } from '../../hooks/useDashboard';
import WidgetLoading from '../ui/WidgetLoading';

export function ResumoAnualFaturamentoVsPagamentoWidget() {
  const theme = useTheme();
  const [selectedYear] = useSessionUrlFilter<number>(
    'financeiro_prev_fat_pag_year',
    new Date().getFullYear(),
    String,
    Number
  );

  const { data, isLoading } = useResumoMensalFinanceiro(selectedYear);

  const { totalCobranca, totalPagamento, totalVencido } = useMemo(() => {
    if (!data || data.length === 0) {
      return { totalCobranca: 0, totalPagamento: 0, totalVencido: 0 };
    }

    return data.reduce(
      (acc, curr) => ({
        totalCobranca: acc.totalCobranca + curr.totalCobranca,
        totalPagamento: acc.totalPagamento + curr.totalPagamento,
        totalVencido: acc.totalVencido + (curr.totalVencido || 0)
      }),
      { totalCobranca: 0, totalPagamento: 0, totalVencido: 0 }
    );
  }, [data]);

  const saldo = totalCobranca - totalPagamento;

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  if (isLoading) return <WidgetLoading height={120} />;

  return (
    <Grid container spacing={{ xs: 2, sm: 3 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Card
          className="w-full shadow-sm rounded-2xl overflow-hidden"
          elevation={0}
          sx={{ border: `1px solid ${theme.palette.divider}` }}
        >
          <CardContent className="p-6">
            <Typography className="text-sm font-medium text-secondary mb-2 whitespace-nowrap">
              Previsão Faturamento Acumulado ({selectedYear})
            </Typography>
            <Typography
              className="text-3xl font-bold tracking-tight"
              sx={{ color: theme.palette.success.main }}
            >
              {formatCurrency(totalCobranca)}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card
          className="w-full shadow-sm rounded-2xl overflow-hidden"
          elevation={0}
          sx={{ border: `1px solid ${theme.palette.divider}` }}
        >
          <CardContent className="p-6">
            <Typography className="text-sm font-medium text-secondary mb-2 whitespace-nowrap">
              Pagamento Acumulado ({selectedYear})
            </Typography>
            <Typography
              className="text-3xl font-bold tracking-tight"
              sx={{ color: theme.palette.error.main }}
            >
              {formatCurrency(totalPagamento)}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card
          className="w-full shadow-sm rounded-2xl overflow-hidden"
          elevation={0}
          sx={{ border: `1px solid ${theme.palette.divider}` }}
        >
          <CardContent className="p-6">
            <Typography className="text-sm font-medium text-secondary mb-2 whitespace-nowrap">
              Total Vencido / Inadimplência ({selectedYear})
            </Typography>
            <Typography
              className="text-3xl font-bold tracking-tight"
              sx={{ color: theme.palette.warning.main }}
            >
              {formatCurrency(totalVencido)}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card
          className="w-full shadow-sm rounded-2xl overflow-hidden"
          elevation={0}
          sx={{ border: `1px solid ${theme.palette.divider}` }}
        >
          <CardContent className="p-6">
            <Typography className="text-sm font-medium text-secondary mb-2 whitespace-nowrap">
              Saldo / Diferença ({selectedYear})
            </Typography>
            <Typography
              className="text-3xl font-bold tracking-tight"
              sx={{ color: saldo >= 0 ? theme.palette.info.main : theme.palette.error.main }}
            >
              {formatCurrency(saldo)}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
