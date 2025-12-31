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
  const { slug, nome, preco, custo, estoque, estoqueMinimo, unidade, categoriaId, ordem, ativo, motivoPreco } = body ?? {};

  // Busca ingrediente atual para comparar preços
  const ingredienteAtual = await prisma.ingrediente.findUnique({
    where: { id: params.id }
  });

  if (!ingredienteAtual) {
    return NextResponse.json({ error: 'Ingrediente não encontrado' }, { status: 404 });
  }

  const data: any = {};
  if (slug) data.slug = slug;
  if (nome) data.nome = nome;
  if (preco !== undefined) data.preco = Number(preco);
  if (custo !== undefined) data.custo = Number(custo);
  if (estoque !== undefined) data.estoque = Number(estoque);
  if (estoqueMinimo !== undefined) data.estoqueMinimo = Number(estoqueMinimo);
  if (unidade !== undefined) data.unidade = unidade;
  if (categoriaId !== undefined) data.categoriaId = categoriaId;
  if (ordem !== undefined) data.ordem = Math.max(0, Number(ordem) || 0);
  if (ativo !== undefined) data.ativo = Boolean(ativo);

  if (data.preco !== undefined && data.preco < 0) return NextResponse.json({ error: 'Preço inválido' }, { status: 422 });

  // Registra histórico se preço ou custo mudou
  const precoMudou = data.preco !== undefined && data.preco !== ingredienteAtual.preco;
  const custoMudou = data.custo !== undefined && data.custo !== ingredienteAtual.custo;

  if (precoMudou || custoMudou) {
    await prisma.historicoPreco.create({
      data: {
        tipoItem: 'ingrediente',
        itemId: params.id,
        precoAnterior: ingredienteAtual.preco,
        precoNovo: data.preco ?? ingredienteAtual.preco,
        custoAnterior: ingredienteAtual.custo,
        custoNovo: data.custo ?? ingredienteAtual.custo,
        usuarioId: auth.payload.id,
        motivo: motivoPreco || null
      }
    });
  }

  const ingrediente = await prisma.ingrediente.update({ where: { id: params.id }, data });
  return NextResponse.json(ingrediente);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireRole(request, ['ADMIN']);
  if (auth.ok === false) return auth.response;
  if (!prisma) return NextResponse.json({ error: 'Banco não configurado (DATABASE_URL)' }, { status: 503 });

  await prisma.ingrediente.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
