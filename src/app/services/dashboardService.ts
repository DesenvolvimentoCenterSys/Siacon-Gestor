import { apiClient } from '@/lib/apiClient';

// Extend apiClient to use the specific URL requested for these widgets
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
  percentageChange: number;
  message: string;
}

export interface TaxaUtilizacaoDto {
  rate: number;
  percentageChange: number;
  message: string;
}

export interface MensalidadeMediaDto {
  average: number;
  percentageChange: number;
  message: string;
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
  getUserFavoriteWidgets: async (codUsu: number): Promise<UsuarioDashboardWidgetDto[]> => {
    return dashboardClient.get(`api/UsuarioDashboardWidgets/usuario/${codUsu}`).json<UsuarioDashboardWidgetDto[]>();
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
  getNovasVidas: async (date?: string): Promise<NovasVidasDto> => {
    const searchParams = date ? { date } : undefined;
    return dashboardClient.get('api/Dashboard/novas-vidas', {
      searchParams
    }).json<NovasVidasDto>();
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
  getFaturamentoMensal: async (date?: string): Promise<FaturamentoMensalDto> => {
    const searchParams = date ? { date } : undefined;
    return dashboardClient.get('api/Dashboard/faturamento-mensal', {
      searchParams
    }).json<FaturamentoMensalDto>();
  },
  getTaxaUtilizacao: async (date?: string): Promise<TaxaUtilizacaoDto> => {
    const searchParams = date ? { date } : undefined;
    return dashboardClient.get('api/Dashboard/taxa-utilizacao', {
      searchParams
    }).json<TaxaUtilizacaoDto>();
  },
  getMensalidadeMedia: async (date?: string): Promise<MensalidadeMediaDto> => {
    const searchParams = date ? { date } : undefined;
    return dashboardClient.get('api/Dashboard/mensalidade-media', {
      searchParams
    }).json<MensalidadeMediaDto>();
  },
  getEvolucaoFaturamento: async (year?: number): Promise<EvolucaoFaturamentoDto> => {
    const searchParams = year ? { year } : undefined;
    return dashboardClient.get('api/Dashboard/evolucao-faturamento', {
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
  getAllWidgets: async (codUsu?: number, widgetId?: number, isFavorite?: boolean): Promise<UsuarioDashboardWidgetDto[]> => {
    const searchParams: Record<string, string | number | boolean> = {};
    if (codUsu) searchParams.codUsu = codUsu;
    if (widgetId) searchParams.widgetId = widgetId;
    if (isFavorite !== undefined) searchParams.isFavorite = isFavorite;

    return dashboardClient.get('api/UsuarioDashboardWidgets', {
      searchParams
    }).json<UsuarioDashboardWidgetDto[]>();
  }
};

