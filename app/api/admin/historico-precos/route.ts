import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

// GET /api/admin/historico-precos - Lista histórico de preços
export async function GET(request: Request) {
  const auth = await requireRole(request, ['ADMIN', 'GERENTE']);
  if (auth.ok === false) return auth.response;

  if (!prisma) {
    return NextResponse.json({ error: 'Banco de dados não configurado' }, { status: 503 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const tipoItem = searchParams.get('tipoItem');
    const itemId = searchParams.get('itemId');
    const limite = parseInt(searchParams.get('limite') || '100');

    const where: Record<string, unknown> = {};

    if (tipoItem) {
      where.tipoItem = tipoItem;
    }

    if (itemId) {
      where.itemId = itemId;
    }

    const historico = await prisma.historicoPreco.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limite
    });

    // Agrupa por item para mostrar evolução
    const porItem: Record<string, typeof historico> = {};
    for (const h of historico) {
      const key = `${h.tipoItem}-${h.itemId}`;
      if (!porItem[key]) {
        porItem[key] = [];
      }
      porItem[key].push(h);
    }

    // Busca nomes dos itens
    const ingredientesIds = historico
      .filter(h => h.tipoItem === 'ingrediente')
      .map(h => h.itemId);

    const acompanhamentosIds = historico
      .filter(h => h.tipoItem === 'acompanhamento')
      .map(h => h.itemId);

    const ingredientes = await prisma.ingrediente.findMany({
      where: { id: { in: ingredientesIds } },
      select: { id: true, nome: true }
    });

    const acompanhamentos = await prisma.acompanhamento.findMany({
      where: { id: { in: acompanhamentosIds } },
      select: { id: true, nome: true }
    });

    const nomesMap = new Map<string, string>();
    ingredientes.forEach(i => nomesMap.set(`ingrediente-${i.id}`, i.nome));
    acompanhamentos.forEach(a => nomesMap.set(`acompanhamento-${a.id}`, a.nome));

    // Adiciona nome aos registros
    const historicoComNomes = historico.map(h => ({
      ...h,
      itemNome: nomesMap.get(`${h.tipoItem}-${h.itemId}`) || 'Item não encontrado',
      variacaoPreco: h.precoNovo - h.precoAnterior,
      variacaoPercentual: h.precoAnterior > 0
        ? Math.round(((h.precoNovo - h.precoAnterior) / h.precoAnterior) * 10000) / 100
        : 0
    }));

    return NextResponse.json({
      ok: true,
      historico: historicoComNomes,
      total: historico.length
    });
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    return NextResponse.json({ error: 'Erro ao buscar histórico' }, { status: 500 });
  }
}
