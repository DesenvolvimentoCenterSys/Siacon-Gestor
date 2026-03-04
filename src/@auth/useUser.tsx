'use client';

import { useSession, signOut } from 'next-auth/react';
import { useMemo, useCallback } from 'react';
import { User } from '@auth/user';
import { authUpdateDbUser } from '@auth/authApi';
import { useSessionStore } from '@auth/useSessionStore';
import _ from 'lodash';
import setIn from '@/utils/setIn';

type UseUserReturn = {
	/** Dados do usuário da sessão, ou null se guest */
	data: User | null;
	/** True se o usuário não está autenticado */
	isGuest: boolean;
	/** Atualiza dados do usuário no backend */
	updateUser: (updates: Partial<User>) => Promise<User | undefined>;
	/** Atualiza configurações do usuário */
	updateUserSettings: (newSettings: User['settings']) => Promise<User['settings'] | undefined>;
	/** Faz logout e redireciona para /sign-in */
	signOut: () => Promise<unknown>;
	/** Estado global da sessão */
	customState: Record<string, unknown>;
	/** Lê um valor do estado global */
	getSessionState: <T = unknown>(key: string) => T | undefined;
	/** Salva um valor no estado global */
	setSessionState: (key: string, value: unknown) => Promise<void>;
};

function useUser(): UseUserReturn {
	const { data: session, update } = useSession();
	const { customState, getState, setState } = useSessionStore();

	const user = useMemo<User | null>(() => {
		if (!session?.db) return null;

		return {
			id: String(session.db.id),
			displayName: session.db.displayName,
			email: session.db.email,
			role: session.db.role,
			codFornecedor: session.db.codFornecedor,
			nIdPermissaoPortalVendas: session.db.nIdPermissaoPortalVendas
		};
	}, [session?.db]);

	const isGuest = useMemo(() => !user?.role || (Array.isArray(user.role) && user.role.length === 0), [user]);

	const handleUpdateUser = useCallback(
		async (_data: Partial<User>) => {
			const response = await authUpdateDbUser(_data);

			if (!response.ok) throw new Error('Failed to update user');

			const updatedUser = (await response.json()) as User;
			// Atualiza sessão
			setTimeout(() => update(), 300);
			return updatedUser;
		},
		[update]
	);

	const handleUpdateUserSettings = useCallback(
		async (newSettings: User['settings']) => {
			const newUser = setIn(user, 'settings', newSettings) as User;

			if (_.isEqual(user, newUser)) return undefined;

			const updatedUser = await handleUpdateUser(newUser);
			return updatedUser?.settings;
		},
		[user, handleUpdateUser]
	);

	const handleSignOut = useCallback(async () => {
		return signOut({
			redirect: true,
			callbackUrl: `${window.location.origin}/sign-in`
		});
	}, []);

	return {
		data: user,
		isGuest,
		signOut: handleSignOut,
		updateUser: handleUpdateUser,
		updateUserSettings: handleUpdateUserSettings,
		customState,
		getSessionState: getState,
		setSessionState: setState
	};
}

export default useUser;
