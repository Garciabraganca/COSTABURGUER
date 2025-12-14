import bcrypt from 'bcryptjs';

import { gerarJwt, getJwtSecret, verificarJwt } from './jwt';

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

export { gerarJwt, getJwtSecret, verificarJwt };
