'use client';

import { useMemo } from 'react';
import { useSessionUrlFilter } from '@auth/useSessionUrlFilter';
import { Card, CardContent, Typography, Grid, Box } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useResumoMensalFinanceiro } from '../../hooks/useDashboard';
import WidgetLoading from '../ui/WidgetLoading';
import { yellow } from '@mui/material/colors';

const COLORS = {
  red: ['#db2020', '#c7281d'] as [string, string],
  orange: ['#fa600d', '#f04816'] as [string, string],
  green: ['#23a329', '#229229'] as [string, string],
  blue: ['#1565C0', '#0D47A1'] as [string, string],
  purple: ['#b700cf', '#7e0058'] as [string, string],
  yellow: ['#f1bd12', '#e6b000'] as [string, string],
};

interface ResumoWidgetProps {
  startDate?: string;
  endDate?: string;
  searchBy?: string;
  dataType?: 'simulacao' | 'previsto_realizado';
}
interface GradientKPIProps {
  title: string;
  mainValue: string;
  icon: string;
  gradientColors: [string, string];
  sub?: string | null;
  compactSpaces?: boolean;
}

function GradientKPI({
  title,
  mainValue,
  icon,
  gradientColors,
  sub,
  compactSpaces,
}: GradientKPIProps) {
  return (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)`,
        color: 'white',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme: any) => theme.shadows[8],
        },
      }}
      elevation={3}
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
            <Typography
              sx={{
                opacity: 0.9,
                fontWeight: 700,
                fontSize: { xs: '1.8rem', sm: '1.25rem', md: '1.35rem' },
                letterSpacing: 0.3,
              }}
            >
              {title}
            </Typography>
          </Box>
          <FuseSvgIcon
            size={32}
            sx={{
              opacity: 0.3,
            }}
          >
            {icon}
          </FuseSvgIcon>
        </Box>

        <Typography
          sx={{
            fontWeight: 800,
            mb: sub ? 0.5 : 0,
            fontSize: { xs: '2.2rem', sm: '2.0rem', md: '2.5rem' },
            lineHeight: 1.1,
          }}
        >
          {mainValue}
        </Typography>

        {sub && (
          <Typography
            sx={{
              opacity: 0.85,
              fontSize: { xs: '1.25rem', sm: '1.25rem' },
              fontWeight: 500,
            }}
          >
            {sub}
          </Typography>
        )}
      </CardContent>

      <Box
        sx={{
          position: 'absolute',
          right: -20,
          bottom: -20,
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: alpha('#ffffff', 0.1),
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          right: 35,
          bottom: 35,
          width: 70,
          height: 70,
          borderRadius: '50%',
          background: alpha('#ffffff', 0.06),
          zIndex: 0,
        }}
      />
    </Card>
  );
}

export function ResumoAnualFaturamentoVsPagamentoWidget({startDate, endDate, searchBy, dataType}: ResumoWidgetProps) {
  const theme = useTheme();
  const [selectedYear] = useSessionUrlFilter<number>(
    'financeiro_prev_fat_pag_year',
    new Date().getFullYear(),
    String,
    Number
  );

  const { data, isLoading } = useResumoMensalFinanceiro(
    selectedYear,
    startDate,
    endDate,
    searchBy,
    dataType
  );

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
    <Card
    elevation={0}
      sx={{
        border: `none`,
        background: 'transparent',
        borderRadius: 2,
        height: "100%",
        overflow: "visible"
      }}
    >

     <Grid container spacing={{ xs: 2, sm: 3 }}>
      <Grid item xs={12} sm={6} md={4}>
        <GradientKPI
          title={`Receitas`}
          mainValue={formatCurrency(totalCobranca)}
          icon="heroicons-outline:banknotes"
          gradientColors={COLORS.green}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4}>
        <GradientKPI
          title={`Despesas`}
          mainValue={formatCurrency(totalPagamento)}
          icon="heroicons-outline:credit-card"
          gradientColors={COLORS.red}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4}>
        <GradientKPI
          title={`% Lucratividade`}
          mainValue={formatCurrency(totalVencido)}
          icon="heroicons-outline:exclamation-triangle"
          gradientColors={COLORS.yellow}
        />
      </Grid>
    </Grid>
    </Card>
   
  );
}
