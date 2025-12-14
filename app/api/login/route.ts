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
        { error: 'Banco não configurado (DATABASE_URL)' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { email, senha } = body;

    if (!email || !senha) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    const usuario = await prisma.usuario.findUnique({ where: { email } });

    if (!usuario || !usuario.ativo) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    const senhaValida = await compararSenha(senha, usuario.passwordHash);

    if (!senhaValida) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    const token = await gerarJwt({ id: usuario.id, role: usuario.role });

    const response = NextResponse.json({ role: usuario.role });
    response.headers.set(
      'Set-Cookie',
      `token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=28800`
    );

    return response;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientInitializationError) {
      console.error('Banco de dados indisponível:', error);
      return NextResponse.json(
        { error: 'Banco de dados indisponível. Tente novamente mais tarde.' },
        { status: 503 }
      );
    }

    console.error('Erro ao realizar login:', error);
    return NextResponse.json(
      { error: 'Erro ao realizar login' },
      { status: 500 }
    );
  }
}
