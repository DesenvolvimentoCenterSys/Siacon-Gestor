import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';

export const useToggleFavoriteWidget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ codUsu, widgetId, isFavorite }: { codUsu: number; widgetId: number; isFavorite: boolean }) =>
      dashboardService.toggleFavoriteWidget(codUsu, widgetId, isFavorite),
    onSuccess: (data, variables) => {
      // Invalidate and refetch favorite widgets to update the UI
      queryClient.invalidateQueries({ queryKey: ['userFavoriteWidgets', variables.codUsu] });
      queryClient.invalidateQueries({ queryKey: ['allWidgets'] });
    },
    onError: (error) => {
      console.error('Erro ao atualizar favorito', error);
    }
  });
};

export const useUserFavoriteWidgets = (codUsu?: number) => {
  return useQuery({
    queryKey: ['userFavoriteWidgets', codUsu],
    queryFn: () => dashboardService.getUserFavoriteWidgets(codUsu!),
    enabled: !!codUsu, // Only run if codUsu is defined
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
    enabled: !!codUsu // Ensure we at least have the user ID
  });
};

export const useNovasVidas = (date?: string) => {
  return useQuery({
    queryKey: ['novasVidas', date],
    queryFn: () => dashboardService.getNovasVidas(date)
  });
};

export const useTotalFiliados = (date?: string) => {
  return useQuery({
    queryKey: ['totalFiliados', date],
    queryFn: () => dashboardService.getTotalFiliados(date)
  });
};
