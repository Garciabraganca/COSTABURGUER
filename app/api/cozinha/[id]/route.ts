import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { memoryStore } from '@/lib/memoryStore';
import { notifyPedidoStatus, PedidoStatus } from '@/lib/notifyPedido';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/cozinha/[id] - Atualizar status do pedido (para a cozinha)
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    const statusValidos = ['CONFIRMADO', 'PREPARANDO', 'PRONTO', 'EM_ENTREGA', 'ENTREGUE', 'CANCELADO'];
    if (!statusValidos.includes(status)) {
      return NextResponse.json(
        { error: `Status inválido. Use: ${statusValidos.join(', ')}` },
        { status: 400 }
      );
    }

    let pedido;
    let oldStatus: string | undefined;

    if (!prisma) {
      // Modo demo
      pedido = memoryStore.get(id);
      if (!pedido) {
        return NextResponse.json(
          { error: 'Pedido não encontrado' },
          { status: 404 }
        );
      }
      oldStatus = pedido.status;
      pedido.status = status;
      pedido.updatedAt = new Date().toISOString();
      memoryStore.set(id, pedido);
    } else {
      const existingPedido = await prisma.pedido.findUnique({
        where: { id }
      });

      if (!existingPedido) {
        return NextResponse.json(
          { error: 'Pedido não encontrado' },
          { status: 404 }
        );
      }

      oldStatus = existingPedido.status;

      pedido = await prisma.pedido.update({
        where: { id },
        data: { status },
        include: {
          burgers: {
            include: {
              ingredientes: {
                include: {
                  ingrediente: {
                    select: { id: true, slug: true, nome: true }
                  }
                }
              }
            }
          },
          acompanhamentos: {
            include: {
              acompanhamento: {
                select: { id: true, slug: true, nome: true }
              }
            }
          },
          entrega: true
        }
      });
    }

    // Enviar notificação se o status mudou
    if (oldStatus !== status) {
      try {
        const result = await notifyPedidoStatus(id, status as PedidoStatus);
        console.log(`[Cozinha] Pedido ${id}: ${oldStatus} -> ${status}, Notificações: ${result.sent}`);
      } catch (error) {
        console.error(`[Cozinha] Erro ao enviar notificação:`, error);
      }
    }

    return NextResponse.json({
      pedido,
      message: `Status atualizado para ${status}`
    });
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar pedido' },
      { status: 500 }
    );
  }
}
