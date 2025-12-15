import { prisma } from "@/lib/prisma";
import { memoryStore } from "@/lib/memoryStore";
import { NextResponse } from "next/server";
import { notifyPedidoStatus, PedidoStatus } from "@/lib/notifyPedido";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: Request, context: RouteContext) {
  const { id } = await context.params;

  if (!prisma) {
    const pedido = memoryStore.get(id);
    if (!pedido) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }
    return NextResponse.json(pedido);
  }

  const pedido = await prisma.pedido.findUnique({
    where: { id },
    include: {
      burgers: {
        include: {
          ingredientes: {
            include: {
              ingrediente: {
                select: { id: true, slug: true, nome: true, imagem: true }
              }
            }
          }
        }
      },
      acompanhamentos: {
        include: {
          acompanhamento: {
            select: { id: true, slug: true, nome: true, imagem: true }
          }
        }
      },
      entrega: {
        include: {
          localizacoes: {
            orderBy: { createdAt: "desc" },
            take: 5
          }
        }
      }
    }
  });

  if (!pedido) {
    return NextResponse.json({ ok: false, message: "Pedido não encontrado" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, pedido });
}

export async function PATCH(req: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = await req.json();
  const newStatus = body.status as PedidoStatus;

  let pedido;
  let oldStatus: string | undefined;

  if (!prisma) {
    pedido = memoryStore.get(id);
    if (!pedido) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }
    oldStatus = pedido.status;
    pedido.status = newStatus;
    pedido.updatedAt = new Date().toISOString();
    memoryStore.set(id, pedido);
  } else {
    const existingPedido = await prisma.pedido.findUnique({ where: { id } });
    oldStatus = existingPedido?.status;

    if (!existingPedido) {
      return NextResponse.json({ ok: false, message: "Pedido não encontrado" }, { status: 404 });
    }

    if (!podeTransicionar(existingPedido.status as PedidoStatus, newStatus)) {
      return NextResponse.json({ ok: false, message: "Transição de status inválida" }, { status: 400 });
    }

    if (newStatus === "CANCELADO" && oldStatus !== "CANCELADO") {
      await reverterEstoquePedido(id);
    }

    pedido = await prisma.pedido.update({
      where: { id },
      data: { status: newStatus, updatedAt: new Date() },
      include: {
        burgers: { include: { ingredientes: true } },
        acompanhamentos: true,
        entrega: true
      }
    });
  }

  // Envia notificação push se o status mudou
  if (oldStatus !== newStatus) {
    try {
      const result = await notifyPedidoStatus(id, newStatus);
      console.log(`[Pedido ${id}] Status: ${oldStatus} -> ${newStatus}, Notificações: ${result.sent}`);
    } catch (error) {
      console.error(`[Pedido ${id}] Erro ao enviar notificação:`, error);
      // Não falha a requisição se a notificação falhar
    }
  }

  return NextResponse.json({ ok: true, pedido });
}

function podeTransicionar(atual: PedidoStatus, proximo: PedidoStatus) {
  const mapa: Record<PedidoStatus, PedidoStatus[]> = {
    CONFIRMADO: ["PREPARANDO", "CANCELADO"],
    PREPARANDO: ["PRONTO", "CANCELADO"],
    PRONTO: ["EM_ENTREGA", "ENTREGUE", "CANCELADO"],
    EM_ENTREGA: ["ENTREGUE", "CANCELADO"],
    ENTREGUE: [],
    CANCELADO: []
  };

  return mapa[atual]?.includes(proximo);
}

// Função para reverter estoque quando pedido é cancelado
async function reverterEstoquePedido(pedidoId: string) {
  // Busca as movimentações de saída deste pedido
  const movimentacoes = await prisma!.movimentacaoEstoque.findMany({
    where: {
      pedidoId,
      tipo: 'saida'
    }
  });

  // Reverte cada movimentação
  for (const mov of movimentacoes) {
    const quantidadeReverter = Math.abs(mov.quantidade);

    if (mov.tipoItem === 'ingrediente') {
      const ingrediente = await prisma!.ingrediente.findUnique({
        where: { id: mov.itemId }
      });

      if (ingrediente) {
        const novoEstoque = ingrediente.estoque + quantidadeReverter;

        await prisma!.ingrediente.update({
          where: { id: mov.itemId },
          data: { estoque: novoEstoque }
        });

        // Registra movimentação de entrada (reversão)
        await prisma!.movimentacaoEstoque.create({
          data: {
            tipoItem: 'ingrediente',
            itemId: mov.itemId,
            tipo: 'entrada',
            quantidade: quantidadeReverter,
            estoqueAnterior: ingrediente.estoque,
            estoqueAtual: novoEstoque,
            pedidoId,
            motivo: `Cancelamento do Pedido #${pedidoId}`
          }
        });
      }
    } else if (mov.tipoItem === 'acompanhamento') {
      const acompanhamento = await prisma!.acompanhamento.findUnique({
        where: { id: mov.itemId }
      });

      if (acompanhamento) {
        const novoEstoque = acompanhamento.estoque + quantidadeReverter;

        await prisma!.acompanhamento.update({
          where: { id: mov.itemId },
          data: { estoque: novoEstoque }
        });

        // Registra movimentação de entrada (reversão)
        await prisma!.movimentacaoEstoque.create({
          data: {
            tipoItem: 'acompanhamento',
            itemId: mov.itemId,
            tipo: 'entrada',
            quantidade: quantidadeReverter,
            estoqueAnterior: acompanhamento.estoque,
            estoqueAtual: novoEstoque,
            pedidoId,
            motivo: `Cancelamento do Pedido #${pedidoId}`
          }
        });
      }
    }
  }
}
