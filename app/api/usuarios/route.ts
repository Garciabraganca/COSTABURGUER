import { NextResponse } from 'next/server';

import { USER_ROLES, hashSenha, isStrongPassword, isValidEmail, type UserRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/requireRole';

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

    const auth = await requireRole(request, ['ADMIN']);
    if (auth.ok === false) {
      return auth.response;
    }

    const body = await request.json();
    const { nome, email, senha, role } = body;

    if (!nome || !email || !senha || !role) {
      return NextResponse.json(
        { error: 'Nome, email, senha e role são obrigatórios' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 422 });
    }

    const roleVal = role as UserRole;
    const validRoles = USER_ROLES;

    if (!validRoles.includes(roleVal)) {
      return NextResponse.json(
        { error: 'Role inválido' },
        { status: 400 }
      );
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

    const existente = await prisma.usuario.findUnique({ where: { email } });

    if (existente) {
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
        role: roleVal,
        ativo: true
      }
    });

    return NextResponse.json(
      {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
        ativo: usuario.ativo,
        createdAt: usuario.createdAt,
        updatedAt: usuario.updatedAt
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao cadastrar usuário' },
      { status: 500 }
    );
  }
}
