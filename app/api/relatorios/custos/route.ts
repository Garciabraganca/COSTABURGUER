import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/relatorios/custos - Relatório detalhado de custos
export async function GET(request: Request) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: 'Banco de dados não configurado' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const periodo = searchParams.get('periodo') || 'mes';
    const dataInicio = searchParams.get('dataInicio');
    const dataFim = searchParams.get('dataFim');

    // Calcular datas do filtro
    const agora = new Date();
    let inicio: Date;
    let fim: Date = agora;

    switch (periodo) {
      case 'hoje':
        inicio = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
        break;
      case 'semana':
        const diaSemana = agora.getDay();
        inicio = new Date(agora);
        inicio.setDate(agora.getDate() - diaSemana);
        inicio.setHours(0, 0, 0, 0);
        break;
      case 'mes':
        inicio = new Date(agora.getFullYear(), agora.getMonth(), 1);
        break;
      case 'ano':
        inicio = new Date(agora.getFullYear(), 0, 1);
        break;
      case 'custom':
        if (!dataInicio || !dataFim) {
          return NextResponse.json(
            { error: 'Para período customizado, informe dataInicio e dataFim' },
            { status: 400 }
          );
        }
        inicio = new Date(dataInicio);
        fim = new Date(dataFim);
        fim.setHours(23, 59, 59, 999);
        break;
      default:
        inicio = new Date(agora.getFullYear(), agora.getMonth(), 1);
    }

    // Buscar todos os ingredientes com categorias
    const ingredientes = await prisma.ingrediente.findMany({
      where: { ativo: true },
      include: {
        categoria: {
          select: { slug: true, nome: true }
        }
      }
    });

    // Buscar acompanhamentos
    const acompanhamentos = await prisma.acompanhamento.findMany({
      where: { ativo: true }
    });

    // Buscar movimentações do período
    const movimentacoes = await prisma.movimentacaoEstoque.findMany({
      where: {
        createdAt: {
          gte: inicio,
          lte: fim
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calcular custo de estoque atual
    const custoEstoqueIngredientes = ingredientes.reduce(
      (sum, ing) => sum + (ing.estoque * ing.custo),
      0
    );

    const custoEstoqueAcompanhamentos = acompanhamentos.reduce(
      (sum, ac) => sum + (ac.estoque * ac.custo),
      0
    );

    // Custos por categoria de ingrediente
    const custosPorCategoria: Record<string, { nome: string; custoEstoque: number; itens: number }> = {};
    for (const ing of ingredientes) {
      const slug = ing.categoria.slug;
      if (!custosPorCategoria[slug]) {
        custosPorCategoria[slug] = {
          nome: ing.categoria.nome,
          custoEstoque: 0,
          itens: 0
        };
      }
      custosPorCategoria[slug].custoEstoque += ing.estoque * ing.custo;
      custosPorCategoria[slug].itens += 1;
    }

    // Movimentações resumidas
    const resumoMovimentacoes = {
      entradas: 0,
      saidas: 0,
      ajustes: 0,
      perdas: 0
    };

    for (const mov of movimentacoes) {
      if (mov.tipo === 'entrada') {
        resumoMovimentacoes.entradas += Math.abs(mov.quantidade);
      } else if (mov.tipo === 'saida') {
        resumoMovimentacoes.saidas += Math.abs(mov.quantidade);
      } else if (mov.tipo === 'ajuste') {
        resumoMovimentacoes.ajustes += 1;
      } else if (mov.tipo === 'perda') {
        resumoMovimentacoes.perdas += Math.abs(mov.quantidade);
      }
    }

    // Ingredientes com maior custo em estoque
    const ingredientesOrdenadosPorCusto = ingredientes
      .map(ing => ({
        id: ing.id,
        slug: ing.slug,
        nome: ing.nome,
        categoria: ing.categoria.nome,
        estoque: ing.estoque,
        custo: ing.custo,
        custoTotalEstoque: ing.estoque * ing.custo
      }))
      .sort((a, b) => b.custoTotalEstoque - a.custoTotalEstoque)
      .slice(0, 20);

    // Análise de margem de lucro por ingrediente
    const margemPorIngrediente = ingredientes.map(ing => ({
      id: ing.id,
      slug: ing.slug,
      nome: ing.nome,
      categoria: ing.categoria.nome,
      preco: ing.preco,
      custo: ing.custo,
      lucroUnitario: ing.preco - ing.custo,
      margemLucro: ing.preco > 0 ? ((ing.preco - ing.custo) / ing.preco) * 100 : 0
    })).sort((a, b) => b.margemLucro - a.margemLucro);

    // Acompanhamentos com análise de margem
    const margemPorAcompanhamento = acompanhamentos.map(ac => ({
      id: ac.id,
      slug: ac.slug,
      nome: ac.nome,
      preco: ac.preco,
      custo: ac.custo,
      estoque: ac.estoque,
      lucroUnitario: ac.preco - ac.custo,
      margemLucro: ac.preco > 0 ? ((ac.preco - ac.custo) / ac.preco) * 100 : 0,
      custoTotalEstoque: ac.estoque * ac.custo
    })).sort((a, b) => b.margemLucro - a.margemLucro);

    return NextResponse.json({
      periodo: {
        tipo: periodo,
        inicio: inicio.toISOString(),
        fim: fim.toISOString()
      },
      resumoEstoque: {
        custoTotalEstoque: Math.round((custoEstoqueIngredientes + custoEstoqueAcompanhamentos) * 100) / 100,
        custoEstoqueIngredientes: Math.round(custoEstoqueIngredientes * 100) / 100,
        custoEstoqueAcompanhamentos: Math.round(custoEstoqueAcompanhamentos * 100) / 100,
        totalIngredientes: ingredientes.length,
        totalAcompanhamentos: acompanhamentos.length
      },
      custosPorCategoria: Object.entries(custosPorCategoria).map(([slug, dados]) => ({
        slug,
        ...dados,
        custoEstoque: Math.round(dados.custoEstoque * 100) / 100
      })),
      resumoMovimentacoes,
      ingredientesMaiorCusto: ingredientesOrdenadosPorCusto.map(ing => ({
        ...ing,
        custoTotalEstoque: Math.round(ing.custoTotalEstoque * 100) / 100
      })),
      analiseMargemIngredientes: margemPorIngrediente.map(ing => ({
        ...ing,
        lucroUnitario: Math.round(ing.lucroUnitario * 100) / 100,
        margemLucro: Math.round(ing.margemLucro * 100) / 100
      })),
      analiseMargemAcompanhamentos: margemPorAcompanhamento.map(ac => ({
        ...ac,
        lucroUnitario: Math.round(ac.lucroUnitario * 100) / 100,
        margemLucro: Math.round(ac.margemLucro * 100) / 100,
        custoTotalEstoque: Math.round(ac.custoTotalEstoque * 100) / 100
      }))
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de custos:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar relatório de custos' },
      { status: 500 }
    );
  }
}
