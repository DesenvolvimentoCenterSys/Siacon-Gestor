'use client';

import { useSession } from 'next-auth/react';
import { useCallback, useMemo } from 'react';

/**
 * Hook para gerenciar estados globais persistidos na sessão NextAuth.
 *
 * Os estados são armazenados no JWT token via `session.customState`
 * e persistem enquanto a sessão estiver ativa (até 30 dias).
 *
 * @example
 * ```tsx
 * const { getState, setState, customState } = useSessionStore();
 *
 * // Ler um valor
 * const tema = getState<string>('tema'); // 'escuro'
 *
 * // Salvar um valor
 * setState('tema', 'claro');
 *
 * // Salvar múltiplos valores de uma vez
 * setStates({ tema: 'claro', idioma: 'pt-BR' });
 *
 * // Acessar todos os estados
 * console.log(customState); // { tema: 'claro', idioma: 'pt-BR' }
 * ```
 */
export function useSessionStore() {
  const { data: session, update } = useSession();

  const customState = useMemo(
    () => (session?.customState ?? {}) as Record<string, unknown>,
    [session?.customState]
  );

  /**
   * Lê um valor do estado global da sessão.
   */
  const getState = useCallback(
    <T = unknown>(key: string): T | undefined => {
      return customState[key] as T | undefined;
    },
    [customState]
  );

  /**
   * Salva um valor no estado global da sessão.
   * Dispara um update() no NextAuth que persiste no JWT.
   */
  const setState = useCallback(
    async (key: string, value: unknown) => {
      const newState = { ...customState, [key]: value };
      await update({ customState: newState });
    },
    [customState, update]
  );

  /**
   * Salva múltiplos valores no estado global da sessão de uma vez.
   */
  const setStates = useCallback(
    async (values: Record<string, unknown>) => {
      const newState = { ...customState, ...values };
      await update({ customState: newState });
    },
    [customState, update]
  );

  /**
   * Remove um valor do estado global da sessão.
   */
  const removeState = useCallback(
    async (key: string) => {
      const newState = { ...customState };
      delete newState[key];
      await update({ customState: newState });
    },
    [customState, update]
  );

  /**
   * Limpa todos os estados globais da sessão.
   */
  const clearState = useCallback(async () => {
    await update({ customState: {} });
  }, [update]);

  return {
    customState,
    getState,
    setState,
    setStates,
    removeState,
    clearState
  };
}

export default useSessionStore;
