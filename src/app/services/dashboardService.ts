import { apiClient } from '@/lib/apiClient';
import { FiltroOption } from 'src/app/hooks/useDateFilter';

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

export interface OverviewAcummulatedDelinquencyDto{
  lastMonthTaxVariation: number;
  accumulatedDelinquency: AccumulatedDelinquencyDto[];
}

export interface TotalVidasDto {
  total: number;
  message: string;
  percentageChange: number;
}

export interface TotalEmpresasDto {
  total: number;
  message: string;
  percentageChange: number;
}

export interface TotalCpfDto {
  total: number;
  message: string;
  percentageChange: number;
}

export interface FaixaEtariaDto {
  faixa: string;
  quantidade: number;
}

export interface ClientesPorSexoDto {
  quantidadeMasculino: number;
  quantidadeFeminino: number;
  quantidadeOutros: number;
  porcentagemMasculino: number;
  porcentagemFeminino: number;
  porcentagemOutros: number;
  diferencaMasculino: number;
  diferencaFeminino: number;
  diferencaOutros: number;
}

export interface FaturamentoMensalDto {
  total: number;
  anterior:number;
  percentageChange: number;
  periodoSelecionado: string;
  periodoAnterior: string;
  message: string;
}

export interface TaxaUtilizacaoDto {
  rate: number;
  percentageChange: number;
  message: string;
}

export interface MensalidadeMediaDto {
  average: number;
  previousAverage: number;
  periodoSelecionado: string;
  periodoAnterior: string;
  percentageChange: number;
  message: string;
}

export interface MensalidadeMediaPorConvenioDto {
  nomeConvenio: string;
  previousAverage: number;
  average: number;
  periodoSelecionado: string;
  periodoAnterior: string;
  percentageChange: number;
}

export interface MesFaturamentoDto {
  mes: number;
  valorPago: number;
  valorPrevisto: number;
  valorInadimplencia: number;
  despesasPagas: number;
  despesasPrevistas: number;
  despesasInadimplencia: number;
}

export interface EvolucaoFaturamentoDto {
  meses: MesFaturamentoDto[];
}

export interface FaturamentoPorConvenioDto {
  nomeConvenio: string;
  valorTotalFaturado: number;
  valorTotalTaxaAdm: number;
}

export interface FaturamentoPorConvenioReferenciaDto {
  nomeConvenio: string;
  valorTotalFaturado: number;
  valorTotalTaxaAdm: number;
}

export interface DependentesTitularesDto {
  titulares: number;
  dependentes: number;
  titularesLastMonth: number;
  dependentesLastMonth: number;
  titularesGrowth: number;
  dependentesGrowth: number;
}

export interface ResumoUsuariosDto {
  totalAtivos: number;
  totalDesligados: number;
  totalNovos: number;
  valorDesligados: number;
  valorNovos: number;
  faturamentoTotal: number;
}

export interface UsuariosPorConvenioDto {
  codConvenio: number;
  nomeConvenio: string;
  geral: ResumoUsuariosDto;
  pf: ResumoUsuariosDto;
  pj: ResumoUsuariosDto;
}

export interface TotalUsuariosConvenioDto {
  dataReferencia: string;
  geral: ResumoUsuariosDto;
  pf: ResumoUsuariosDto;
  pj: ResumoUsuariosDto;
  porConvenio: UsuariosPorConvenioDto[];
}

export interface ResumoFaturamentoDto {
  totalGeral: number;
  totalPago: number;
  totalAberto: number;
  totalVencido: number;
}

export interface FaturamentoDetalhadoConvenioDto {
  codConvenio: number;
  nomeConvenio: string;
  percentual: number;
  associados: number;
  faturamento: ResumoFaturamentoDto;
}

export interface TotalFaturamentoPorConvenioDto {
  dataReferencia: string;
  geral: ResumoFaturamentoDto;
  porConvenio: FaturamentoDetalhadoConvenioDto[];
}

export interface PagamentoCentroCustoDto {
  valorTotal: number;
  emAberto: number;
  liquidado: number;
  valorVencido: number;
}

export interface TotalFaturamentoDto {
  dataReferencia: string;
  geral: ResumoFaturamentoDto;
  quantidadeClientes: number;
  despesas: PagamentoCentroCustoDto;
  fluxoCaixa: PagamentoCentroCustoDto;
  resultadoPrevisto: number;
  resultadoRealizado: number;
  porConvenio: FaturamentoDetalhadoConvenioDto[];
}

export interface EventAnalyticsDto {
  nomeEvento: string;
  nomeGrupo?: string;
  totalFaturamento: number;
  totalPago: number;
  totalAberto: number;
  totalVencido: number;
}

export interface CashFlowEvolutionDto {
  data: string;
  nomeBanco: string;
  nomeMovimentacao: string;
  totalEntrada: number;
  totalSaida: number;
  saldoDoDia: number;
  saldoAcumulado: number;
}

export interface TotalFiliadosDto {
  totalAtivos: number;
  totalDesligados: number;
  totalNovos: number;
  valorDesligados: number;
  valorNovos: number;
  faturamentoTotal: number;
  dataReferencia: string;
}

export interface VidasPorConvenioDto {
  nomeConvenio: string;
  quantidadeVidasPF: number;
  quantidadeEmpresas: number;
  quantidadeVidasPFAnterior: number;
  quantidadeEmpresasAnterior: number;
  diferencaVidasPF: number;
  diferencaEmpresas: number;
}

export interface NovasVidasDto {
  quantidadePF: number;
  quantidadePJ: number;
  total: number;
}

export interface UsuarioDashboardWidgetDto {
  id: number;
  codUsu: number;
  dashboardWidgetId: number;
  isFavorite: boolean;
}

export interface FinancialEvolutionDto {
  data: string;
  nomeBanco: string;
  totalReceber: number;
  totalPagar: number;
  saldoDoDia: number;
  saldoAcumulado: number;
}

export interface FinancialEvolutionResponseDto {
  data: FinancialEvolutionDto[];
  saldoAtual: number;
}

export interface AccumulatedDelinquencyDto {
  mes: number;
  valorMensal: number;
  valorAcumulado: number;
}

export interface DailyDelinquencyDto {
  data: string;
  valorDiario: number;
  valorAcumulado: number;
}

export interface DelinquencyAgingDto {
  diasVencido: number;
  descricao: string;
  quantidade: number;
  valor: number;
}

export interface DelinquencySummaryDto {
  totalFaturado: number;
  totalInadimplente: number;
  totalAdimplente: number;
  totalAReceber: number;
  percentualInadimplencia: number;
  percentualAdimplencia: number;
  percentualAReceber: number;
}

export interface ResumoMensalFinanceiroDto {
  mes: number;
  totalCobranca: number;
  totalPagamento: number;
  totalVencido: number;
  resultado: number;
}

export interface TotalDespesasPorConvenioDto{
  valorTotal: number;
  emAberto: number;
  liquidado: number;
  valorVencido: number;
}

export interface GrupoBancoDto {
  nomeGrupo : string;
  codigo : number;
}

export interface FiltrosDashboardDto 
{
  convenios: FiltroOption[],
  servicos: FiltroOption[],
  centrosCusto: FiltroOption[],
  planosConta: FiltroOption[]
}


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

  getTotalFiliados: async (date?: string): Promise<TotalFiliadosDto> => {
    const searchParams = date ? { date } : undefined;
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

  getTotalFaturamentoPorConvenioWithFilters: async (
    startDate?: string,
    endDate?: string,
    convenios?: number[],
    servicos?: number[],
    centrosCusto?: number[],
    planosContas?: number[],
  ): Promise<TotalFaturamentoDto> => {
    const searchParams: Record<string, string> = {};
    if (startDate) searchParams.startDate = startDate;
    if (endDate) searchParams.endDate = endDate;
    if (convenios && convenios.length > 0) searchParams.convenios = convenios.join(',');
    if (servicos && servicos.length > 0) searchParams.servicos = servicos.join(',');
    if (centrosCusto && centrosCusto.length > 0) searchParams.centrosCusto = centrosCusto.join(',');
    if (planosContas && planosContas.length > 0) searchParams.planosContas = planosContas.join(',');

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
  ): Promise<TotalFaturamentoDto> => {
    const searchParams: Record<string, string> = {};
    if (startDate) searchParams.startDate = startDate;
    if (endDate) searchParams.endDate = endDate;
    if (convenios && convenios.length > 0) searchParams.convenios = convenios.join(',');
    if (servicos && servicos.length > 0) searchParams.servicos = servicos.join(',');
    if (centrosCusto && centrosCusto.length > 0) searchParams.centrosCusto = centrosCusto.join(',');
    if (planosContas && planosContas.length > 0) searchParams.planosContas = planosContas.join(',');

    return dashboardClient.get('api/Dashboard/total-faturamento-convenio-referencia-filters', {
      searchParams
    }).json<TotalFaturamentoDto>();
  },
  getEventAnalytics: async (date?: string): Promise<EventAnalyticsDto[]> => {
    const searchParams = date ? { date } : undefined;
    return dashboardClient.get('api/Dashboard/analise-eventos', {
      searchParams
    }).json<EventAnalyticsDto[]>();
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
  getResumoMensalFinanceiro: async (year?: number): Promise<ResumoMensalFinanceiroDto[]> => {
    const searchParams: Record<string, string> = {};
    if (year) searchParams.year = year.toString();

    return dashboardClient.get('api/dashboard/resumo-mensal-financeiro', {
      searchParams
    }).json<ResumoMensalFinanceiroDto[]>();
  },
  getResumoMensalFinanceiroPorPeriodo: async (startDate: string, endDate: string,): Promise<ResumoMensalFinanceiroDto[]> => {
    return dashboardClient.get('api/dashboard/resumo-mensal-financeiro-periodo', {
      searchParams: { startDate, endDate}
    }).json<ResumoMensalFinanceiroDto[]>();
  }
};

