import { NextRequest, NextResponse } from 'next/server';

import { verificarJwt } from './lib/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const protectedRoutes = ['/cozinha', '/admin', '/gerente'];

  if (pathname.startsWith('/admin/bootstrap')) {
    return NextResponse.next();
  }

  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    const token = req.cookies.get('token')?.value;
    const payload = token ? await verificarJwt(token) : null;

    if (!payload) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    if (pathname.startsWith('/cozinha') && payload.role !== 'COZINHEIRO') {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    if (pathname.startsWith('/gerente') && payload.role !== 'GERENTE') {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    if (pathname.startsWith('/admin') && payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/cozinha/:path*', '/admin/:path*', '/gerente/:path*']
};
