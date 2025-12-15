import { NextResponse } from 'next/server';

import { compararSenha, gerarJwt } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { ok: false, message: 'Banco não configurado (DATABASE_URL)' },
        { status: 503 }
      );
    }

    const body = await request.json().catch(() => null);
    const { email, senha } = body || {};

    if (!email || !senha) {
      return NextResponse.json(
        { ok: false, message: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    const usuario = await prisma.usuario.findUnique({ where: { email } });

    if (!usuario || !usuario.ativo) {
      return NextResponse.json(
        { ok: false, message: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    const senhaValida = await compararSenha(senha, usuario.passwordHash);

    if (!senhaValida) {
      return NextResponse.json(
        { ok: false, message: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    const token = await gerarJwt({ id: usuario.id, role: usuario.role });

    const response = NextResponse.json({ ok: true, role: usuario.role });
    response.headers.set(
      'Set-Cookie',
      `token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=28800`
    );

    return response;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientInitializationError) {
      console.error('Banco de dados indisponível:', error);
      return NextResponse.json(
        { ok: false, message: 'Banco de dados indisponível. Tente novamente mais tarde.' },
        { status: 503 }
      );
    }

    console.error('Erro ao realizar login:', error);
    return NextResponse.json(
      { ok: false, message: 'Erro ao realizar login' },
      { status: 500 }
    );
  }
}
