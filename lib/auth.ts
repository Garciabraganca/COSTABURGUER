import bcrypt from 'bcrypt';

import { gerarJwt, getJwtSecret, verificarJwt } from './jwt';

export const USER_ROLES = ['ADM', 'GERENTE', 'COZINHEIRO'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export async function hashSenha(plaintext: string) {
  return bcrypt.hash(plaintext, 10);
}

export async function compararSenha(plaintext: string, hash: string) {
  return bcrypt.compare(plaintext, hash);
}

export { gerarJwt, getJwtSecret, verificarJwt };
