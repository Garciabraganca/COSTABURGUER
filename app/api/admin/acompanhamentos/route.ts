import { NextResponse } from 'next/server';

import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  const auth = await requireRole(request, ['ADMIN']);
  if (auth.ok === false) return auth.response;
  if (!prisma) return NextResponse.json({ error: 'Banco não configurado (DATABASE_URL)' }, { status: 503 });

  const acompanhamentos = await prisma.acompanhamento.findMany({ orderBy: { ordem: 'asc' } });
  return NextResponse.json(acompanhamentos);
}

export async function POST(request: Request) {
  const auth = await requireRole(request, ['ADMIN']);
  if (auth.ok === false) return auth.response;
  if (!prisma) return NextResponse.json({ error: 'Banco não configurado (DATABASE_URL)' }, { status: 503 });

  const body = await request.json();
  const { slug, nome, preco, custo = 0, estoque = 0, estoqueMinimo = 0, unidade = 'un', ordem = 0, ativo = true } = body ?? {};
  if (!slug || !nome || typeof preco !== 'number') {
    return NextResponse.json({ error: 'slug, nome e preco são obrigatórios' }, { status: 400 });
  }
  if (preco < 0 || custo < 0 || estoque < 0 || estoqueMinimo < 0) {
    return NextResponse.json({ error: 'Valores numéricos devem ser não-negativos' }, { status: 422 });
  }

  const existente = await prisma.acompanhamento.findUnique({ where: { slug } });
  if (existente) return NextResponse.json({ error: 'Slug já utilizado' }, { status: 409 });

  const acompanhamento = await prisma.acompanhamento.create({
    data: {
      slug,
      nome,
      preco,
      custo,
      estoque,
      estoqueMinimo,
      unidade,
      ordem: Math.max(0, Number(ordem) || 0),
      ativo: Boolean(ativo)
    }
  });

  return NextResponse.json(acompanhamento, { status: 201 });
}
