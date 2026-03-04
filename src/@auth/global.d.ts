import { User } from '@auth/user';

declare module 'next-auth' {
	interface Session {
		accessToken?: string;
		db: {
			id: number;
			email: string;
			displayName: string;
			role: string[];
			codFornecedor: number | null;
			nIdPermissaoPortalVendas: number | null;
		};
		/** Estados globais customizados persistidos na sessão JWT */
		customState: Record<string, unknown>;
	}

	interface JWT {
		accessToken?: string;
		codUsu?: number;
		cLogin?: string;
		codFornecedor?: number;
		nIdPermissaoPortalVendas?: number;
		role?: string[];
		customState?: Record<string, unknown>;
	}
}
