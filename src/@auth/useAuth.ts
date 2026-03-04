'use client';

import { useMutation } from '@tanstack/react-query';
import { signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

/**
 * Credenciais de login.
 */
export interface LoginCredentials {
  login: string;
  password: string;
}

/**
 * Resultado do signIn do NextAuth.
 */
interface SignInResult {
  error?: string | null;
  ok?: boolean;
  status?: number;
  url?: string | null;
}

/**
 * Hook de autenticação usando TanStack Query.
 *
 * Expõe:
 * - `loginMutation` — mutation para fazer login via credentials
 * - `logout` — função para fazer logout
 *
 * @example
 * ```tsx
 * const { loginMutation, logout } = useAuth();
 *
 * // Login
 * loginMutation.mutate({ login: 'user', password: '123' });
 *
 * // Checar estado
 * loginMutation.isPending // loading
 * loginMutation.isError   // erro
 * loginMutation.error     // mensagem
 *
 * // Logout
 * logout();
 * ```
 */
export function useAuth() {
  const router = useRouter();

  const loginMutation = useMutation<SignInResult, Error, LoginCredentials>({
    mutationKey: ['auth', 'login'],
    mutationFn: async (credentials: LoginCredentials) => {
      const result = await signIn('credentials', {
        login: credentials.login,
        password: credentials.password,
        redirect: false
      });

      if (!result) {
        throw new Error('Resposta inesperada do servidor.');
      }

      if (result.error) {
        throw new Error(
          result.error.includes('activation_required')
            ? 'Conta precisa ser ativada.'
            : 'Usuário não encontrado para os parâmetros fornecidos.'
        );
      }

      return result;
    },
    onSuccess: () => {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const callbackUrl = urlParams.get('callbackUrl') || '/';
        router.push(callbackUrl);
      } else {
        router.push('/');
      }
      router.refresh();
    }
  });

  const logout = useCallback(async () => {
    await signOut({
      redirect: true,
      callbackUrl: `${window.location.origin}/sign-in`
    });
  }, []);

  return {
    loginMutation,
    logout
  };
}

export default useAuth;
