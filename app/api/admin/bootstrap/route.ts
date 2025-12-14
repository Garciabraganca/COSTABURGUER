import { NextResponse } from 'next/server';

import { hashSenha, isStrongPassword, isValidEmail } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { gerarJwt } from '@/lib/jwt';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function needsBootstrap() {
  if (!prisma) return false;
  const count = await prisma.usuario.count();
  return count === 0;
}

export async function POST(request: Request) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: 'Banco não configurado (DATABASE_URL)' },
        { status: 503 }
      );
    }

    const adminBootstrapKey = process.env.ADMIN_BOOTSTRAP_KEY;
    if (!adminBootstrapKey) {
      return NextResponse.json(
        { error: 'ADMIN_BOOTSTRAP_KEY não configurado no ambiente' },
        { status: 500 }
      );
    }

    const bootstrapRequired = await needsBootstrap();
    if (!bootstrapRequired) {
      return NextResponse.json(
        { error: 'Bootstrap já foi realizado' },
        { status: 400 }
      );
    }

    const providedKey = request.headers.get('x-admin-bootstrap-key');
    if (providedKey !== adminBootstrapKey) {
      return NextResponse.json(
        { error: 'Chave de ativação inválida' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { nome, email, senha } = body ?? {};

    if (!nome || !email || !senha) {
      return NextResponse.json(
        { error: 'Nome, email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 422 });
    }

    if (!isStrongPassword(senha)) {
      return NextResponse.json(
        {
          error:
            'Senha deve ter ao menos 8 caracteres, uma letra maiúscula e um símbolo.'
        },
        { status: 422 }
      );
    }

    const existing = await prisma.usuario.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: 'Já existe um usuário com este email' },
        { status: 409 }
      );
    }

    const passwordHash = await hashSenha(senha);
    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        passwordHash,
        role: 'ADMIN',
        ativo: true
      }
    });

    const token = await gerarJwt({ id: usuario.id, role: usuario.role });
    const response = NextResponse.json({ id: usuario.id, role: usuario.role });
    response.headers.set(
      'Set-Cookie',
      `token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=28800`
    );

    return response;
  } catch (error) {
    console.error('Erro ao realizar bootstrap admin:', error);
    return NextResponse.json(
      { error: 'Erro ao realizar bootstrap' },
      { status: 500 }
    );
  }
}
