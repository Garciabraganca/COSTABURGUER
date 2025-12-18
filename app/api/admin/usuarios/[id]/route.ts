import { NextResponse } from 'next/server';

import { USER_ROLES, type UserRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/requireRole';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: 'Banco não configurado (DATABASE_URL)' },
        { status: 503 }
      );
    }

    const auth = await requireRole(request, ['ADMIN']);
    if (auth.ok === false) {
      return auth.response;
    }

    const { id } = params;
    const body = await request.json();
    const { nome, role, ativo, projetoValorize } = body ?? {};

    if (nome === undefined && role === undefined && ativo === undefined && projetoValorize === undefined) {
      return NextResponse.json(
        { error: 'Nenhum campo para atualizar' },
        { status: 400 }
      );
    }

    const data: { nome?: string; role?: UserRole; ativo?: boolean; projetoValorize?: boolean } = {};

    if (nome !== undefined) data.nome = nome;

    if (role !== undefined) {
      const roleVal = role as UserRole;
      if (!USER_ROLES.includes(roleVal)) {
        return NextResponse.json({ error: 'Role inválido' }, { status: 422 });
      }
      data.role = roleVal;
    }

    if (ativo !== undefined) {
      data.ativo = Boolean(ativo);
    }

    if (projetoValorize !== undefined) {
      data.projetoValorize = Boolean(projetoValorize);
    }

    const usuario = await prisma.usuario.update({
      where: { id },
      data,
      select: { id: true, nome: true, email: true, role: true, ativo: true, projetoValorize: true, createdAt: true }
    });

    return NextResponse.json(usuario);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    if ((error as any)?.code === 'P2025') {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Erro ao atualizar usuário' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: 'Banco não configurado (DATABASE_URL)' },
        { status: 503 }
      );
    }

    const auth = await requireRole(_request, ['ADMIN']);
    if (auth.ok === false) {
      return auth.response;
    }

    const { id } = params;
    const usuario = await prisma.usuario.update({
      where: { id },
      data: { ativo: false },
      select: { id: true, nome: true, email: true, role: true, ativo: true, projetoValorize: true, createdAt: true }
    });

    return NextResponse.json(usuario);
  } catch (error) {
    console.error('Erro ao desativar usuário:', error);
    if ((error as any)?.code === 'P2025') {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Erro ao desativar usuário' }, { status: 500 });
  }
}
