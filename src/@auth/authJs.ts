import NextAuth from 'next-auth';
import { User } from '@auth/user';
import { createStorage } from 'unstorage';
import memoryDriver from 'unstorage/drivers/memory';
import vercelKVDriver from 'unstorage/drivers/vercel-kv';
import { UnstorageAdapter } from '@auth/unstorage-adapter';
import type { NextAuthConfig } from 'next-auth';
import type { Provider } from 'next-auth/providers';
import Credentials from 'next-auth/providers/credentials';
import Facebook from 'next-auth/providers/facebook';
import Google from 'next-auth/providers/google';
import { api } from '../services/api';

export interface Cliente {
	codUsu: number;
	cLogin: string;
	cSenha: string;
	codFornecedor: number;
	nIdPermissaoPortalVendas: number;
}

const storage = createStorage({
	driver: process.env.VERCEL
		? vercelKVDriver({
				url: process.env.AUTH_KV_REST_API_URL,
				token: process.env.AUTH_KV_REST_API_TOKEN,
				env: false
			})
		: memoryDriver()
});

export const providers: Provider[] = [
	Credentials({
		name: 'Cliente',
		credentials: {
			email: { label: 'Email', type: 'text', placeholder: 'teste@teste.com.br' },
			password: { label: 'Senha', type: 'password' }
		},
		async authorize(credentials, request) {
			console.log('oi');
			let origin: string | undefined;

			if (typeof (request.headers as any).get === 'function') {
				origin = (request.headers as any as Headers).get('origin') ?? undefined;
			} else {
				// @ts-ignore
				const hdrs = request.headers as Record<string, string | string[] | undefined>;
				const raw = hdrs.origin;
				origin = Array.isArray(raw) ? raw[0] : raw;
			}

			console.log('[Authorize] origin extraído:', origin);
			try {
				const response = await api.post<Cliente>('/api/usuario/auth', credentials, {
					headers: {
						Origin: origin,
						Authorization: `Bearer eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0.YXViY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6YWIxMjM0NTY3ODkwMTIzNA`
					}
				});
				const cliente = response.data;

				if (cliente?.codUsu) {
					const adaptedUser: User = {
						id: String(cliente.codUsu),
						email: '',
						displayName: cliente.cLogin,
						codFornecedor: cliente.codFornecedor,
						nIdPermissaoPortalVendas: cliente.nIdPermissaoPortalVendas,
						...cliente,
						role: 'Usuário'
					};
					return adaptedUser;
				}

				console.warn('[Authorize] sem codCliente, retornando null');
				return null;
			} catch (error: any) {
				console.error('[Authorize] erro ao chamar API:', error.response?.status, error.message);

				if (error.response?.status === 404) {
					throw new Error('activation_required');
				}

				return null;
			}
		}
	}),
	Google,
	Facebook
];

const config = {
	debug: true, // força debug do NextAuth
	theme: { logo: '/assets/images/logo/logo.svg' },
	adapter: UnstorageAdapter(storage),
	pages: { signIn: '/sign-in' },
	providers,
	basePath: '/auth',
	trustHost: true,
	callbacks: {
		authorized() {
			console.log('[Authorized] checando autorização via middleware');
			return true;
		},
		async jwt({ token, trigger, account, user }) {
			console.log('[JWT] trigger:', trigger, 'account:', account, 'user:', user);

			if (trigger === 'update' && user) {
				token.name = user.name;
			}

			if (account?.provider === 'keycloak') {
				return { ...token, accessToken: account.access_token };
			}

			if (user) {
				token.cliente = user;
			}

			console.log('[JWT] token final:', token);
			return token;
		},
		async session({ session, token }) {
			console.log('[Session] session antes:', session, 'token:', token);
			session.accessToken = `Bearer ${process.env.API_FIXED_TOKEN}`;

			if ((token as any).cliente) {
				const { cliente } = token as any;
				session.db = {
					id: cliente.codUsu,
					email: session.user?.email,
					displayName: cliente.cLogin,
					role: ['usuário'],
					codFornecedor: cliente.codFornecedor,
					nIdPermissaoPortalVendas: cliente.nIdPermissaoPortalVendas
				};
			}

			console.log('[Session] session depois:', session);
			return session;
		}
	},
	session: {
		strategy: 'jwt',
		maxAge: 30 * 24 * 60 * 60 // 30 dias
	},
	experimental: {
		enableWebAuthn: true
	}
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
