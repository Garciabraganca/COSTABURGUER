import { SignJWT, jwtVerify } from 'jose';

import type { UserRole } from './auth';

type JwtPayload = {
  id: string;
  role: UserRole;
};

let devJwtSecret: string | null = null;
let warnedJwtSecret = false;

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET não configurado em produção');
    }

    if (!warnedJwtSecret) {
      console.warn(
        '[auth] JWT_SECRET ausente; usando chave fraca apenas para desenvolvimento.'
      );
      warnedJwtSecret = true;
    }

    if (!devJwtSecret) {
      devJwtSecret = 'dev-secret';
    }

    return devJwtSecret;
  }

  return secret;
}

export async function gerarJwt(usuario: JwtPayload) {
  const secret = new TextEncoder().encode(getJwtSecret());

  return await new SignJWT({ id: usuario.id, role: usuario.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('8h')
    .sign(secret);
}

export async function verificarJwt(token: string): Promise<JwtPayload | null> {
  try {
    const secret = new TextEncoder().encode(getJwtSecret());
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256']
    });

    const { id, role } = payload as JwtPayload;

    if (!id || !role) {
      return null;
    }

    return { id, role };
  } catch {
    return null;
  }
}
