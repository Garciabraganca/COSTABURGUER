import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { notifyPedidoStatus } from "@/lib/notifyPedido";

type RouteContext = { params: Promise<{ id: string }> };

// POST /api/pedidos/[id]/cancelar - Cancela um pedido com motivo
export async function POST(req: Request, context: RouteContext) {
  const { id } = await context.params;

  if (!prisma) {
    return NextResponse.json({ error: 'Banco de dados não configurado' }, { status: 503 });
  }

  try {
    const body = await req.json();
    const { motivo } = body;

    // Busca o pedido atual
    const pedidoAtual = await prisma.pedido.findUnique({
      where: { id },
      include: {
        burgers: { include: { ingredientes: true } },
        acompanhamentos: true
      }
    });

    if (!pedidoAtual) {
      return NextResponse.json({ ok: false, error: 'Pedido não encontrado' }, { status: 404 });
    }

    // Verifica se pode cancelar
    const statusNaoCancelaveis = ['ENTREGUE', 'CANCELADO'];
    if (statusNaoCancelaveis.includes(pedidoAtual.status)) {
      return NextResponse.json({
        ok: false,
        error: `Não é possível cancelar pedido com status ${pedidoAtual.status}`
      }, { status: 400 });
    }

    // Executa cancelamento em transação
    const pedidoCancelado = await prisma.$transaction(async (tx) => {
      // 1. Reverte o estoque dos ingredientes
      const movimentacoesSaida = await tx.movimentacaoEstoque.findMany({
        where: { pedidoId: id, tipo: 'saida' }
      });

      for (const mov of movimentacoesSaida) {
        const quantidadeReverter = Math.abs(mov.quantidade);

        if (mov.tipoItem === 'ingrediente') {
          const ingrediente = await tx.ingrediente.findUnique({
            where: { id: mov.itemId }
          });

          if (ingrediente) {
            const novoEstoque = ingrediente.estoque + quantidadeReverter;

            await tx.ingrediente.update({
              where: { id: mov.itemId },
              data: { estoque: novoEstoque }
            });

            await tx.movimentacaoEstoque.create({
              data: {
                tipoItem: 'ingrediente',
                itemId: mov.itemId,
                tipo: 'entrada',
                quantidade: quantidadeReverter,
                estoqueAnterior: ingrediente.estoque,
                estoqueAtual: novoEstoque,
                pedidoId: id,
                motivo: `Cancelamento: ${motivo || 'Sem motivo informado'}`
              }
            });
          }
        } else if (mov.tipoItem === 'acompanhamento') {
          const acompanhamento = await tx.acompanhamento.findUnique({
            where: { id: mov.itemId }
          });

          if (acompanhamento) {
            const novoEstoque = acompanhamento.estoque + quantidadeReverter;

            await tx.acompanhamento.update({
              where: { id: mov.itemId },
              data: { estoque: novoEstoque }
            });

            await tx.movimentacaoEstoque.create({
              data: {
                tipoItem: 'acompanhamento',
                itemId: mov.itemId,
                tipo: 'entrada',
                quantidade: quantidadeReverter,
                estoqueAnterior: acompanhamento.estoque,
                estoqueAtual: novoEstoque,
                pedidoId: id,
                motivo: `Cancelamento: ${motivo || 'Sem motivo informado'}`
              }
            });
          }
        }
      }

      // 2. Atualiza o pedido para CANCELADO
      const pedido = await tx.pedido.update({
        where: { id },
        data: {
          status: 'CANCELADO',
          motivoCancelamento: motivo || null,
          canceladoEm: new Date(),
          updatedAt: new Date()
        },
        include: {
          burgers: { include: { ingredientes: true } },
          acompanhamentos: true,
          entrega: true
        }
      });

      // 3. Se havia entrega, cancela também
      if (pedido.entrega) {
        await tx.entrega.update({
          where: { id: pedido.entrega.id },
          data: { status: 'CANCELADO' }
        });
      }

      return pedido;
    });

    // Envia notificação de cancelamento
    try {
      await notifyPedidoStatus(id, 'CANCELADO');
      console.log(`[Pedido ${id}] Cancelado. Motivo: ${motivo || 'Não informado'}`);
    } catch (error) {
      console.error(`[Pedido ${id}] Erro ao enviar notificação de cancelamento:`, error);
    }

    return NextResponse.json({
      ok: true,
      pedido: pedidoCancelado,
      message: 'Pedido cancelado com sucesso. Estoque foi restaurado.'
    });

  } catch (error) {
    console.error('Erro ao cancelar pedido:', error);
    return NextResponse.json({ ok: false, error: 'Erro ao cancelar pedido' }, { status: 500 });
  }
}
