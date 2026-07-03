import { apiClient } from '@/lib/apiClient';
import {
  OverviewAcummulatedDelinquencyDto,
  TotalVidasDto,
  TotalEmpresasDto,
  TotalCpfDto,
  FaixaEtariaDto,
  ClientesPorSexoDto,
  FaturamentoMensalDto,
  TaxaUtilizacaoDto,
  MensalidadeMediaDto,
  MensalidadeMediaPorConvenioDto,
  MesFaturamentoDto,
  EvolucaoFaturamentoDto,
  FaturamentoPorConvenioDto,
  FaturamentoPorConvenioReferenciaDto,
  DependentesTitularesDto,
  ResumoUsuariosDto,
  UsuariosPorConvenioDto,
  TotalUsuariosConvenioDto,
  ResumoFaturamentoDto,
  FaturamentoDetalhadoConvenioDto,
  TotalFaturamentoPorConvenioDto,
  PagamentoCentroCustoDto,
  TotalFaturamentoDto,
  EventAnalyticsDto,
  CashFlowEvolutionDto,
  TotalFiliadosDto,
  VidasPorConvenioDto,
  NovasVidasDto,
  UsuarioDashboardWidgetDto,
  FinancialEvolutionDto,
  FinancialEvolutionResponseDto,
  AccumulatedDelinquencyDto,
  DailyDelinquencyDto,
  DelinquencyAgingDto,
  DelinquencySummaryDto,
  ResumoMensalFinanceiroDto,
  PrevisaoFaturamentoPagamentoResumoDto,
  DetalhamentoPrevisaoFaturamentoDespesaItemDto,
  DetalhamentoPrevisaoFaturamentoDespesaDto,
  DetalhamentoFaturamentoPrevistoRealizadoItemDto,
  DetalhamentoFaturamentoPrevistoRealizadoDto,
  DashboardFaturamentoPayloadDto,
  TotalDespesasPorConvenioDto,
  GrupoBancoDto,
  FiltrosDashboardDto,
  EvolucaoFinanceiraItemDto,
  EvolucaoFinanceiraPayloadDto,
  EventAnalyticsDetailsDto,
  EventGroupDto,
  EventGraphics
} from '@/types/dashboardTypes';

const dashboardBaseUrl = process.env.NODE_ENV === 'development'
  ? 'https://localhost:15001/'
  : process.env.NEXT_PUBLIC_BASE_URL;

const dashboardClient = apiClient.extend({
  prefixUrl: dashboardBaseUrl,
  hooks: {
    beforeRequest: [
      (request) => {
        if (typeof window !== 'undefined') {
          request.headers.set('Origin', window.location.origin);
        }
      }
    ]
  }
});


export const dashboardService = {
  toggleFavoriteWidget: async (codUsu: number, widgetId: number, isFavorite: boolean) => {
    return dashboardClient.post('api/UsuarioDashboardWidgets/favorite', {
      json: {
        CodUsu: codUsu,
        WidgetId: widgetId,
        IsFavorite: isFavorite
      }
    }).json();
  },
  getFilterOptions: async () : Promise<FiltrosDashboardDto> => {
    return dashboardClient.get('api/Dashboard/filtros-dashboard').json<FiltrosDashboardDto>();
  },
  getUserFavoriteWidgets: async (codUsu: number): Promise<UsuarioDashboardWidgetDto[]> => {
    return dashboardClient.get(`api/UsuarioDashboardWidgets/usuario/${codUsu}`).json<UsuarioDashboardWidgetDto[]>();
  },
  getGrupoBanco: async (): Promise<GrupoBancoDto[]> => {
    return dashboardClient.get('api/Dashboard/grupo-banco').json<GrupoBancoDto[]>();
  },
  getTotalVidas: async (date?: string): Promise<TotalVidasDto> => {
    const searchParams = date ? { date } : undefined;
    return dashboardClient.get('api/Dashboard/total-vidas', {
      searchParams
    }).json<TotalVidasDto>();
  },
  getTotalEmpresas: async (date?: string): Promise<TotalEmpresasDto> => {
    const searchParams = date ? { date } : undefined;
    return dashboardClient.get('api/Dashboard/total-empresas', {
      searchParams
    }).json<TotalEmpresasDto>();
  },
  getTotalCpf: async (date?: string): Promise<TotalCpfDto> => {
    const searchParams = date ? { date } : undefined;
    return dashboardClient.get('api/Dashboard/total-cpf', {
      searchParams
    }).json<TotalCpfDto>();
  },
  getClientesPorFaixaEtaria: async (date?: string): Promise<FaixaEtariaDto[]> => {
    const searchParams = date ? { date } : undefined;
    return dashboardClient.get('api/Dashboard/clientes-por-faixa-etaria', {
      searchParams
    }).json<FaixaEtariaDto[]>();
  },
  getClientesPorSexo: async (date?: string): Promise<ClientesPorSexoDto> => {
    const searchParams = date ? { date } : undefined;
    return dashboardClient.get('api/Dashboard/clientes-por-sexo', {
      searchParams
    }).json<ClientesPorSexoDto>();
  },

  getTotalFiliados: async (date?: string, pesquisarPor?: string): Promise<TotalFiliadosDto> => {
    const searchParams : Record<string, string> = {};
    if (date) searchParams.date = date;
    if (pesquisarPor) searchParams.pesquisarPor = pesquisarPor;
    return dashboardClient.get('api/Dashboard/total-filiados', {
      searchParams
    }).json<TotalFiliadosDto>();
  },
  getVidasPorConvenio: async (date?: string): Promise<VidasPorConvenioDto[]> => {
    const searchParams = date ? { date } : undefined;
    return dashboardClient.get('api/Dashboard/vidas-por-convenio', {
      searchParams
    }).json<VidasPorConvenioDto[]>();
  },
  getFaturamentoMensal: async (startDate?: string, endDate?: string): Promise<FaturamentoMensalDto> => {
    const searchParams: Record<string, string> = {};
    if (startDate) searchParams.startDate = startDate;
    if (endDate) searchParams.endDate = endDate;

    return dashboardClient.get('api/Dashboard/faturamento-mensal', {
      searchParams
    }).json<FaturamentoMensalDto>();
  },
  getFaturamentoMensalReferencia: async (startDate?: string, endDate?: string): Promise<FaturamentoMensalDto> => {
    const searchParams: Record<string, string> = {};
    if (startDate) searchParams.startDate = startDate;
    if (endDate) searchParams.endDate = endDate;

    return dashboardClient.get('api/Dashboard/faturamento-mensal-referencia', {
      searchParams
    }).json<FaturamentoMensalDto>();
  },
  getTaxaUtilizacao: async (date?: string): Promise<TaxaUtilizacaoDto> => {
    const searchParams = date ? { date } : undefined;
    return dashboardClient.get('api/Dashboard/taxa-utilizacao', {
      searchParams
    }).json<TaxaUtilizacaoDto>();
  },
  getMensalidadeMedia: async (startDate?: string, endDate?: string): Promise<MensalidadeMediaDto> => {
    const searchParams: Record<string, string> = {};
    if (startDate) searchParams.startDate = startDate;
    if (endDate) searchParams.endDate = endDate;

    return dashboardClient.get('api/Dashboard/mensalidade-media', {
      searchParams
    }).json<MensalidadeMediaDto>();
  },
  getMensalidadeMediaPorConvenio: async (startDate?: string, endDate?: string): Promise<MensalidadeMediaPorConvenioDto[]> => {
    const searchParams: Record<string, string> = {};
    if (startDate) searchParams.startDate = startDate;
    if (endDate) searchParams.endDate = endDate;

    return dashboardClient.get('api/Dashboard/mensalidade-media-por-convenio', {
      searchParams
    }).json<MensalidadeMediaPorConvenioDto[]>();
  },
  getEvolucaoFaturamento: async (year?: number): Promise<EvolucaoFaturamentoDto> => {
    const searchParams = year ? { year } : undefined;
    return dashboardClient.get('api/Dashboard/evolucao-faturamento', {
      searchParams
    }).json<EvolucaoFaturamentoDto>();
  },
  getEvolucaoFaturamentoReferencia: async (year?: number): Promise<EvolucaoFaturamentoDto> => {
    const searchParams = year ? { year } : undefined;
    return dashboardClient.get('api/Dashboard/evolucao-faturamento-referencia', {
      searchParams
    }).json<EvolucaoFaturamentoDto>();
  },
  getFaturamentoPorConvenio: async (startDate?: string, endDate?: string): Promise<FaturamentoPorConvenioDto[]> => {
    const searchParams: Record<string, string> = {};
    if (startDate) searchParams.startDate = startDate;
    if (endDate) searchParams.endDate = endDate;

    return dashboardClient.get('api/Dashboard/faturamento-por-convenio', {
      searchParams
    }).json<FaturamentoPorConvenioDto[]>();
  },
  getFaturamentoPorConvenioReferencia: async (startDate?: string, endDate?: string): Promise<FaturamentoPorConvenioReferenciaDto[]> => {
    const searchParams: Record<string, string> = {};
    if (startDate) searchParams.startDate = startDate;
    if (endDate) searchParams.endDate = endDate;

    return dashboardClient.get('api/Dashboard/faturamento-por-convenio-referencia', {
      searchParams
    }).json<FaturamentoPorConvenioReferenciaDto[]>();
  },
  getDependentesTitularesCount: async (date?: string): Promise<DependentesTitularesDto> => {
    const searchParams = date ? { date } : undefined;
    return dashboardClient.get('api/Dashboard/dependentes-titulares', {
      searchParams
    }).json<DependentesTitularesDto>();
  },
  getTotalUsuariosConvenio: async (date?: string): Promise<TotalUsuariosConvenioDto> => {
    const searchParams = date ? { date } : undefined;
    return dashboardClient.get('api/Dashboard/total-usuarios-convenio', {
      searchParams
    }).json<TotalUsuariosConvenioDto>();
  },
  getTotalFaturamentoPorConvenio: async (date?: string, searchBy?: string): Promise<TotalFaturamentoPorConvenioDto> => {
    const searchParams : Record<string,string> = {}
    if(date) searchParams.date = date;
    if(searchBy) searchParams.searchBy = searchBy;
    return dashboardClient.get('api/Dashboard/total-faturamento-convenio', {
      searchParams
    }).json<TotalFaturamentoPorConvenioDto>();
  },

  getTotalFaturamentoGeral: async (date?: string, searchBy?: string): Promise<TotalFaturamentoDto> => {
    const searchParams: Record<string, string> = {};
    if (date) searchParams.date = date;
    if (searchBy) searchParams.searchBy = searchBy;

    return dashboardClient.get('api/Dashboard/total-faturamento-geral', {
      searchParams
    }).json<TotalFaturamentoDto>();
  },

  getTotalFaturamentoPorConvenioWithFilters: async (
    startDate?: string,
    endDate?: string,
    convenios?: number[],
    servicos?: number[],
    centrosCusto?: number[],
    planosContas?: number[],
    searchBy?: string,
    dataType?: string,
  ): Promise<TotalFaturamentoDto> => {
    const searchParams: Record<string, string> = {};
    if (startDate) searchParams.startDate = startDate;
    if (endDate) searchParams.endDate = endDate;
    if (convenios && convenios.length > 0) searchParams.convenios = convenios.join(',');
    if (servicos && servicos.length > 0) searchParams.servicos = servicos.join(',');
    if (centrosCusto && centrosCusto.length > 0) searchParams.centrosCusto = centrosCusto.join(',');
    if (planosContas && planosContas.length > 0) searchParams.planosContas = planosContas.join(',');
    if (searchBy) searchParams.searchBy = searchBy;
    if (dataType) searchParams.dataType = dataType;

    return dashboardClient.get('api/Dashboard/total-faturamento-convenio-filters', {
      searchParams
    }).json<TotalFaturamentoDto>();
  },

  getTotalDespesasPorConvenio: async (date?: string, tipoPesquisa?: string): Promise<TotalDespesasPorConvenioDto> => {
    const searchParams : Record<string,string> = {}
    if(date) searchParams.date = date;
    if(tipoPesquisa) searchParams.tipoPesquisa = tipoPesquisa
    return dashboardClient.get('api/Dashboard/total-despesas', {
      searchParams
    }).json<TotalDespesasPorConvenioDto>();
  },

  getTotalFaturamentoPorConvenioReferencia: async (startDate?: string, endDate?: string): Promise<TotalFaturamentoPorConvenioDto> => {
    const searchParams: Record<string, string> = {};
    if (startDate) searchParams.startDate = startDate;
    if (endDate) searchParams.endDate = endDate;

    return dashboardClient.get('api/Dashboard/total-faturamento-convenio-referencia', {
      searchParams
    }).json<TotalFaturamentoPorConvenioDto>();
  },

  getTotalFaturamentoPorConvenioReferenciaWithFilters: async (
    startDate?: string,
    endDate?: string,
    convenios?: number[],
    servicos?: number[],
    centrosCusto?: number[],
    planosContas?: number[],
    searchBy?: string,
    dataType?: string,
  ): Promise<TotalFaturamentoDto> => {
    const searchParams: Record<string, string> = {};
    if (startDate) searchParams.startDate = startDate;
    if (endDate) searchParams.endDate = endDate;
    if (convenios && convenios.length > 0) searchParams.convenios = convenios.join(',');
    if (servicos && servicos.length > 0) searchParams.servicos = servicos.join(',');
    if (centrosCusto && centrosCusto.length > 0) searchParams.centrosCusto = centrosCusto.join(',');
    if (planosContas && planosContas.length > 0) searchParams.planosContas = planosContas.join(',');
    if (searchBy) searchParams.searchBy = searchBy;
    if (dataType) searchParams.dataType = dataType;

    return dashboardClient.get('api/Dashboard/total-faturamento-convenio-referencia-filters', {
      searchParams
    }).json<TotalFaturamentoDto>();
  },
  getCashFlowEvolution: async (startDate?: string, endDate?: string): Promise<CashFlowEvolutionDto[]> => {
    const searchParams: Record<string, string> = {};
    if (startDate) searchParams.startDate = startDate;
    if (endDate) searchParams.endDate = endDate;

    return dashboardClient.get('api/Dashboard/evolucao-fluxo-caixa', {
      searchParams
    }).json<CashFlowEvolutionDto[]>();
  },
  getFinancialEvolution: async (startDate?: string, endDate?: string, grupos?: number[]): Promise<FinancialEvolutionResponseDto> => {
    const searchParams: Record<string, string> = {};
    if (startDate) searchParams.startDate = startDate;
    if (endDate) searchParams.endDate = endDate;
    if (grupos && grupos.length > 0) searchParams.grupos = grupos.join(',');

    return dashboardClient.get('api/Dashboard/financial-evolution', {
      searchParams
    }).json<FinancialEvolutionResponseDto>();
  },
  getGetSaldoAtual: async (date?: string, grupos?: number[], bancos?:number[]) : Promise<number> =>{
    const searchParams: Record<string, string> = {};
    if (date) searchParams.date = date;
    if (grupos && grupos.length > 0) searchParams.grupos = grupos.join(',');
    if (bancos && bancos.length > 0) searchParams.bancos = bancos.join(',');
    return dashboardClient.get('api/Dashboard/saldo-atual-fluxo-caixa', {
      searchParams
    }).json<number>();
  },
  getFinancialEvolutionCompetencia: async (startDate?: string, endDate?: string, gruposEscolhidos?: number[]): Promise<FinancialEvolutionDto[]> => {
    const searchParams: Record<string, string> = {};
    if (startDate) searchParams.startDate = startDate;
    if (endDate) searchParams.endDate = endDate;
    if (gruposEscolhidos && gruposEscolhidos.length > 0) searchParams.grupos = gruposEscolhidos.join(',');

    return dashboardClient.get('api/Dashboard/financial-evolution-competencia', {
      searchParams
    }).json<FinancialEvolutionDto[]>();
  },
  getAccumulatedDelinquency: async (year?: number): Promise<OverviewAcummulatedDelinquencyDto> => {
    const searchParams: Record<string, string> = {};
    if (year) searchParams.year = year.toString();

    return dashboardClient.get('api/Dashboard/accumulated-delinquency', {
      searchParams
    }).json<OverviewAcummulatedDelinquencyDto>();
  },
  getAccumulatedDelinquencyReferencia: async (year?: number): Promise<AccumulatedDelinquencyDto[]> => {
    const searchParams: Record<string, string> = {};
    if (year) searchParams.year = year.toString();

    return dashboardClient.get('api/Dashboard/accumulated-delinquency-referencia', {
      searchParams
    }).json<AccumulatedDelinquencyDto[]>();
  },
  getDailyDelinquency: async (startDate?: string, endDate?: string): Promise<DailyDelinquencyDto[]> => {
    const searchParams: Record<string, string> = {};
    if (startDate) searchParams.startDate = startDate;
    if (endDate) searchParams.endDate = endDate;

    return dashboardClient.get('api/Dashboard/daily-delinquency', {
      searchParams
    }).json<DailyDelinquencyDto[]>();
  },
  getDailyDelinquencyReferencia: async (startDate?: string, endDate?: string): Promise<DailyDelinquencyDto[]> => {
    const searchParams: Record<string, string> = {};
    if (startDate) searchParams.startDate = startDate;
    if (endDate) searchParams.endDate = endDate;

    return dashboardClient.get('api/Dashboard/daily-delinquency-referencia', {
      searchParams
    }).json<DailyDelinquencyDto[]>();
  },
  getDelinquencyAging: async (referenceYear?: number): Promise<DelinquencyAgingDto[]> => {
    const searchParams: Record<string, string> = {};
    if (referenceYear) searchParams.referenceYear = referenceYear.toString();

    return dashboardClient.get('api/Dashboard/delinquency-aging', {
      searchParams
    }).json<DelinquencyAgingDto[]>();
  },
  getDelinquencyAgingReferencia: async (): Promise<DelinquencyAgingDto[]> => {
    return dashboardClient.get('api/Dashboard/delinquency-aging-referencia').json<DelinquencyAgingDto[]>();
  },
  getDelinquencySummary: async (startDate?: string, endDate?: string, searchBy?: string): Promise<DelinquencySummaryDto> => {
    const searchParams: Record<string, string> = {};
    if (startDate) searchParams.startDate = startDate;
    if (endDate) searchParams.endDate = endDate;
    if( searchBy) searchParams.searchBy = searchBy;
    return dashboardClient.get('api/Dashboard/delinquency-summary', { searchParams }).json<DelinquencySummaryDto>();
  },
  getDelinquencySummaryReferencia: async (startDate?: string, endDate?: string): Promise<DelinquencySummaryDto> => {
    const searchParams: Record<string, string> = {};
    if (startDate) searchParams.startDate = startDate;
    if (endDate) searchParams.endDate = endDate;
    return dashboardClient.get('api/Dashboard/delinquency-summary-referencia', { searchParams }).json<DelinquencySummaryDto>();
  },
  getNovasVidas: async (date?: string): Promise<NovasVidasDto> => {
    const searchParams: Record<string, string> = {};
    if (date) searchParams.date = date;
    return dashboardClient.get('api/Dashboard/novas-vidas', { searchParams }).json<NovasVidasDto>();
  },
  getAllWidgets: async (codUsu?: number, widgetId?: number, isFavorite?: boolean): Promise<UsuarioDashboardWidgetDto[]> => {
    const searchParams: Record<string, string | number | boolean> = {};
    if (codUsu) searchParams.codUsu = codUsu;
    if (widgetId) searchParams.widgetId = widgetId;
    if (isFavorite !== undefined) searchParams.isFavorite = isFavorite;

    return dashboardClient.get('api/UsuarioDashboardWidgets', {
      searchParams
    }).json<UsuarioDashboardWidgetDto[]>();
  },
  getResumoMensalFinanceiro: async (
    year?: number,
    searchBy?: string,
    dataType?: string,
  ): Promise<ResumoMensalFinanceiroDto[]> => {
    const searchParams: Record<string, string> = {};
    if (year) searchParams.year = year.toString();
    if (searchBy) searchParams.searchBy = searchBy;
    if (dataType) searchParams.dataType = dataType;

    return dashboardClient.get('api/dashboard/resumo-mensal-financeiro', {
      searchParams
    }).json<ResumoMensalFinanceiroDto[]>();
  },
  getResumoMensalFinanceiroPorPeriodo: async (
    startDate: string,
    endDate: string,
    searchBy?: string,
    dataType?: string,
  ): Promise<ResumoMensalFinanceiroDto[]> => {
    const searchParams: Record<string, string> = { startDate, endDate };
    if (searchBy) searchParams.searchBy = searchBy;
    if (dataType) searchParams.dataType = dataType;

    return dashboardClient.get('api/dashboard/resumo-mensal-financeiro-periodo', {
      searchParams
    }).json<ResumoMensalFinanceiroDto[]>();
  },

  getDashboardFaturamentoPayload: async (
    startDate: string,
    endDate:string,
    dataType: string,
    searchBy:string
  ) : Promise<DashboardFaturamentoPayloadDto> => {
    const searchParams: Record<string,string> = {};
    if(startDate) searchParams.startDate = startDate;
    if(endDate) searchParams.endDate = endDate;
    if(searchBy) searchParams.searchBy = searchBy;  
    if(dataType) searchParams.dataType = dataType;  
    return dashboardClient.get('api/dashboard/get-faturamento-comparativo',{
      searchParams
    }).json<DashboardFaturamentoPayloadDto>();
  },

  getEvolucaoFinanceiraPorPeriodo: async (
  startDate: string,
  endDate: string,
  ): Promise<EvolucaoFinanceiraPayloadDto> => {
  const searchParams: Record<string, string> = { startDate, endDate };
  return dashboardClient
    .get('api/dashboard/evolucao-financeira-periodo', { searchParams })
    .json<EvolucaoFinanceiraPayloadDto>();
  },

  getEventAnalytics: async (
  codEventos: number[] = [],
  codGrupos: number[] = []
): Promise<EventAnalyticsDto[]> => {
  const searchParams: Record<string, string> = {};
  if (codEventos.length > 0) searchParams.codEvento = codEventos.join(',');
  if (codGrupos.length > 0) searchParams.codGrupo = codGrupos.join(',');
  return dashboardClient
    .get('api/dashboard/analise-eventos', { searchParams })
    .json<EventAnalyticsDto[]>();
},

getEventAnalyticsDetails: async (
  codEvento: number,
  codGrupo: number
): Promise<EventAnalyticsDetailsDto> => {
  const searchParams: Record<string, string> = {
    codEvento: String(codEvento),
    codGrupo: String(codGrupo),
  };
  return dashboardClient
    .get('api/dashboard/analise-eventos-detalhes', { searchParams })
    .json<EventAnalyticsDetailsDto>();
},

getGruposEEventos: async (): Promise<EventGroupDto> => {
  return dashboardClient
    .get('api/dashboard/grupos-e-eventos')
    .json<EventGroupDto>();
},

getEventAnalyticsGraphics: async (codEvento: number, codGrupo:number): Promise<EventGraphics[]> => {
  const searchParams: Record<string, string> = {
    codEvento: String(codEvento),
    codGrupo: String(codGrupo),
  };
  return dashboardClient
    .get('api/dashboard/analise-grafica', { searchParams })
    .json<EventGraphics[]>();
}
  
};

