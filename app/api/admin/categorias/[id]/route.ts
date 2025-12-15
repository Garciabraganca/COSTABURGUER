import { NextResponse } from 'next/server';

import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireRole(request, ['ADMIN']);
  if (auth.ok === false) return auth.response;
  if (!prisma) return NextResponse.json({ error: 'Banco não configurado (DATABASE_URL)' }, { status: 503 });

  const body = await request.json();
  const { slug, nome, cor, ordem, ativo } = body ?? {};

  const data: any = {};
  if (slug) data.slug = slug;
  if (nome) data.nome = nome;
  if (cor !== undefined) data.cor = cor;
  if (ordem !== undefined) data.ordem = Math.max(0, Number(ordem) || 0);
  if (ativo !== undefined) data.ativo = Boolean(ativo);

  try {
    const categoria = await prisma.categoria.update({ where: { id: params.id }, data });
    return NextResponse.json(categoria);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar categoria' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireRole(request, ['ADMIN']);
  if (auth.ok === false) return auth.response;
  if (!prisma) return NextResponse.json({ error: 'Banco não configurado (DATABASE_URL)' }, { status: 503 });

  await prisma.categoria.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
