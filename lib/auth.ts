import bcrypt from 'bcryptjs';

import { gerarJwt, getJwtSecret, verificarJwt } from './jwt';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const USER_ROLES = ['ADMIN', 'GERENTE', 'COZINHEIRO', 'MOTOBOY'] as const;
export type UserRole = (typeof USER_ROLES)[number];

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

export function isValidEmail(email: string) {
  return /[^\s@]+@[^\s@]+\.[^\s@]+/.test(email);
}

export function isStrongPassword(password: string) {
  return PASSWORD_REGEX.test(password);
}

export async function hashSenha(plaintext: string) {
  return bcrypt.hash(plaintext, 10);
}

export async function compararSenha(plaintext: string, hash: string) {
  return bcrypt.compare(plaintext, hash);
}

export async function safeGetSessionFromCookies(): Promise<
  | {
      id: string;
      role: UserRole;
    }
  | null
> {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return null;

    const payload = await verificarJwt(token);

    if (payload?.id && payload?.role) {
      return { id: payload.id, role: payload.role };
    }

    return null;
  } catch {
    return null;
  }
}

export async function getSessionFromCookie(request: Request | { headers: Headers }) {
  const cookieHeader = request.headers.get('cookie');

  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';');
  const tokenCookie = cookies
    .map(cookie => cookie.trim())
    .find(cookie => cookie.startsWith('token='));

  if (!tokenCookie) return null;

  const token = decodeURIComponent(tokenCookie.split('=')[1]);
  return verificarJwt(token);
}

export async function requireRole(
  request: Request | { headers: Headers },
  allowedRoles: Array<UserRole>
): Promise<
  | { ok: true; payload: { id: string; role: UserRole } }
  | { ok: false; response: NextResponse }
> {
  const payload = await getSessionFromCookie(request);

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

export { gerarJwt, getJwtSecret, verificarJwt };
