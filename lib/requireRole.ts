import { NextResponse } from 'next/server';

import { type UserRole } from './auth';
import { verificarJwt } from './jwt';

type RequireRoleSuccess = { ok: true; payload: { id: string; role: UserRole } };
type RequireRoleFailure = { ok: false; response: NextResponse };

function readTokenFromRequest(request: Request) {
  const cookieHeader = request.headers.get('cookie');

  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';');

  for (const cookie of cookies) {
    const [key, ...rest] = cookie.trim().split('=');
    if (key === 'token') {
      return decodeURIComponent(rest.join('='));
    }
  }

  return null;
}

export async function requireRole(
  request: Request,
  allowedRoles: Array<'ADM' | 'GERENTE' | 'COZINHEIRO'>
): Promise<RequireRoleSuccess | RequireRoleFailure> {
  const token = readTokenFromRequest(request);
  const payload = token ? await verificarJwt(token) : null;

  if (!payload) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    };
  }

  if (!allowedRoles.includes(payload.role)) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    };
  }

  return { ok: true, payload };
}
