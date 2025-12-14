import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL('/login', request.url));
  response.headers.set(
    'Set-Cookie',
    'token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'
  );

  return response;
}
