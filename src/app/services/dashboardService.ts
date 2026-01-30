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

