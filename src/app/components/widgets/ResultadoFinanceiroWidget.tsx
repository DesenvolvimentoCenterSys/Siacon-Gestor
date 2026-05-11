import { useMemo } from 'react';
import { useTheme, alpha } from '@mui/material/styles';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { format } from 'date-fns';
import type { DateFilterTab } from '../../hooks/useDateFilter';
import {
  useTotalFaturamentoPorConvenioWithFilters,
  useTotalFaturamentoPorConvenioReferenciaWithFilters,
} from '../../hooks/useDashboard';
import WidgetLoading from '../ui/WidgetLoading';

interface ResultadoFinanceiroWidgetProps {
  startDate?: Date | null;
  endDate?: Date | null;
  tab?: DateFilterTab;
  convenios?: number[];
  servicos?: number[];
  centrosCusto?: number[];
  planosContas?: number[];
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatInteger(value: number) {
  return value.toLocaleString('pt-BR');
}

export function ResultadoFinanceiroWidget({
  startDate,
  endDate,      
  tab = 'vencimento',
  convenios = [],
  servicos = [],
  centrosCusto = [],
  planosContas = [],
}: ResultadoFinanceiroWidgetProps) {
  const theme = useTheme();

  const startStr = startDate ? format(startDate, 'yyyy-MM-dd') : undefined;
  const endStr = endDate ? format(endDate, 'yyyy-MM-dd') : undefined;

  const { data: vencimentoData, isLoading: isVencimentoLoading } =
    useTotalFaturamentoPorConvenioWithFilters(
      startStr,
      endStr,
      convenios,
      servicos,
      centrosCusto,
      planosContas,
    );
  const { data: competenciaData, isLoading: isCompetenciaLoading } =
    useTotalFaturamentoPorConvenioReferenciaWithFilters(
      startStr,
      endStr,
      convenios,
      servicos,
      centrosCusto,
      planosContas,
    );

  const isVencimento = tab === 'vencimento';
  const widgetData = isVencimento ? vencimentoData : competenciaData;
  const isLoading = isVencimento ? isVencimentoLoading : isCompetenciaLoading;

  const metrics = useMemo(() => {
    if (!widgetData) {
      return {
        resultadoPrevisto: 0,
        resultadoRealizado: 0,
        quantidadeClientes: 0,
      };
    }

    return {
      resultadoPrevisto: widgetData.resultadoPrevisto ?? 0,
      resultadoRealizado: widgetData.resultadoRealizado ?? 0,
      quantidadeClientes: widgetData.quantidadeClientes ?? 0,
    };
  }, [widgetData]);

  if (isLoading) {
    return <WidgetLoading height={160} />;
  }

  return (
    <Card
      elevation={3}
      sx={{
        height: '100%',
        color: 'white',
        background: ["#29cf31", "#00a708"],
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <CardContent sx={{ position: 'relative', zIndex: 1, p: { xs: 2, sm: 3 } }}>
        <Typography
          variant="body2"
          sx={{
            opacity: 0.92,
            fontWeight: 600,
            mb: 1,
            fontSize: { xs: '1.2rem', sm: '1.3rem' },
          }}
        >
          Resultado Financeiro
        </Typography>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            mb: 0.5,
            fontSize: { xs: '2rem', sm: '2.25rem' },
          }}
        >
          {formatCurrency(metrics.resultadoRealizado)}
        </Typography>

        <Typography
          variant="caption"
          sx={{ opacity: 0.9, display: 'block', mb: 2 }}
        >
          {isVencimento ? 'Por Vencimento' : 'Por Competência'}
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
          <Box sx={{ p: 2, background: alpha('#ffffff', 0.12), borderRadius: 2 }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)', mb: 0.5, display: 'block' }}>
              Convênio/Serviços
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {formatCurrency(metrics.resultadoPrevisto)}
            </Typography>
          </Box>

          <Box sx={{ p: 2, background: alpha('#ffffff', 0.12), borderRadius: 2 }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)', mb: 0.5, display: 'block' }}>
              Clientes
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {formatInteger(metrics.quantidadeClientes)}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 1.5, p: 2, background: alpha('#ffffff', 0.12), borderRadius: 2 }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)', mb: 0.5, display: 'block' }}>
            Realizado vs Previsto
          </Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {formatCurrency(metrics.resultadoRealizado - metrics.resultadoPrevisto)}
          </Typography>
        </Box>
      </CardContent>
      <Box
        sx={{
          position: 'absolute',
          right: -24,
          bottom: -24,
          width: 110,
          height: 110,
          borderRadius: '50%',
          background: alpha('#ffffff', 0.15),
        }}
      />
    </Card>
  );
}
