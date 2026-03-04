import NextAuth, { CredentialsSignin } from 'next-auth';
import type { NextAuthConfig } from 'next-auth';
import type { Provider } from 'next-auth/providers';
import Credentials from 'next-auth/providers/credentials';
import { api } from '../services/api';

/**
 * Erro customizado para quando a conta precisa ser ativada.
 * Estende CredentialsSignin para que o NextAuth v5 propague o código corretamente.
 */
class ActivationRequiredError extends CredentialsSignin {
	code = 'activation_required';
	message = 'Conta precisa ser ativada.';
}

/**
 * Resposta da API de autenticação.
 */
export interface ClienteAuth {
	codUsu: number;
	cLogin: string;
	cSenha: string;
	codFornecedor: number;
	nIdPermissaoPortalVendas: number;
}

/**
 * Token Bearer fixo para autenticação na API.
 * TODO: substituir por token dinâmico quando backend suportar.
 */
const FIXED_BEARER_TOKEN =
	'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0.YXViY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6YWIxMjM0NTY3ODkwMTIzNA';

export const providers: Provider[] = [
	Credentials({
		name: 'Cliente',
		credentials: {
			login: { label: 'Login', type: 'text' },
			password: { label: 'Senha', type: 'password' }
		},
		async authorize(credentials, request) {
			// Extrair origin do request
			let origin: string | undefined;

			if (typeof (request.headers as any).get === 'function') {
				origin = (request.headers as any as Headers).get('origin') ?? undefined;
			} else {
				const hdrs = request.headers as unknown as Record<string, string | string[] | undefined>;
				const raw = hdrs.origin;
				origin = Array.isArray(raw) ? raw[0] : raw;
			}

			try {
				const response = await api.post<ClienteAuth>('/api/usuario/auth', credentials, {
					headers: {
						Origin: origin,
						Authorization: `Bearer ${FIXED_BEARER_TOKEN}`
					}
				});

				const cliente = response.data;

				if (!cliente?.codUsu) {
					return null;
				}

				return {
					id: String(cliente.codUsu),
					email: '',
					name: cliente.cLogin,
					codUsu: cliente.codUsu,
					cLogin: cliente.cLogin,
					codFornecedor: cliente.codFornecedor,
					nIdPermissaoPortalVendas: cliente.nIdPermissaoPortalVendas
				};
			} catch (error: any) {
				console.error('[Auth] Erro na autenticação:', error.response?.status, error.message);

				if (error.response?.status === 404) {
					throw new ActivationRequiredError();
				}

				return null;
			}
		}
	})
];

const config = {
	theme: { logo: '/assets/images/logo/logo.svg' },
	pages: { signIn: '/sign-in' },
	providers,
	basePath: '/auth',
	trustHost: true,
	callbacks: {
		authorized({ auth: session }) {
			// Usado pelo middleware — retorna true se autenticado
			return !!session?.user;
		},
		async jwt({ token, trigger, user, session: updateData }) {
			// Login inicial — injeta dados do cliente no token
			if (user) {
				token.codUsu = (user as any).codUsu;
				token.cLogin = (user as any).cLogin;
				token.codFornecedor = (user as any).codFornecedor;
				token.nIdPermissaoPortalVendas = (user as any).nIdPermissaoPortalVendas;
				token.role = ['usuário'];
				token.customState = {};
			}

			// Atualização de sessão (via update() no client)
			if (trigger === 'update' && updateData) {
				// Merge customState se enviado via update({ customState: {...} })
				if ((updateData as any).customState) {
					token.customState = {
						...((token.customState as Record<string, unknown>) || {}),
						...(updateData as any).customState
					};
				}

				// Permite atualizar nome
				if ((updateData as any).name) {
					token.name = (updateData as any).name;
				}
			}

			return token;
		},
		async session({ session, token }) {
			// Mapeia token → session para o client
			session.accessToken = `Bearer ${FIXED_BEARER_TOKEN}`;

			session.db = {
				id: token.codUsu as number,
				email: session.user?.email ?? '',
				displayName: (token.cLogin as string) ?? '',
				role: (token.role as string[]) ?? ['usuário'],
				codFornecedor: (token.codFornecedor as number) ?? null,
				nIdPermissaoPortalVendas: (token.nIdPermissaoPortalVendas as number) ?? null
			};

			session.customState = (token.customState as Record<string, unknown>) ?? {};

			return session;
		}
	},
	session: {
		strategy: 'jwt',
		maxAge: 30 * 24 * 60 * 60 // 30 dias
	}
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
