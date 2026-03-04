'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useSessionStore } from './useSessionStore';

/**
 * Hook universal para sincronizar um estado entre: Local State <-> URL <-> Sessão (Global).
 * 
 * Ordem de inicialização:
 * 1. Lê da URL (se existir)
 * 2. Lê da Sessão (se URL não existir)
 * 3. Usa defaultValue (se nenhum existir)
 * 
 * Atualiza automaticamente a Sessão e os parâmetros de URL ao ser alterado.
 */
export function useSessionUrlFilter<T>(
  key: string,
  defaultValue: T,
  serialize: (val: T) => string = String,
  deserialize: (val: string) => T = (val) => val as unknown as T
) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { getState, setState: setSessionState } = useSessionStore();

  const [localValue, setLocalValue] = useState<T>(() => {
    // 1. Tentar ler da URL via params passados no request
    const urlValue = searchParams?.get(key);
    if (urlValue !== null && urlValue !== undefined) {
      try {
        return deserialize(urlValue);
      } catch (e) {
        console.warn(`Erro ao desserializar o param ${key} da URL:`, e);
      }
    }

    // 2. Tentar ler da Sessão Global
    const sessionValue = getState<unknown>(key);
    if (sessionValue !== undefined && sessionValue !== null) {
      try {
        if (typeof sessionValue === 'string') {
          return deserialize(sessionValue);
        }
        return sessionValue as T;
      } catch (e) {
        console.warn(`Erro ao desserializar o param ${key} da Sessão:`, e);
      }
    }

    // 3. Fallback
    return defaultValue;
  });

  const isMounted = useRef(false);

  // Sync state changes with URL and Session
  const setFilterValue = useCallback((newValue: T) => {
    setLocalValue(newValue);
    setSessionState(key, newValue);

    if (typeof window !== 'undefined') {
      const currentParams = new URLSearchParams(window.location.search);
      const serializedValue = serialize(newValue);

      if (serializedValue === null || serializedValue === undefined || serializedValue === '') {
        currentParams.delete(key);
      } else {
        currentParams.set(key, serializedValue);
      }

      const search = currentParams.toString();
      const query = search ? `?${search}` : '';

      // router.replace do App Router para atualizar a URL
      router.replace(`${pathname}${query}`, { scroll: false });
    }
  }, [key, pathname, router, serialize, setSessionState]);

  // Push fallback value to URL on mount if it's completely missing
  useEffect(() => {
    if (!isMounted.current && typeof window !== 'undefined') {
      isMounted.current = true;
      const urlValue = searchParams?.get(key);
      if (urlValue === null || urlValue === undefined) {
        const currentParams = new URLSearchParams(window.location.search);
        const serializedValue = serialize(localValue);

        if (serializedValue !== null && serializedValue !== undefined && serializedValue !== '') {
          currentParams.set(key, serializedValue);
          const search = currentParams.toString();
          const query = search ? `?${search}` : '';

          // Use history.replaceState here to silently patch the mount URL without triggering router refresh
          window.history.replaceState(null, '', `${pathname}${query}`);
        }
      }
    }
  }, [key, localValue, serialize, pathname, searchParams]);

  return [localValue, setFilterValue] as const;
}
