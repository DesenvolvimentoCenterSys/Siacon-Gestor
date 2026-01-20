import ky from 'ky';

export const API_BASE_URL =
  process.env.NODE_ENV === 'development'
    ? `http://localhost:${5000}`
    : process.env.NEXT_PUBLIC_BASE_URL || '/';

export const globalHeaders: Record<string, string> = {
  Customer: process.env.NEXT_PUBLIC_CUSTOMER || 'localhost'
};

export const apiClient = ky.create({
  prefixUrl: API_BASE_URL,
  headers: {
    ...globalHeaders,
    Authorization:
      'Bearer eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0.YXViY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6YWIxMjM0NTY3ODkwMTIzNA'
  },
  timeout: 30000,
  hooks: {
    beforeRequest: [
      (request) => {
        // You can add logic here to inject dynamic tokens if needed
      }
    ],
    afterResponse: [
      async (request, options, response) => {
        if (response.status === 401) {
          // Handle 401 Unauthorized (e.g., redirect to login or refresh token)
          console.error('Unauthorized access');
        }
      }
    ]
  }
});

export default apiClient;
