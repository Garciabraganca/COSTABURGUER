import { NextResponse } from 'next/server';

import { hashSenha, isStrongPassword } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateTempPassword } from '@/lib/password';
import { requireRole } from '@/lib/requireRole';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request, { params }: { params: { id: string } }) {
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
    const body = await request.json().catch(() => ({}));
    const { novaSenha } = body ?? {};

    const senhaFinal = novaSenha || generateTempPassword();

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
    const usuario = await prisma.usuario.update({
      where: { id },
      data: { passwordHash },
      select: { id: true, nome: true, email: true, role: true, ativo: true, createdAt: true }
    });

    return NextResponse.json({ ...usuario, tempPassword: novaSenha ? undefined : senhaFinal });
  } catch (error) {
    console.error('Erro ao resetar senha:', error);
    if ((error as any)?.code === 'P2025') {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Erro ao resetar senha' }, { status: 500 });
  }
}
