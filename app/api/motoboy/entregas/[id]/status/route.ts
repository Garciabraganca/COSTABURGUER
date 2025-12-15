import { NextResponse } from 'next/server';

import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    if (!prisma) return NextResponse.json({ error: 'Banco não configurado (DATABASE_URL)' }, { status: 503 });

    const auth = await requireRole(request, ['MOTOBOY']);
    if (auth.ok === false) return auth.response;

    const body = await request.json();
    const { status } = body ?? {};
    if (typeof status !== 'string') return NextResponse.json({ error: 'Status inválido' }, { status: 400 });

    const entrega = await prisma.entrega.update({
      where: { id: params.id },
      data: { status },
      select: { id: true, status: true, token: true }
    });

    return NextResponse.json(entrega);
  } catch (error) {
    console.error('Erro ao atualizar status da entrega', error);
    return NextResponse.json({ error: 'Erro ao atualizar status' }, { status: 500 });
  }
}
