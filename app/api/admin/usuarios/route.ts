import { NextResponse } from 'next/server';

import {
  USER_ROLES,
  hashSenha,
  isStrongPassword,
  isValidEmail,
  type UserRole
} from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateTempPassword } from '@/lib/password';
import { requireRole } from '@/lib/requireRole';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
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

    const usuarios = await prisma.usuario.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        ativo: true,
        projetoValorize: true,
        createdAt: true
      }
    });

    return NextResponse.json(usuarios);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    return NextResponse.json(
      { error: 'Erro ao listar usuários' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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

    const body = await request.json();
    const { nome, email, role, senha, projetoValorize } = body ?? {};

    if (!nome || !email || !role) {
      return NextResponse.json(
        { error: 'Nome, email e role são obrigatórios' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 422 });
    }

    const roleVal = role as UserRole;
    if (!USER_ROLES.includes(roleVal)) {
      return NextResponse.json({ error: 'Role inválido' }, { status: 422 });
    }

    const existing = await prisma.usuario.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: 'Já existe um usuário com este email' },
        { status: 409 }
      );
    }

    const senhaFinal = senha || generateTempPassword();
    if (!isStrongPassword(senhaFinal)) {
      return NextResponse.json(
        {
          error:
            'Senha deve ter ao menos 8 caracteres, uma letra maiúscula e um símbolo.'
        },
        { status: 422 }
      );
    }

    const passwordHash = await hashSenha(senhaFinal);
    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        role: roleVal,
        passwordHash,
        ativo: true,
        projetoValorize: Boolean(projetoValorize)
      },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        ativo: true,
        projetoValorize: true,
        createdAt: true
      }
    });

    return NextResponse.json({ ...usuario, tempPassword: senha ? undefined : senhaFinal }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao criar usuário' },
      { status: 500 }
    );
  }
}
