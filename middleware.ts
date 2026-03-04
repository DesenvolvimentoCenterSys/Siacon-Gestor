import { auth } from '@auth/authJs';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { nextUrl } = req;
  const isAuthenticated = !!req.auth;

  // Rotas públicas que não precisam de autenticação
  const publicPaths = ['/sign-in', '/sign-up', '/sign-out', '/logout'];
  const isPublicPath = publicPaths.some((path) => nextUrl.pathname.startsWith(path));
  const isAuthApi = nextUrl.pathname.startsWith('/auth') || nextUrl.pathname.startsWith('/api');
  const isStaticAsset =
    nextUrl.pathname.startsWith('/_next') ||
    nextUrl.pathname.startsWith('/assets') ||
    nextUrl.pathname.includes('.') // arquivos estáticos (favicon.ico, etc.)

  // Permitir acesso livre a rotas públicas, APIs e assets
  if (isPublicPath || isAuthApi || isStaticAsset) {
    // Se já autenticado e tentando acessar /sign-in, redireciona para home
    if (isAuthenticated && isPublicPath && nextUrl.pathname.startsWith('/sign-in')) {
      return NextResponse.redirect(new URL('/', nextUrl));
    }
    return NextResponse.next();
  }

  // Usuário não autenticado tentando acessar rota protegida
  if (!isAuthenticated) {
    const signInUrl = new URL('/sign-in', nextUrl);
    signInUrl.searchParams.set('callbackUrl', nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)'
  ]
};
