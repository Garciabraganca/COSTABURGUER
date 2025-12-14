import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { Role } from '@prisma/client';

type JwtPayload = {
  id: string;
  role: Role;
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET não configurado');
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
