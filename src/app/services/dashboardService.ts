import { apiClient } from '@/lib/apiClient';

// Extend apiClient to use the specific URL requested for these widgets
const dashboardClient = apiClient.extend({
  prefixUrl: 'https://localhost:15001/'
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

