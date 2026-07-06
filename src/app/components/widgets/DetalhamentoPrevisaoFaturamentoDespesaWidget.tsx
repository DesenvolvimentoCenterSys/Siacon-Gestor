'use client';

import { useTheme, alpha } from '@mui/material/styles';
import {
  Card, CardContent, Typography, Box, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Divider, useMediaQuery, TableSortLabel,
  Stack, Grid,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns';
import { useState, useMemo } from 'react';
import type {
  DetalhamentoPrevisaoFaturamentoDespesaDto,
  DetalhamentoFaturamentoPrevistoRealizadoDto,
} from '@/types/dashboardTypes';

function parseToLocalDate(dateStr: string): Date | null {
  const trimmed = dateStr?.trim();
  if (!trimmed) return null;

  if (/^\d{4}-\d{2}$/.test(trimmed)) {
    const [year, month] = trimmed.split('-').map(Number);
    return new Date(year, month - 1, 1);
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [year, month, day] = trimmed.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
    const [day, month, year] = trimmed.split('/').map(Number);
    return new Date(year, month - 1, day);
  }

  if (/^\d{2}\/\d{4}$/.test(trimmed)) {
    const [month, year] = trimmed.split('/').map(Number);
    return new Date(year, month - 1, 1);
  }

  const candidate = new Date(trimmed);
  return Number.isNaN(candidate.getTime()) ? null : candidate;
}

function formatToCompetencia(dateStr: string): string {
  if (/^\d{2}\/\d{4}$/.test(dateStr)) {
    return dateStr;
  }

  const parsedDate = parseToLocalDate(dateStr);
  if (!parsedDate || Number.isNaN(parsedDate.getTime())) {
    return dateStr;
  }

  return format(parsedDate, 'MM/yyyy', { locale: ptBR });
}

const currencyFmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const percentFmt = (v: number) =>
  `${v.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
const intFmt = (v: number) => v.toLocaleString('pt-BR');

type Order = 'asc' | 'desc';

function stableSort<T>(array: T[], comparator: (a: T, b: T) => number): T[] {
  return [...array]
    .map((el, index) => ({ el, index }))
    .sort((a, b) => {
      const order = comparator(a.el, b.el);
      return order !== 0 ? order : a.index - b.index;
    })
    .map(({ el }) => el);
}

function getComparator<T>(order: Order, orderBy: keyof T): (a: T, b: T) => number {
  return (a, b) => {
    const valA = a[orderBy];
    const valB = b[orderBy];

    if (valA === undefined || valB === undefined) return 0;

    if (typeof valA === 'string' && typeof valB === 'string') {
      const parseComp = (s: string) => {
        const m = s.match(/^(\d{2})\/(\d{4})$/);
        if (m) return new Date(Number(m[2]), Number(m[1]) - 1, 1).getTime();
        const d = new Date(s);
        return Number.isNaN(d.getTime()) ? s : d.getTime();
      };
      const pa = parseComp(valA);
      const pb = parseComp(valB);
      if (typeof pa === 'number' && typeof pb === 'number') {
        return order === 'asc' ? pa - pb : pb - pa;
      }
      return order === 'asc'
        ? (valA as string).localeCompare(valB as string)
        : (valB as string).localeCompare(valA as string);
    }

    if (typeof valA === 'number' && typeof valB === 'number') {
      return order === 'asc' ? valA - valB : valB - valA;
    }

    return 0;
  };
}

interface TotalCardProps {
  label: string;
  value: number;
  isMoney?: boolean;
  isPercent?: boolean;
  isInt?: boolean;
  gradientColors?: [string, string];
  bold?: boolean;
}

function TotalCard({ label, value, isMoney, isPercent, isInt, gradientColors, bold }: TotalCardProps) {
  const theme = useTheme();
  const colors = gradientColors ?? ['#1565C0', '#0D47A1'];

  const formattedValue = isPercent
    ? percentFmt(value)
    : isInt
    ? intFmt(value)
    : isMoney
    ? currencyFmt(value)
    : String(value);

  return (
    <Card
      elevation={3}
      sx={{
        background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)`,
        color: 'white',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[8] },
      }}
    >
      <CardContent sx={{ position: 'relative', zIndex: 1, p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
        <Typography sx={{ opacity: 0.9, fontWeight: 700, fontSize: { xs: '0.95rem', sm: '1rem' }, letterSpacing: 0.3, mb: 1 }}>
          {label}
        </Typography>
        <Typography sx={{ fontWeight: bold ? 800 : 700, fontSize: { xs: '1.75rem', sm: '2rem', md: '2.2rem' }, lineHeight: 1.1 }}>
          {formattedValue}
        </Typography>
      </CardContent>
      <Box sx={{ position: 'absolute', right: -20, bottom: -20, width: 120, height: 120, borderRadius: '50%', background: alpha('#ffffff', 0.1), zIndex: 0 }} />
      <Box sx={{ position: 'absolute', right: 35, bottom: 35, width: 70, height: 70, borderRadius: '50%', background: alpha('#ffffff', 0.06), zIndex: 0 }} />
    </Card>
  );
}

type DetalhamentoWidgetProps =
  | {
      dataType: 'simulacao';
      data: DetalhamentoPrevisaoFaturamentoDespesaDto | null;
      startDate?: string;
      endDate?: string;
    }
  | {
      dataType: 'previsto_realizado';
      data: DetalhamentoFaturamentoPrevistoRealizadoDto | null;
      startDate?: string;
      endDate?: string;
    };

type SimulacaoKey = 'competencia' | 'mensalidade' | 'utilizacaoServico' | 'valorAjuste' | 'valorTotal' | 'contasAPagar' | 'resultadoPrevisto' | 'lucratividade';

const SIMULACAO_COLS: { label: string; key: SimulacaoKey; align: 'center' | 'right' }[] = [
  { label: 'Competência',         key: 'competencia',       align: 'center' },
  { label: 'Mensalidade',         key: 'mensalidade',       align: 'right'  },
  { label: 'Utilização / Serviço',key: 'utilizacaoServico', align: 'right'  },
  { label: 'Valor de Ajuste',     key: 'valorAjuste',       align: 'right'  },
  { label: 'Valor Total',         key: 'valorTotal',        align: 'right'  },
  { label: 'Contas à Pagar',      key: 'contasAPagar',      align: 'right'  },
  { label: 'Resultado Previsto',  key: 'resultadoPrevisto', align: 'right'  },
  { label: '% Lucratividade',     key: 'lucratividade',     align: 'right'  },
];

type PrevistoRealizadoKey =
  | 'competencia'  | 'mensalidade' | 'utilizacaoServico'
  | 'valorTotalPrevisto' | 'valorEmAberto' | 'contasPagarAberto'
  | 'valorReceitaRealizado' | 'valorDespesasRealizado' | 'resultadoRealizado';

const PREVISTO_REALIZADO_COLS: { label: string; key: PrevistoRealizadoKey; align: 'center' | 'right' }[] = [
  { label: 'Competência',             key: 'competencia',           align: 'center' },
  { label: 'Mensalidade',             key: 'mensalidade',           align: 'right'  },
  { label: 'Utilização / Serviço',    key: 'utilizacaoServico',     align: 'right'  },
  { label: 'Valor Total Previsto',    key: 'valorTotalPrevisto',    align: 'right'  },
  { label: 'Valor em Aberto',         key: 'valorEmAberto',         align: 'right'  },
  { label: 'Contas a Pagar (Aberto)', key: 'contasPagarAberto',     align: 'right'  },
  { label: 'Receita Realizada',       key: 'valorReceitaRealizado', align: 'right'  },
  { label: 'Despesas Realizadas',     key: 'valorDespesasRealizado',align: 'right'  },
  { label: 'Resultado Realizado',     key: 'resultadoRealizado',    align: 'right'  },
];


const headerCellSx = {
  fontWeight: 600,
  bgcolor: 'background.paper',
  py: 2,
  userSelect: 'none' as const,
  '& .MuiTableSortLabel-root': {
    flexDirection: 'row-reverse',
    gap: 0.5,
  },

  '& .MuiTableSortLabel-icon': {
    opacity: 0.4,
    transition: 'opacity 0.2s',
  },
  '& .MuiTableSortLabel-root:hover .MuiTableSortLabel-icon': {
    opacity: 0.7,
  },
  '& .MuiTableSortLabel-root.Mui-active .MuiTableSortLabel-icon': {
    opacity: 1,
    color: 'primary.main',
  },
  '& .MuiTableSortLabel-root.Mui-active': {
    color: 'primary.main',
  },
};

function MobileRowDataField({ label, value, isBold }: { label: string; value: string; isBold?: boolean }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.75, borderBottom: '1px dashed', borderColor: 'divider' }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body2" fontWeight={isBold ? 700 : 500} color={isBold ? 'primary.main' : 'text.primary'}>
        {value}
      </Typography>
    </Box>
  );
}

export function DetalhamentoPrevisaoFaturamentoDespesaWidget(props: DetalhamentoWidgetProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { dataType, data, startDate, endDate } = props;

  const [simOrder, setSimOrder] = useState<Order>('asc');
  const [simOrderBy, setSimOrderBy] = useState<SimulacaoKey>('competencia');

  const [prOrder, setPrOrder] = useState<Order>('asc');
  const [prOrderBy, setPrOrderBy] = useState<PrevistoRealizadoKey>('competencia');

  const handleSimSort = (col: SimulacaoKey) => {
    setSimOrder(prev => simOrderBy === col && prev === 'asc' ? 'desc' : 'asc');
    setSimOrderBy(col);
  };

  const handlePrSort = (col: PrevistoRealizadoKey) => {
    setPrOrder(prev => prOrderBy === col && prev === 'asc' ? 'desc' : 'asc');
    setPrOrderBy(col);
  };

  const competenciaInicial = startDate ? formatToCompetencia(startDate) : '';
  const competenciaFinal = endDate ? formatToCompetencia(endDate) : '';
  const periodoText =
    competenciaInicial && competenciaFinal
      ? `${competenciaInicial} a ${competenciaFinal}`
      : format(new Date(), "MMM/yyyy", { locale: ptBR });

  const emptyState = (
    <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, color: 'text.secondary', textAlign: 'center' }}>
      <FuseSvgIcon size={40} color="action">heroicons-outline:inbox</FuseSvgIcon>
      <Typography>Nenhum dado encontrado para os filtros aplicados.</Typography>
    </Box>
  );

  const scrollNotice = isMobile ? (
    <Box sx={{ px: 2, pb: 1, display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
      <FuseSvgIcon size={16} className="animate-pulse">heroicons-outline:arrows-right-left</FuseSvgIcon>
      <Typography variant="caption" fontWeight={600} sx={{ fontStyle: 'italic', textAlign: 'center' }}>
        Deslize para os lados
      </Typography>
    </Box>
  ) : null;

  if (dataType === 'simulacao') {
    const summary = data as DetalhamentoPrevisaoFaturamentoDespesaDto | null;
    const rawItems = summary?.items ?? [];

    const sortedItems = useMemo(
      () => stableSort(rawItems, getComparator(simOrder, simOrderBy)),
      [rawItems, simOrder, simOrderBy],
    );

    return (
      <Card elevation={0} sx={{ height: { xs: 'auto', md: '100%' }, overflow: 'hidden', border: `1px solid ${theme.palette.divider}` }}>
        <CardContent sx={{ p: 0, height: { xs: 'auto', md: '100%' }, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.background.default, 0.4) }}>
            <Typography variant="h6" fontWeight={700}>Detalhamento de Faturamento e Despesas</Typography>
            <Typography variant="body2" color="text.secondary">Período visualizado: {periodoText}</Typography>
          </Box>

          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {scrollNotice}
            <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: 2, overflowX: 'auto', pb: 1, mx: -2, px: 2 }}>
              <Box sx={{ flex: '0 0 210px', minWidth: 180 }}><TotalCard label="Total Mensalidade" value={summary?.totalMensalidade ?? 0} isMoney bold gradientColors={['#23a329', '#229229']} /></Box>
              <Box sx={{ flex: '0 0 210px', minWidth: 180 }}><TotalCard label="Total Utilização/Serviço" value={summary?.totalUtilizacaoServico ?? 0} isMoney gradientColors={['#fa600d', '#f04816']} /></Box>
              <Box sx={{ flex: '0 0 210px', minWidth: 180 }}><TotalCard label="Total Valor Ajuste" value={summary?.totalValorAjuste ?? 0} isMoney gradientColors={['#1565C0', '#0D47A1']} /></Box>
              <Box sx={{ flex: '0 0 210px', minWidth: 180 }}><TotalCard label="Total Valor Total" value={summary?.totalValorTotal ?? 0} isMoney gradientColors={['#7e0058', '#b700cf']} /></Box>
              <Box sx={{ flex: '0 0 210px', minWidth: 180 }}><TotalCard label="Total Contas à Pagar" value={summary?.totalContasApagar ?? 0} isMoney gradientColors={['#db2020', '#c7281d']} /></Box>
              <Box sx={{ flex: '0 0 210px', minWidth: 180 }}><TotalCard label="Total Resultado Previsto" value={summary?.totalResultadoPrevisto ?? 0} isMoney gradientColors={['#23a329', '#229229']} /></Box>
              <Box sx={{ flex: '0 0 210px', minWidth: 180 }}><TotalCard label="Total Lucratividade" value={summary?.totalLucratividade ?? 0} isPercent bold gradientColors={['#f1bd12', '#e6b000']} /></Box>
            </Box>

            <Divider />

            {rawItems.length === 0 ? emptyState : isMobile ? (
              // Renderização em Cards Exclusiva para Mobile
              <Stack spacing={2} sx={{ mt: 1 }}>
                {sortedItems.map((item) => (
                  <Card key={item.competencia} elevation={2} sx={{ borderLeft: '4px solid', borderLeftColor: 'primary.main', borderRadius: 2 }}>
                    <Box sx={{ px: 2, py: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.08), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle2" fontWeight={700} color="primary.main">
                        Competência
                      </Typography>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {formatToCompetencia(item.competencia)}
                      </Typography>
                    </Box>
                    <CardContent sx={{ p: 2, pt: 1, '&:last-child': { pb: 2 } }}>
                      <MobileRowDataField label="Mensalidade" value={currencyFmt(item.mensalidade)} />
                      <MobileRowDataField label="Utilização / Serviço" value={currencyFmt(item.utilizacaoServico)} />
                      <MobileRowDataField label="Valor de Ajuste" value={currencyFmt(item.valorAjuste)} />
                      <MobileRowDataField label="Valor Total" value={currencyFmt(item.valorTotal)} />
                      <MobileRowDataField label="Contas à Pagar" value={currencyFmt(item.contasAPagar)} />
                      <MobileRowDataField label="Resultado Previsto" value={currencyFmt(item.resultadoPrevisto)} isBold />
                      <MobileRowDataField label="% Lucratividade" value={percentFmt(item.lucratividade)} isBold />
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            ) : (
              // Renderização da Tabela Padrão para Desktop
              <TableContainer>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      {SIMULACAO_COLS.map(({ label, key, align }) => (
                        <TableCell key={key} align={align} sx={headerCellSx}>
                          <TableSortLabel
                            hideSortIcon={false}
                            active={simOrderBy === key}
                            direction={simOrderBy === key ? simOrder : 'asc'}
                            onClick={() => handleSimSort(key)}
                          >
                            {label}
                          </TableSortLabel>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedItems.map((item) => (
                      <TableRow key={item.competencia} hover>
                        <TableCell align="center"><Typography variant="body2" fontWeight={500}>{formatToCompetencia(item.competencia)}</Typography></TableCell>
                        <TableCell align="right"><Typography variant="body2" fontWeight={500}>{currencyFmt(item.mensalidade)}</Typography></TableCell>
                        <TableCell align="right"><Typography variant="body2" fontWeight={500}>{currencyFmt(item.utilizacaoServico)}</Typography></TableCell>
                        <TableCell align="right"><Typography variant="body2" fontWeight={500}>{currencyFmt(item.valorAjuste)}</Typography></TableCell>
                        <TableCell align="right"><Typography variant="body2" fontWeight={500}>{currencyFmt(item.valorTotal)}</Typography></TableCell>
                        <TableCell align="right"><Typography variant="body2" fontWeight={500}>{currencyFmt(item.contasAPagar)}</Typography></TableCell>
                        <TableCell align="right"><Typography variant="body2" fontWeight={500}>{currencyFmt(item.resultadoPrevisto)}</Typography></TableCell>
                        <TableCell align="right"><Typography variant="body2" fontWeight={500}>{percentFmt(item.lucratividade)}</Typography></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  }

  // ─── VISÃO: PREVISTO / REALIZADO ────────────────────────────────────────────
  const summary = data as DetalhamentoFaturamentoPrevistoRealizadoDto | null;
  const rawItems = summary?.items ?? [];

  const sortedItems = useMemo(
    () => stableSort(rawItems, getComparator(prOrder, prOrderBy)),
    [rawItems, prOrder, prOrderBy],
  );

  return (
    <Card elevation={0} sx={{ height: { xs: 'auto', md: '100%' }, overflow: 'hidden', border: `1px solid ${theme.palette.divider}` }}>
      <CardContent sx={{ p: 0, height: { xs: 'auto', md: '100%' }, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.background.default, 0.4) }}>
          <Typography variant="h6" fontWeight={700}>Detalhamento Faturamento Previsto / Realizado</Typography>
          <Typography variant="body2" color="text.secondary">Período visualizado: {periodoText}</Typography>
        </Box>

        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {scrollNotice}
          <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: 2, overflowX: 'auto', pb: 1, mx: -2, px: 2 }}>
            <Box sx={{ flex: '0 0 210px', minWidth: 180 }}><TotalCard label="Total Mensalidade" value={summary?.totalMensalidade ?? 0} isMoney bold gradientColors={['#23a329', '#229229']} /></Box>
            <Box sx={{ flex: '0 0 210px', minWidth: 180 }}><TotalCard label="Total Utilização/Serviço" value={summary?.totalUtilizacaoServico ?? 0} isMoney gradientColors={['#fa600d', '#f04816']} /></Box>
            <Box sx={{ flex: '0 0 210px', minWidth: 180 }}><TotalCard label="Total Valor Total Previsto" value={summary?.totalValorTotalPrevisto ?? 0} isMoney gradientColors={['#1565C0', '#0D47A1']} /></Box>
            <Box sx={{ flex: '0 0 210px', minWidth: 180 }}><TotalCard label="Resultado Realizado" value={summary?.totalResultadoRealizado ?? 0} isMoney bold gradientColors={['#7e0058', '#b700cf']} /></Box>
          </Box>

          <Divider />

          {rawItems.length === 0 ? emptyState : isMobile ? (
            <Stack spacing={2} sx={{ mt: 1 }}>
              {sortedItems.map((item) => (
                <Card key={item.competencia} elevation={2} sx={{ borderLeft: '4px solid', borderLeftColor: 'primary.main', borderRadius: 2 }}>
                  <Box sx={{ px: 2, py: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.08), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" fontWeight={700} color="primary.main">
                      Competência
                    </Typography>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {item.competencia}
                    </Typography>
                  </Box>
                  <CardContent sx={{ p: 2, pt: 1, '&:last-child': { pb: 2 } }}>
                    <MobileRowDataField label="Mensalidade" value={currencyFmt(item.mensalidade)} />
                    <MobileRowDataField label="Utilização / Serviço" value={currencyFmt(item.utilizacaoServico)} />
                    <MobileRowDataField label="Valor Total Previsto" value={currencyFmt(item.valorTotalPrevisto)} />
                    <MobileRowDataField label="Valor em Aberto" value={currencyFmt(item.valorEmAberto)} />
                    <MobileRowDataField label="Contas a Pagar (Aberto)" value={currencyFmt(item.contasPagarAberto)} />
                    <MobileRowDataField label="Receita Realizada" value={currencyFmt(item.valorReceitaRealizado)} isBold />
                    <MobileRowDataField label="Despesas Realizadas" value={currencyFmt(item.valorDespesasRealizado)} />
                    <MobileRowDataField label="Resultado Realizado" value={currencyFmt(item.resultadoRealizado)} isBold />
                  </CardContent>
                </Card>
              ))}
            </Stack>
          ) : (
            <TableContainer>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    {PREVISTO_REALIZADO_COLS.map(({ label, key, align }) => (
                      <TableCell key={key} align={align} sx={headerCellSx}>
                        <TableSortLabel
                          hideSortIcon={false}
                          active={prOrderBy === key}
                          direction={prOrderBy === key ? prOrder : 'asc'}
                          onClick={() => handlePrSort(key)}
                        >
                          {label}
                        </TableSortLabel>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedItems.map((item) => (
                    <TableRow key={item.competencia} hover>
                      <TableCell align="center"><Typography variant="body2" fontWeight={500}>{formatToCompetencia(item.competencia)}</Typography></TableCell>
                      <TableCell align="right"><Typography variant="body2" fontWeight={500}>{currencyFmt(item.mensalidade)}</Typography></TableCell>
                      <TableCell align="right"><Typography variant="body2" fontWeight={500}>{currencyFmt(item.utilizacaoServico)}</Typography></TableCell>
                      <TableCell align="right"><Typography variant="body2" fontWeight={500}>{currencyFmt(item.valorTotalPrevisto)}</Typography></TableCell>
                      <TableCell align="right"><Typography variant="body2" fontWeight={500}>{currencyFmt(item.valorEmAberto)}</Typography></TableCell>
                      <TableCell align="right"><Typography variant="body2" fontWeight={500}>{currencyFmt(item.contasPagarAberto)}</Typography></TableCell>
                      <TableCell align="right"><Typography variant="body2" fontWeight={500}>{currencyFmt(item.valorReceitaRealizado)}</Typography></TableCell>
                      <TableCell align="right"><Typography variant="body2" fontWeight={500}>{currencyFmt(item.valorDespesasRealizado)}</Typography></TableCell>
                      <TableCell align="right"><Typography variant="body2" fontWeight={500}>{currencyFmt(item.resultadoRealizado)}</Typography></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}