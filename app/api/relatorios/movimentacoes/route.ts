import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/relatorios/movimentacoes - Histórico de movimentações de estoque
export async function GET(request: Request) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: 'Banco de dados não configurado' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const tipoItem = searchParams.get('tipoItem'); // 'ingrediente' ou 'acompanhamento'
    const itemId = searchParams.get('itemId');
    const tipo = searchParams.get('tipo'); // 'entrada', 'saida', 'ajuste', 'perda'
    const limite = parseInt(searchParams.get('limite') || '100');
    const pagina = parseInt(searchParams.get('pagina') || '1');

    const where: Record<string, unknown> = {};

    if (tipoItem) {
      where.tipoItem = tipoItem;
    }

    if (itemId) {
      where.itemId = itemId;
    }

    if (tipo) {
      where.tipo = tipo;
    }

    const skip = (pagina - 1) * limite;

    // Contar total
    const total = await prisma.movimentacaoEstoque.count({ where });

    // Buscar movimentações
    const movimentacoes = await prisma.movimentacaoEstoque.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limite
    });

    // Enriquecer com nomes dos itens
    const ingredientesIds = new Set<string>();
    const acompanhamentosIds = new Set<string>();

    for (const mov of movimentacoes) {
      if (mov.tipoItem === 'ingrediente') {
        ingredientesIds.add(mov.itemId);
      } else {
        acompanhamentosIds.add(mov.itemId);
      }
    }

    const ingredientes = ingredientesIds.size > 0
      ? await prisma.ingrediente.findMany({
          where: { id: { in: Array.from(ingredientesIds) } },
          select: { id: true, nome: true, slug: true }
        })
      : [];

    const acompanhamentos = acompanhamentosIds.size > 0
      ? await prisma.acompanhamento.findMany({
          where: { id: { in: Array.from(acompanhamentosIds) } },
          select: { id: true, nome: true, slug: true }
        })
      : [];

    const ingredienteMap = new Map(ingredientes.map(i => [i.id, i]));
    const acompanhamentoMap = new Map(acompanhamentos.map(a => [a.id, a]));

    const movimentacoesEnriquecidas = movimentacoes.map(mov => {
      let item = null;
      if (mov.tipoItem === 'ingrediente') {
        item = ingredienteMap.get(mov.itemId);
      } else {
        item = acompanhamentoMap.get(mov.itemId);
      }

      return {
        ...mov,
        itemNome: item?.nome || 'Item não encontrado',
        itemSlug: item?.slug || 'N/A'
      };
    });

    return NextResponse.json({
      movimentacoes: movimentacoesEnriquecidas,
      paginacao: {
        pagina,
        limite,
        total,
        totalPaginas: Math.ceil(total / limite)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar movimentações:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar movimentações' },
      { status: 500 }
    );
  }
}
