import { NextResponse } from 'next/server';

import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  const auth = await requireRole(request, ['ADMIN']);
  if (auth.ok === false) return auth.response;
  if (!prisma) return NextResponse.json({ error: 'Banco não configurado (DATABASE_URL)' }, { status: 503 });

  const categorias = await prisma.categoria.findMany({ orderBy: { ordem: 'asc' } });
  return NextResponse.json(categorias);
}

export async function POST(request: Request) {
  const auth = await requireRole(request, ['ADMIN']);
  if (auth.ok === false) return auth.response;
  if (!prisma) return NextResponse.json({ error: 'Banco não configurado (DATABASE_URL)' }, { status: 503 });

  const body = await request.json();
  const { slug, nome, cor, ordem = 0, ativo = true } = body ?? {};
  if (!slug || !nome) return NextResponse.json({ error: 'slug e nome são obrigatórios' }, { status: 400 });

  const existente = await prisma.categoria.findUnique({ where: { slug } });
  if (existente) return NextResponse.json({ error: 'Slug já utilizado' }, { status: 409 });

  const categoria = await prisma.categoria.create({ data: { slug, nome, cor, ordem: Math.max(0, Number(ordem) || 0), ativo: Boolean(ativo) } });
  return NextResponse.json(categoria, { status: 201 });
}
