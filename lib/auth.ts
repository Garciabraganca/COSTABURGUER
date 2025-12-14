import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const USER_ROLES = ['ADM', 'GERENTE', 'COZINHEIRO'] as const;
export type UserRole = (typeof USER_ROLES)[number];

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

export async function hashSenha(plaintext: string) {
  return bcrypt.hash(plaintext, 10);
}

export async function compararSenha(plaintext: string, hash: string) {
  return bcrypt.compare(plaintext, hash);
}

export async function gerarJwt(usuario: JwtPayload) {
  return jwt.sign({ id: usuario.id, role: usuario.role }, getJwtSecret(), {
    expiresIn: '8h'
  });
}

export async function verificarJwt(token: string): Promise<JwtPayload | null> {
  try {
    const decoded = jwt.verify(token, getJwtSecret());

    if (typeof decoded === 'string') {
      return null;
    }

    const { id, role } = decoded as JwtPayload;

    if (!id || !role) {
      return null;
    }

    return { id, role };
  } catch {
    return null;
  }
}
