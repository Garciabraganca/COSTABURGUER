import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/ingredientes/estoque - Atualizar estoque de múltiplos ingredientes
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
      const { ingredienteId, tipo, quantidade, motivo } = mov;

      if (!ingredienteId || !tipo || quantidade === undefined) {
        erros.push({
          ingredienteId,
          error: 'ingredienteId, tipo e quantidade são obrigatórios'
        });
        continue;
      }

      if (!['entrada', 'saida', 'ajuste', 'perda'].includes(tipo)) {
        erros.push({
          ingredienteId,
          error: 'Tipo deve ser: entrada, saida, ajuste ou perda'
        });
        continue;
      }

      try {
        // Busca ingrediente atual
        const ingrediente = await prisma.ingrediente.findUnique({
          where: { id: ingredienteId }
        });

        if (!ingrediente) {
          erros.push({
            ingredienteId,
            error: 'Ingrediente não encontrado'
          });
          continue;
        }

        // Calcula novo estoque
        let novoEstoque: number;
        if (tipo === 'ajuste') {
          // Ajuste é o valor absoluto
          novoEstoque = quantidade;
        } else if (tipo === 'entrada') {
          novoEstoque = ingrediente.estoque + Math.abs(quantidade);
        } else {
          // saida ou perda
          novoEstoque = ingrediente.estoque - Math.abs(quantidade);
        }

        // Não permite estoque negativo
        if (novoEstoque < 0) {
          erros.push({
            ingredienteId,
            error: `Estoque insuficiente. Atual: ${ingrediente.estoque}, Solicitado: ${quantidade}`
          });
          continue;
        }

        // Atualiza estoque e registra movimentação em transação
        const [ingredienteAtualizado] = await prisma.$transaction([
          prisma.ingrediente.update({
            where: { id: ingredienteId },
            data: { estoque: novoEstoque }
          }),
          prisma.movimentacaoEstoque.create({
            data: {
              tipoItem: 'ingrediente',
              itemId: ingredienteId,
              tipo,
              quantidade: tipo === 'entrada' ? Math.abs(quantidade) : -Math.abs(quantidade),
              estoqueAnterior: ingrediente.estoque,
              estoqueAtual: novoEstoque,
              motivo: motivo || null
            }
          })
        ]);

        resultados.push({
          ingredienteId,
          nome: ingredienteAtualizado.nome,
          estoqueAnterior: ingrediente.estoque,
          estoqueAtual: novoEstoque,
          tipo,
          sucesso: true
        });
      } catch (error) {
        erros.push({
          ingredienteId,
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

// GET /api/ingredientes/estoque - Relatório de estoque
export async function GET() {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: 'Banco de dados não configurado' },
        { status: 503 }
      );
    }

    const ingredientes = await prisma.ingrediente.findMany({
      where: { ativo: true },
      select: {
        id: true,
        slug: true,
        nome: true,
        estoque: true,
        estoqueMinimo: true,
        unidade: true,
        custo: true,
        categoria: {
          select: { slug: true, nome: true }
        }
      },
      orderBy: [{ categoria: { ordem: 'asc' } }, { nome: 'asc' }]
    });

    const comEstoqueBaixo = ingredientes.filter(
      ing => ing.estoque < ing.estoqueMinimo
    );

    const valorTotalEstoque = ingredientes.reduce(
      (total, ing) => total + ing.estoque * ing.custo,
      0
    );

    return NextResponse.json({
      ingredientes,
      resumo: {
        totalItens: ingredientes.length,
        itensEstoqueBaixo: comEstoqueBaixo.length,
        alertas: comEstoqueBaixo.map(ing => ({
          id: ing.id,
          nome: ing.nome,
          estoque: ing.estoque,
          estoqueMinimo: ing.estoqueMinimo,
          faltando: ing.estoqueMinimo - ing.estoque
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
