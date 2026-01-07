import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/relatorios - Relatório geral de vendas, custos e lucros
export async function GET(request: Request) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: 'Banco de dados não configurado' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const periodo = searchParams.get('periodo') || 'hoje'; // hoje, semana, mes, ano, custom
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
        inicio = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
    }

    const whereClause = {
      createdAt: {
        gte: inicio,
        lte: fim
      },
      status: {
        not: 'CANCELADO'
      }
    };

    // Usar agregação do banco de dados para métricas gerais (reduz transferência de dados)
    const [resumoAgregado, statusAgrupado, tipoEntregaAgrupado] = await Promise.all([
      prisma.pedido.aggregate({
        where: whereClause,
        _count: true,
        _sum: {
          total: true,
          custoTotal: true,
          lucro: true
        }
      }),
      prisma.pedido.groupBy({
        by: ['status'],
        where: whereClause,
        _count: true
      }),
      prisma.pedido.groupBy({
        by: ['tipoEntrega'],
        where: whereClause,
        _count: true
      })
    ]);

    const totalPedidos = resumoAgregado._count;
    const receitaTotal = resumoAgregado._sum.total || 0;
    const custoTotal = resumoAgregado._sum.custoTotal || 0;
    const lucroTotal = resumoAgregado._sum.lucro || 0;
    const ticketMedio = totalPedidos > 0 ? receitaTotal / totalPedidos : 0;
    const margemLucro = receitaTotal > 0 ? (lucroTotal / receitaTotal) * 100 : 0;

    // Converter groupBy para objetos
    const pedidosPorStatus: Record<string, number> = {};
    for (const s of statusAgrupado) {
      pedidosPorStatus[s.status] = s._count;
    }

    const pedidosPorTipoEntrega: Record<string, number> = {};
    for (const t of tipoEntregaAgrupado) {
      pedidosPorTipoEntrega[t.tipoEntrega] = t._count;
    }

    // Para ingredientes e histórico, buscar apenas dados necessários (limitado a 500 pedidos)
    const pedidos = await prisma.pedido.findMany({
      where: whereClause,
      take: 500,
      select: {
        createdAt: true,
        total: true,
        custoTotal: true,
        lucro: true,
        burgers: {
          select: {
            ingredientes: {
              select: {
                quantidade: true,
                precoUnitario: true,
                custoUnitario: true,
                ingrediente: {
                  select: { slug: true, nome: true, categoria: { select: { nome: true } } }
                }
              }
            }
          }
        },
        acompanhamentos: {
          select: {
            quantidade: true,
            precoUnitario: true,
            custoUnitario: true,
            acompanhamento: {
              select: { slug: true, nome: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Ingredientes mais usados
    const contagemIngredientes: Record<string, { nome: string; categoria: string; quantidade: number; receita: number; custo: number }> = {};
    for (const pedido of pedidos) {
      for (const burger of pedido.burgers) {
        for (const ing of burger.ingredientes) {
          const slug = ing.ingrediente.slug;
          if (!contagemIngredientes[slug]) {
            contagemIngredientes[slug] = {
              nome: ing.ingrediente.nome,
              categoria: ing.ingrediente.categoria?.nome || 'N/A',
              quantidade: 0,
              receita: 0,
              custo: 0
            };
          }
          contagemIngredientes[slug].quantidade += ing.quantidade;
          contagemIngredientes[slug].receita += ing.precoUnitario * ing.quantidade;
          contagemIngredientes[slug].custo += ing.custoUnitario * ing.quantidade;
        }
      }
    }

    const ingredientesMaisUsados = Object.entries(contagemIngredientes)
      .map(([slug, dados]) => ({
        slug,
        ...dados,
        lucro: dados.receita - dados.custo,
        margemLucro: dados.receita > 0 ? ((dados.receita - dados.custo) / dados.receita) * 100 : 0
      }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 20);

    // Acompanhamentos mais vendidos
    const contagemAcompanhamentos: Record<string, { nome: string; quantidade: number; receita: number; custo: number }> = {};
    for (const pedido of pedidos) {
      for (const ac of pedido.acompanhamentos) {
        const slug = ac.acompanhamento.slug;
        if (!contagemAcompanhamentos[slug]) {
          contagemAcompanhamentos[slug] = {
            nome: ac.acompanhamento.nome,
            quantidade: 0,
            receita: 0,
            custo: 0
          };
        }
        contagemAcompanhamentos[slug].quantidade += ac.quantidade;
        contagemAcompanhamentos[slug].receita += ac.precoUnitario * ac.quantidade;
        contagemAcompanhamentos[slug].custo += ac.custoUnitario * ac.quantidade;
      }
    }

    const acompanhamentosMaisVendidos = Object.entries(contagemAcompanhamentos)
      .map(([slug, dados]) => ({
        slug,
        ...dados,
        lucro: dados.receita - dados.custo,
        margemLucro: dados.receita > 0 ? ((dados.receita - dados.custo) / dados.receita) * 100 : 0
      }))
      .sort((a, b) => b.quantidade - a.quantidade);

    // Vendas por dia (para gráfico)
    const vendasPorDia: Record<string, { pedidos: number; receita: number; custo: number; lucro: number }> = {};
    for (const pedido of pedidos) {
      const dia = pedido.createdAt.toISOString().split('T')[0];
      if (!vendasPorDia[dia]) {
        vendasPorDia[dia] = { pedidos: 0, receita: 0, custo: 0, lucro: 0 };
      }
      vendasPorDia[dia].pedidos += 1;
      vendasPorDia[dia].receita += pedido.total;
      vendasPorDia[dia].custo += pedido.custoTotal;
      vendasPorDia[dia].lucro += pedido.lucro;
    }

    const historicoVendas = Object.entries(vendasPorDia)
      .map(([data, dados]) => ({ data, ...dados }))
      .sort((a, b) => a.data.localeCompare(b.data));

    return NextResponse.json({
      periodo: {
        tipo: periodo,
        inicio: inicio.toISOString(),
        fim: fim.toISOString()
      },
      resumo: {
        totalPedidos,
        receitaTotal: Math.round(receitaTotal * 100) / 100,
        custoTotal: Math.round(custoTotal * 100) / 100,
        lucroTotal: Math.round(lucroTotal * 100) / 100,
        ticketMedio: Math.round(ticketMedio * 100) / 100,
        margemLucro: Math.round(margemLucro * 100) / 100
      },
      pedidosPorStatus,
      pedidosPorTipoEntrega,
      ingredientesMaisUsados,
      acompanhamentosMaisVendidos,
      historicoVendas
    });
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar relatório' },
      { status: 500 }
    );
  }
}
