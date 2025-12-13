import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/acompanhamentos/estoque - Atualizar estoque de múltiplos acompanhamentos
export async function POST(request: Request) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: 'Banco de dados não configurado' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { movimentacoes } = body;

    // Validação
    if (!Array.isArray(movimentacoes) || movimentacoes.length === 0) {
      return NextResponse.json(
        { error: 'Envie um array de movimentações' },
        { status: 400 }
      );
    }

    const resultados = [];
    const erros = [];

    for (const mov of movimentacoes) {
      const { acompanhamentoId, tipo, quantidade, motivo } = mov;

      if (!acompanhamentoId || !tipo || quantidade === undefined) {
        erros.push({
          acompanhamentoId,
          error: 'acompanhamentoId, tipo e quantidade são obrigatórios'
        });
        continue;
      }

      if (!['entrada', 'saida', 'ajuste', 'perda'].includes(tipo)) {
        erros.push({
          acompanhamentoId,
          error: 'Tipo deve ser: entrada, saida, ajuste ou perda'
        });
        continue;
      }

      try {
        // Busca acompanhamento atual
        const acompanhamento = await prisma.acompanhamento.findUnique({
          where: { id: acompanhamentoId }
        });

        if (!acompanhamento) {
          erros.push({
            acompanhamentoId,
            error: 'Acompanhamento não encontrado'
          });
          continue;
        }

        // Calcula novo estoque
        let novoEstoque: number;
        if (tipo === 'ajuste') {
          novoEstoque = quantidade;
        } else if (tipo === 'entrada') {
          novoEstoque = acompanhamento.estoque + Math.abs(quantidade);
        } else {
          novoEstoque = acompanhamento.estoque - Math.abs(quantidade);
        }

        // Não permite estoque negativo
        if (novoEstoque < 0) {
          erros.push({
            acompanhamentoId,
            error: `Estoque insuficiente. Atual: ${acompanhamento.estoque}, Solicitado: ${quantidade}`
          });
          continue;
        }

        // Atualiza estoque e registra movimentação em transação
        const [acompanhamentoAtualizado] = await prisma.$transaction([
          prisma.acompanhamento.update({
            where: { id: acompanhamentoId },
            data: { estoque: novoEstoque }
          }),
          prisma.movimentacaoEstoque.create({
            data: {
              tipoItem: 'acompanhamento',
              itemId: acompanhamentoId,
              tipo,
              quantidade: tipo === 'entrada' ? Math.abs(quantidade) : -Math.abs(quantidade),
              estoqueAnterior: acompanhamento.estoque,
              estoqueAtual: novoEstoque,
              motivo: motivo || null
            }
          })
        ]);

        resultados.push({
          acompanhamentoId,
          nome: acompanhamentoAtualizado.nome,
          estoqueAnterior: acompanhamento.estoque,
          estoqueAtual: novoEstoque,
          tipo,
          sucesso: true
        });
      } catch (error) {
        erros.push({
          acompanhamentoId,
          error: 'Erro ao processar movimentação'
        });
      }
    }

    return NextResponse.json({
      sucesso: resultados,
      erros,
      resumo: {
        processados: resultados.length,
        erros: erros.length
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar estoque:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar estoque' },
      { status: 500 }
    );
  }
}

// GET /api/acompanhamentos/estoque - Relatório de estoque de acompanhamentos
export async function GET() {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: 'Banco de dados não configurado' },
        { status: 503 }
      );
    }

    const acompanhamentos = await prisma.acompanhamento.findMany({
      where: { ativo: true },
      select: {
        id: true,
        slug: true,
        nome: true,
        estoque: true,
        estoqueMinimo: true,
        unidade: true,
        custo: true
      },
      orderBy: { nome: 'asc' }
    });

    const comEstoqueBaixo = acompanhamentos.filter(
      ac => ac.estoque < ac.estoqueMinimo
    );

    const valorTotalEstoque = acompanhamentos.reduce(
      (total, ac) => total + ac.estoque * ac.custo,
      0
    );

    return NextResponse.json({
      acompanhamentos,
      resumo: {
        totalItens: acompanhamentos.length,
        itensEstoqueBaixo: comEstoqueBaixo.length,
        alertas: comEstoqueBaixo.map(ac => ({
          id: ac.id,
          nome: ac.nome,
          estoque: ac.estoque,
          estoqueMinimo: ac.estoqueMinimo,
          faltando: ac.estoqueMinimo - ac.estoque
        })),
        valorTotalEstoque: Math.round(valorTotalEstoque * 100) / 100
      }
    });
  } catch (error) {
    console.error('Erro ao buscar relatório de estoque:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar relatório de estoque' },
      { status: 500 }
    );
  }
}
