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
    where: { id }
  });

  if (!pedido) {
    return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  }

  return NextResponse.json(pedido);
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

    pedido = await prisma.pedido.update({
      where: { id },
      data: {
        status: newStatus,
        updatedAt: new Date()
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

  return NextResponse.json(pedido);
}
