import { useMutation, useQuery, useQueryClient, queryOptions, UseQueryOptions } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { DashboardFaturamentoPayloadDto, EventAnalyticsDetailsDto, EventAnalyticsDto, EventGraphics, EventGroupDto, EvolucaoFinanceiraPayloadDto } from '@/types/dashboardTypes';
import { dashboardService } from '../services/dashboardService';
import { end } from '@popperjs/core';
import { __isOptionsFunction } from '@tailwindcss/typography';

export const useToggleFavoriteWidget = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({ codUsu, widgetId, isFavorite }: { codUsu: number; widgetId: number; isFavorite: boolean }) =>
      dashboardService.toggleFavoriteWidget(codUsu, widgetId, isFavorite),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['userFavoriteWidgets', variables.codUsu] });
      queryClient.invalidateQueries({ queryKey: ['allWidgets'] });
    },
    onError: async (error) => {
      console.error('Erro ao atualizar favorito', error);

      let mensagem = 'Não foi possível atualizar o favorito. Tente novamente.';
      if (error && typeof error === 'object' && 'response' in error) {
        try {
          const body = await (error as { response: Response }).response.json();
          if (body?.message) {
            mensagem = body.message;
          }
        } catch {
        }
      }

      enqueueSnackbar(mensagem, {
        variant: 'error',
        autoHideDuration: 5000,
        anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
      });
    }
  });
};

export const useDashboardFaturamentoPayload = (
  startDate?: string,
  endDate?: string,
  dataType?: 'simulacao' | 'previsto_realizado',
  searchBy?: string,
) => {
  return useQuery<DashboardFaturamentoPayloadDto>({
    queryKey: ['dashboardFaturamentoPayload', startDate, endDate, dataType, searchBy],
    queryFn: () =>
      dashboardService.getDashboardFaturamentoPayload(startDate!, endDate!, dataType!, searchBy!),
    enabled: !!(startDate && endDate && dataType && searchBy),
  });
};

export const useUserFavoriteWidgets = (codUsu?: number) => {
  return useQuery({
    queryKey: ['userFavoriteWidgets', codUsu],
    queryFn: () => dashboardService.getUserFavoriteWidgets(codUsu!),
    enabled: !!codUsu,
  });
};

export const useTotalVidas = (date?: string) => {
  return useQuery({
    queryKey: ['totalVidas', date],
    queryFn: () => dashboardService.getTotalVidas(date)
  });
};

export const useTotalEmpresas = (date?: string) => {
  return useQuery({
    queryKey: ['totalEmpresas', date],
    queryFn: () => dashboardService.getTotalEmpresas(date)
  });
};

export const useTotalCpf = (date?: string) => {
  return useQuery({
    queryKey: ['totalCpf', date],
    queryFn: () => dashboardService.getTotalCpf(date)
  });
};

export const useClientesPorFaixaEtaria = (date?: string) => {
  return useQuery({
    queryKey: ['clientesPorFaixaEtaria', date],
    queryFn: () => dashboardService.getClientesPorFaixaEtaria(date)
  });
};

export const useClientesPorSexo = (date?: string) => {
  return useQuery({
    queryKey: ['clientesPorSexo', date],
    queryFn: () => dashboardService.getClientesPorSexo(date)
  });
};

export const useAllWidgets = (codUsu?: number, widgetId?: number, isFavorite?: boolean) => {
  return useQuery({
    queryKey: ['allWidgets', codUsu, widgetId, isFavorite],
    queryFn: () => dashboardService.getAllWidgets(codUsu, widgetId, isFavorite),
    enabled: !!codUsu
  });
};

export const useNovasVidas = (date?: string) => {
  return useQuery({
    queryKey: ['novasVidas', date],
    queryFn: () => dashboardService.getNovasVidas(date)
  });
};

export const useTotalFiliados = (startDate?: string, pesquisarPor?: string) => {
  return useQuery({
    queryKey: ['totalFiliados', startDate, pesquisarPor],
    queryFn: () => dashboardService.getTotalFiliados(startDate, pesquisarPor),
    enabled: !!startDate 
  });
};

export const useVidasPorConvenio = (date?: string) => {
  return useQuery({
    queryKey: ['vidasPorConvenio', date],
    queryFn: () => dashboardService.getVidasPorConvenio(date)
  });
};

  export const useFaturamentoMensal = (startDate?: string, endDate?: string) => {
    return useQuery({
      queryKey: ['faturamentoMensal', startDate, endDate],
      queryFn: () => dashboardService.getFaturamentoMensal(startDate, endDate)
    });
  };

export const useFaturamentoMensalReferencia = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['faturamentoMensalReferencia', startDate, endDate],
    queryFn: () => dashboardService.getFaturamentoMensalReferencia(startDate, endDate)
  });
};

export const useTaxaUtilizacao = (date?: string) => {
  return useQuery({
    queryKey: ['taxaUtilizacao', date],
    queryFn: () => dashboardService.getTaxaUtilizacao(date)
  });
};

export const useMensalidadeMedia = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['mensalidadeMedia', startDate, endDate],
    queryFn: () => dashboardService.getMensalidadeMedia(startDate, endDate)
  });
};

export const useMensalidadeMediaPorConvenio = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['mensalidadeMediaPorConvenio', startDate, endDate],
    queryFn: () => dashboardService.getMensalidadeMediaPorConvenio(startDate, endDate)
  });
};

export const useEvolucaoFaturamento = (year?: number) => {
  return useQuery({
    queryKey: ['evolucaoFaturamento', year],
    queryFn: () => dashboardService.getEvolucaoFaturamento(year)
  });
};

export const useEvolucaoFaturamentoReferencia = (year?: number) => {
  return useQuery({
    queryKey: ['evolucaoFaturamentoReferencia', year],
    queryFn: () => dashboardService.getEvolucaoFaturamentoReferencia(year)
  });
};

export const useFaturamentoPorConvenio = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['faturamentoPorConvenio', startDate, endDate],
    queryFn: () => dashboardService.getFaturamentoPorConvenio(startDate, endDate)
  });
};

export const useFaturamentoPorConvenioReferencia = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['faturamentoPorConvenioReferencia', startDate, endDate],
    queryFn: () => dashboardService.getFaturamentoPorConvenioReferencia(startDate, endDate)
  });
};

export const useDependentesTitularesCount = (date?: string) => {
  return useQuery({
    queryKey: ['dependentesTitulares', date],
    queryFn: () => dashboardService.getDependentesTitularesCount(date)
  });
};

export const useTotalUsuariosConvenio = (date?: string) => {
  return useQuery({
    queryKey: ['totalUsuariosConvenio', date],
    queryFn: () => dashboardService.getTotalUsuariosConvenio(date)
  });
};

export const useTotalFaturamentoPorConvenio = (startDate?: string, searchBy?: string) => {
  return useQuery({
    queryKey: ['totalFaturamentoPorConvenio', startDate, searchBy],
    queryFn: () => dashboardService.getTotalFaturamentoPorConvenio(startDate, searchBy)
  });
};

export const useTotalFaturamentoGeral = (date?: string, searchBy?: string) => {
  return useQuery({
    queryKey: ['totalFaturamentoGeral', date, searchBy],
    queryFn: () => dashboardService.getTotalFaturamentoGeral(date, searchBy)
  });
};

export const useFilterOptions = () => {
  return useQuery({
    queryKey: ['filterOptions'],
    queryFn: () => dashboardService.getFilterOptions()
  });
};

export const useFaturamentoDetalhadoConvenio = (
  startDate?: string,
  endDate?: string,
  searchBy?: string,
  convenios?: number[],
  operadoras?: number[],
) => {
  return useQuery({
    queryKey: ['faturamentoDetalhadoConvenio', startDate, endDate, searchBy,convenios, operadoras],
    queryFn: () => dashboardService.getFaturamentoDetalhadoConvenio(startDate, endDate, searchBy, convenios, operadoras),
    enabled: !!(startDate && endDate),
  });
};

export const useTotalFaturamentoPorConvenioWithFilters = (
  startDate?: string,
  endDate?: string,
  convenios?: number[],
  servicos?: number[],
  centrosCusto?: number[],
  planosContas?: number[],
  searchBy?: string,
  dataType?: string,
) => {
  return useQuery({
    queryKey: ['totalFaturamentoPorConvenioWithFilters', startDate, endDate, convenios, servicos, centrosCusto, planosContas, searchBy, dataType],
    queryFn: () => dashboardService.getTotalFaturamentoPorConvenioWithFilters(startDate, endDate, convenios, servicos, centrosCusto, planosContas, searchBy, dataType)
  });
};

export const useTotalDespesasPorConvenio = (dateMonth?: string, tipoPesquisa?: string) => {
  return useQuery({
    queryKey: ['totalDespesasPorConvenio', dateMonth],
    queryFn: () => dashboardService.getTotalDespesasPorConvenio(dateMonth, tipoPesquisa)
  });
};

export const useTotalFaturamentoPorConvenioReferencia = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['totalFaturamentoPorConvenioReferencia', startDate, endDate],
    queryFn: () => dashboardService.getTotalFaturamentoPorConvenioReferencia(startDate, endDate)
  });
};

export const useTotalFaturamentoPorConvenioReferenciaWithFilters = (
  startDate?: string,
  endDate?: string,
  convenios?: number[],
  servicos?: number[],
  centrosCusto?: number[],
  planosContas?: number[],
  searchBy?: string,
  dataType?: string,
) => {
  return useQuery({
    queryKey: ['totalFaturamentoPorConvenioReferenciaWithFilters', startDate, endDate, convenios, servicos, centrosCusto, planosContas, searchBy, dataType],
    queryFn: () => dashboardService.getTotalFaturamentoPorConvenioReferenciaWithFilters(startDate, endDate, convenios, servicos, centrosCusto, planosContas, searchBy, dataType)
  });
};


export const useCashFlowEvolution = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['cashFlowEvolution', startDate, endDate],
    queryFn: () => dashboardService.getCashFlowEvolution(startDate, endDate)
  });
};

export const useFinancialEvolution = (startDate?: string, endDate?: string, gruposEscolhidos?: number[]) => {
  return useQuery({
    queryKey: ['financialEvolution', startDate, endDate, gruposEscolhidos],
    queryFn: () => dashboardService.getFinancialEvolution(startDate, endDate, gruposEscolhidos)
  });
};

export const useFinancialEvolutionCompetencia = (startDate?: string, endDate?: string, gruposEscolhidos?: number[]) => {
  return useQuery({
    queryKey: ['financialEvolutionCompetencia', startDate, endDate, gruposEscolhidos],
    queryFn: () => dashboardService.getFinancialEvolutionCompetencia(startDate, endDate, gruposEscolhidos)
  });
};

export const useGrupoBanco = () => {
  return useQuery({
    queryKey: ['grupoBanco'],
    queryFn: () => dashboardService.getGrupoBanco()
  });
}

export const useGetSaldoAtual= (date?:string, grupos?:number[], bancos?:number[]) => {
  return useQuery({
    queryKey: ['saldoAtual',date,grupos,bancos],
    queryFn: () => dashboardService.getGetSaldoAtual(date,grupos,bancos)
  });
}

export const useAccumulatedDelinquency = (year?: number) => {
  return useQuery({
    queryKey: ['accumulatedDelinquency', year],
    queryFn: () => dashboardService.getAccumulatedDelinquency(year)
  });
};

export const useAccumulatedDelinquencyReferencia = (year?: number) => {
  return useQuery({
    queryKey: ['accumulatedDelinquencyReferencia', year],
    queryFn: () => dashboardService.getAccumulatedDelinquencyReferencia(year)
  });
};

export const useDailyDelinquency = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['dailyDelinquency', startDate, endDate],
    queryFn: () => dashboardService.getDailyDelinquency(startDate, endDate)
  });
};

export const useDailyDelinquencyReferencia = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['dailyDelinquencyReferencia', startDate, endDate],
    queryFn: () => dashboardService.getDailyDelinquencyReferencia(startDate, endDate)
  });
};

export const useDelinquencyAging = (ano?: number) => {
  return useQuery({
    queryKey: ['delinquencyAging', ano],
    queryFn: () => dashboardService.getDelinquencyAging(ano)
  });
};

export const useDelinquencyAgingReferencia = () => {
  return useQuery({
    queryKey: ['delinquencyAgingReferencia'],
    queryFn: () => dashboardService.getDelinquencyAgingReferencia()
  });
};

export const useDelinquencySummary = (startDate?: string, endDate?: string, searchBy?: string) => {
  return useQuery({
    queryKey: ['delinquencySummary', startDate, endDate, searchBy],
    queryFn: () => dashboardService.getDelinquencySummary(startDate, endDate, searchBy)
  });
};

export const useDelinquencySummaryReferencia = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['delinquencySummaryReferencia', startDate, endDate],
    queryFn: () => dashboardService.getDelinquencySummaryReferencia(startDate, endDate)
  });
};

export const useResumoMensalFinanceiro = (
  year?: number,
  startDate?: string,
  endDate?: string,
  searchBy?: string,
  dataType?: string,
) => {
  return useQuery({
    queryKey: ['resumoMensalFinanceiro', year, startDate, endDate, searchBy, dataType],
    queryFn: () =>
      startDate && endDate
        ? dashboardService.getResumoMensalFinanceiroPorPeriodo(startDate, endDate, searchBy, dataType)
        : dashboardService.getResumoMensalFinanceiro(year, searchBy, dataType),
    enabled: !!(year || (startDate && endDate))
  });
};


export const useResumoMensalFinanceiroPorPeriodo = (
  startDate?: string,
  endDate?: string,
  searchBy?: string,
  dataType?: string,
) => {
  return useQuery({
    queryKey: ['resumoMensalFinanceiroPorPeriodo', startDate, endDate, searchBy, dataType],
    queryFn: () =>
      dashboardService.getResumoMensalFinanceiroPorPeriodo(startDate!, endDate!, searchBy, dataType),
    enabled: !!startDate && !!endDate
  });
};


export const useResumoFinanceiroMensal = (
  startDate?: string,
  endDate?: string,
) => {
  return useQuery<EvolucaoFinanceiraPayloadDto>({
    queryKey: ['resumoFinanceiroMensal', startDate, endDate],
    queryFn: () =>
      dashboardService.getEvolucaoFinanceiraPorPeriodo(startDate!, endDate!),
    enabled: !!(startDate && endDate),
    placeholderData: (prev) => prev,
  });
};

export const useEventAnalytics = (
  codEventos: number[] = [],
  codGrupos: number[] = []
) => {
  return useQuery<EventAnalyticsDto[]>({
    queryKey: ['eventAnalytics', codEventos, codGrupos],
    queryFn: () => dashboardService.getEventAnalytics(codEventos, codGrupos),
  });
};

export const useEventAnalyticsGraphics = (
  codEventos: number,
  codGrupos: number
) => {
  return useQuery<EventGraphics[]>({
    queryKey: ['eventAnalyticsGraphics', codEventos, codGrupos],
    queryFn: () => dashboardService.getEventAnalyticsGraphics(codEventos, codGrupos),
  });
};

export const useEventAnalyticsDetails = (
  codEvento: number | null,
  codGrupo: number | null,
  options?: Omit<UseQueryOptions<EventAnalyticsDetailsDto>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<EventAnalyticsDetailsDto>({
    queryKey: ['eventAnalyticsDetails', codEvento, codGrupo],
    queryFn: () => dashboardService.getEventAnalyticsDetails(codEvento!, codGrupo!),
    enabled: codEvento !== null && codGrupo !== null,
    ...options,
  });
};

export const useEventGroupFilter = () => {
  return useQuery<EventGroupDto>({
    queryKey: ['eventGroupFilter'],
    queryFn: () => dashboardService.getGruposEEventos(),
    staleTime: 5 * 60 * 1000,
  });
};