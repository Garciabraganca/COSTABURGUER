import { NextResponse } from 'next/server';

import { generateTempPassword } from '@/lib/password';
import { hashSenha, requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: 'Banco não configurado (DATABASE_URL)' },
        { status: 503 }
      );
    }

    const auth = await requireRole(_request, ['ADMIN']);
    if (auth.ok === false) return auth.response;

    const tempPassword = generateTempPassword();
    const passwordHash = await hashSenha(tempPassword);

    const usuario = await prisma.usuario.update({
      where: { id: params.id },
      data: { passwordHash },
      select: { id: true, nome: true, email: true, role: true, ativo: true, createdAt: true }
    });

    return NextResponse.json({ ...usuario, tempPassword });
  } catch (error) {
    console.error('Erro ao resetar senha', error);
    return NextResponse.json({ error: 'Erro ao resetar senha' }, { status: 500 });
  }
}
