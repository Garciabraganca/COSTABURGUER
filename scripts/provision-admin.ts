import { Role } from '@prisma/client';

import { hashSenha } from '../lib/auth';
import { prisma } from '../lib/prisma';

async function main() {
  const email = process.env.ADMIN_EMAIL || 'adrbrag18@gmail.com';
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    throw new Error('ADMIN_PASSWORD não definido. Configure a variável de ambiente.');
  }

  if (password.length < 10) {
    throw new Error('ADMIN_PASSWORD deve ter pelo menos 10 caracteres.');
  }

  if (!prisma) {
    throw new Error('Prisma Client não inicializado (verifique DATABASE_URL).');
  }

  const passwordHash = await hashSenha(password);
  const now = new Date();

  await prisma.usuario.upsert({
    where: { email },
    update: {
      nome: 'Admin',
      role: Role.ADMIN,
      ativo: true,
      passwordHash,
      passwordUpdatedAt: now
    },
    create: {
      email,
      nome: 'Admin',
      role: Role.ADMIN,
      ativo: true,
      passwordHash,
      passwordUpdatedAt: now
    }
  });

  console.log('OK: admin provisionado');
}

main()
  .catch(error => {
    console.error('Erro ao provisionar admin:', error?.message || error);
    process.exit(1);
  })
  .finally(async () => {
    if (prisma) {
      await prisma.$disconnect();
    }
  });
