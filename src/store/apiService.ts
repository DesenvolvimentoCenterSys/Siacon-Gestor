import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BaseQueryFn, FetchArgs, FetchBaseQueryError, FetchBaseQueryMeta } from '@reduxjs/toolkit/query';
import { API_BASE_URL, globalHeaders } from '@/utils/apiFetch';

const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError, object, FetchBaseQueryMeta> = async (
  args,
  api,
  extraOptions
) => {
  const result = await fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      // Adiciona os cabeçalhos globais
      Object.entries(globalHeaders).forEach(([key, value]) => {
        headers.set(key, value);
      });
      // Adiciona o token fixo Bearer
      headers.set(
        'Authorization',
        'Bearer eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0.YXViY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6YWIxMjM0NTY3ODkwMTIzNA'
      );
      return headers;
    }
  })(args, api, extraOptions);

  // Exemplo de tratamento de erro 401
  if (result.error && result.error.status === 401) {
    // Lógica para tratar erros 401 (por exemplo, refresh token)
  }

  return result;
};

export const apiService = createApi({
  baseQuery,
  endpoints: () => ({}),
  reducerPath: 'apiService'
});

export default apiService;
