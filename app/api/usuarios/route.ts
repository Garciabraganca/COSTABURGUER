import { NextResponse } from 'next/server';
import { Role } from '@prisma/client';

import { hashSenha } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: 'Banco de dados não configurado' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { nome, email, senha, role } = body;

    if (!nome || !email || !senha || !role) {
      return NextResponse.json(
        { error: 'Nome, email, senha e role são obrigatórios' },
        { status: 400 }
      );
    }

    const roleVal = role as Role;
    const validRoles = Object.values(Role);

    if (!validRoles.includes(roleVal)) {
      return NextResponse.json(
        { error: 'Role inválido' },
        { status: 400 }
      );
    }

    const existente = await prisma.usuario.findUnique({ where: { email } });

    if (existente) {
      return NextResponse.json(
        { error: 'Já existe um usuário com este email' },
        { status: 409 }
      );
    }

    const senhaHash = await hashSenha(senha);

    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senhaHash,
        role: roleVal
      }
    });

    return NextResponse.json(
      {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
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
