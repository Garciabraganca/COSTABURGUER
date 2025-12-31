import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

// POST /api/admin/estoque/lote - Operação em lote de estoque
export async function POST(request: Request) {
  const auth = await requireRole(request, ['ADMIN', 'GERENTE']);
  if (!auth.ok) return auth.response;

  if (!prisma) {
    return NextResponse.json({ error: 'Banco de dados não configurado' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { operacao, itens, motivo } = body;

    // Validações
    if (!operacao || !['entrada', 'saida', 'ajuste', 'perda'].includes(operacao)) {
      return NextResponse.json({
        error: 'Operação deve ser: entrada, saida, ajuste ou perda'
      }, { status: 400 });
    }

    if (!Array.isArray(itens) || itens.length === 0) {
      return NextResponse.json({
        error: 'Envie um array de itens com { tipo, id, quantidade }'
      }, { status: 400 });
    }

    const resultados: Array<{
      tipo: string;
      id: string;
      nome: string;
      estoqueAnterior: number;
      estoqueAtual: number;
      sucesso: boolean;
    }> = [];

    const erros: Array<{
      tipo: string;
      id: string;
      error: string;
    }> = [];

    // Processa em transação
    await prisma.$transaction(async (tx) => {
      for (const item of itens) {
        const { tipo, id, quantidade } = item;

        if (!tipo || !id || quantidade === undefined) {
          erros.push({ tipo, id, error: 'tipo, id e quantidade são obrigatórios' });
          continue;
        }

        if (!['ingrediente', 'acompanhamento'].includes(tipo)) {
          erros.push({ tipo, id, error: 'tipo deve ser ingrediente ou acompanhamento' });
          continue;
        }

        try {
          let itemAtual: { id: string; nome: string; estoque: number } | null = null;

          if (tipo === 'ingrediente') {
            itemAtual = await tx.ingrediente.findUnique({
              where: { id },
              select: { id: true, nome: true, estoque: true }
            });
          } else {
            itemAtual = await tx.acompanhamento.findUnique({
              where: { id },
              select: { id: true, nome: true, estoque: true }
            });
          }

          if (!itemAtual) {
            erros.push({ tipo, id, error: 'Item não encontrado' });
            continue;
          }

          // Calcula novo estoque
          let novoEstoque: number;
          if (operacao === 'ajuste') {
            novoEstoque = quantidade;
          } else if (operacao === 'entrada') {
            novoEstoque = itemAtual.estoque + Math.abs(quantidade);
          } else {
            novoEstoque = itemAtual.estoque - Math.abs(quantidade);
          }

          if (novoEstoque < 0) {
            erros.push({
              tipo,
              id,
              error: `Estoque insuficiente. Atual: ${itemAtual.estoque}`
            });
            continue;
          }

          // Atualiza estoque
          if (tipo === 'ingrediente') {
            await tx.ingrediente.update({
              where: { id },
              data: { estoque: novoEstoque }
            });
          } else {
            await tx.acompanhamento.update({
              where: { id },
              data: { estoque: novoEstoque }
            });
          }

          // Registra movimentação
          await tx.movimentacaoEstoque.create({
            data: {
              tipoItem: tipo,
              itemId: id,
              tipo: operacao,
              quantidade: operacao === 'entrada'
                ? Math.abs(quantidade)
                : -Math.abs(quantidade),
              estoqueAnterior: itemAtual.estoque,
              estoqueAtual: novoEstoque,
              motivo: motivo || `Operação em lote: ${operacao}`
            }
          });

          resultados.push({
            tipo,
            id,
            nome: itemAtual.nome,
            estoqueAnterior: itemAtual.estoque,
            estoqueAtual: novoEstoque,
            sucesso: true
          });
        } catch (err) {
          erros.push({ tipo, id, error: 'Erro ao processar item' });
        }
      }
    });

    return NextResponse.json({
      ok: true,
      operacao,
      resultados,
      erros,
      resumo: {
        processados: resultados.length,
        erros: erros.length,
        total: itens.length
      }
    });
  } catch (error) {
    console.error('Erro na operação em lote:', error);
    return NextResponse.json({ error: 'Erro na operação em lote' }, { status: 500 });
  }
}

// GET /api/admin/estoque/lote - Template para importação
export async function GET(request: Request) {
  const auth = await requireRole(request, ['ADMIN', 'GERENTE']);
  if (!auth.ok) return auth.response;

  if (!prisma) {
    return NextResponse.json({ error: 'Banco de dados não configurado' }, { status: 503 });
  }

  try {
    // Retorna lista de todos os itens para facilitar importação
    const ingredientes = await prisma.ingrediente.findMany({
      where: { ativo: true },
      select: {
        id: true,
        nome: true,
        estoque: true,
        estoqueMinimo: true,
        unidade: true,
        categoria: { select: { nome: true } }
      },
      orderBy: [{ categoria: { ordem: 'asc' } }, { nome: 'asc' }]
    });

    const acompanhamentos = await prisma.acompanhamento.findMany({
      where: { ativo: true },
      select: {
        id: true,
        nome: true,
        estoque: true,
        estoqueMinimo: true,
        unidade: true
      },
      orderBy: { nome: 'asc' }
    });

    const template = {
      instrucoes: {
        operacoes: ['entrada', 'saida', 'ajuste', 'perda'],
        formato: {
          operacao: 'tipo de operação',
          motivo: 'descrição opcional',
          itens: [
            { tipo: 'ingrediente ou acompanhamento', id: 'ID do item', quantidade: 'número' }
          ]
        },
        exemplo: {
          operacao: 'entrada',
          motivo: 'Reposição semanal',
          itens: [
            { tipo: 'ingrediente', id: ingredientes[0]?.id || 'ID_AQUI', quantidade: 50 },
            { tipo: 'acompanhamento', id: acompanhamentos[0]?.id || 'ID_AQUI', quantidade: 20 }
          ]
        }
      },
      ingredientes: ingredientes.map(i => ({
        tipo: 'ingrediente',
        id: i.id,
        nome: i.nome,
        categoria: i.categoria?.nome,
        estoqueAtual: i.estoque,
        estoqueMinimo: i.estoqueMinimo,
        unidade: i.unidade
      })),
      acompanhamentos: acompanhamentos.map(a => ({
        tipo: 'acompanhamento',
        id: a.id,
        nome: a.nome,
        estoqueAtual: a.estoque,
        estoqueMinimo: a.estoqueMinimo,
        unidade: a.unidade
      }))
    };

    return NextResponse.json({ ok: true, ...template });
  } catch (error) {
    console.error('Erro ao gerar template:', error);
    return NextResponse.json({ error: 'Erro ao gerar template' }, { status: 500 });
  }
}
