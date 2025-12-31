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
  const { slug, nome, preco, custo, estoque, estoqueMinimo, unidade, ordem, ativo, motivoPreco } = body ?? {};

  // Busca acompanhamento atual para comparar preços
  const acompanhamentoAtual = await prisma.acompanhamento.findUnique({
    where: { id: params.id }
  });

  if (!acompanhamentoAtual) {
    return NextResponse.json({ error: 'Acompanhamento não encontrado' }, { status: 404 });
  }

  const data: any = {};
  if (slug) data.slug = slug;
  if (nome) data.nome = nome;
  if (preco !== undefined) data.preco = Number(preco);
  if (custo !== undefined) data.custo = Number(custo);
  if (estoque !== undefined) data.estoque = Number(estoque);
  if (estoqueMinimo !== undefined) data.estoqueMinimo = Number(estoqueMinimo);
  if (unidade !== undefined) data.unidade = unidade;
  if (ordem !== undefined) data.ordem = Math.max(0, Number(ordem) || 0);
  if (ativo !== undefined) data.ativo = Boolean(ativo);

  // Registra histórico se preço ou custo mudou
  const precoMudou = data.preco !== undefined && data.preco !== acompanhamentoAtual.preco;
  const custoMudou = data.custo !== undefined && data.custo !== acompanhamentoAtual.custo;

  if (precoMudou || custoMudou) {
    await prisma.historicoPreco.create({
      data: {
        tipoItem: 'acompanhamento',
        itemId: params.id,
        precoAnterior: acompanhamentoAtual.preco,
        precoNovo: data.preco ?? acompanhamentoAtual.preco,
        custoAnterior: acompanhamentoAtual.custo,
        custoNovo: data.custo ?? acompanhamentoAtual.custo,
        usuarioId: auth.payload.id,
        motivo: motivoPreco || null
      }
    });
  }

  const acompanhamento = await prisma.acompanhamento.update({ where: { id: params.id }, data });
  return NextResponse.json(acompanhamento);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireRole(request, ['ADMIN']);
  if (auth.ok === false) return auth.response;
  if (!prisma) return NextResponse.json({ error: 'Banco não configurado (DATABASE_URL)' }, { status: 503 });

  await prisma.acompanhamento.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
