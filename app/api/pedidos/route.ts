import { prisma } from "@/lib/prisma";
import { memoryStore } from "@/lib/memoryStore";
import { NextResponse } from "next/server";
import pushStore from "@/lib/pushStore";
import { notifyPedidoStatus } from "@/lib/notifyPedido";

export async function GET() {
  if (!prisma) {
    return NextResponse.json(Array.from(memoryStore.values()));
  }

  const pedidos = await prisma.pedido.findMany({
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(pedidos);
}

export async function POST(req: Request) {
  const data = await req.json();
  const { pushEndpoint, ...orderData } = data;

  let pedido;

  if (!prisma) {
    // Demo mode - store in memory
    const id = `demo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    pedido = {
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      nome: orderData.nome,
      celular: orderData.celular,
      endereco: orderData.endereco,
      tipoEntrega: orderData.tipoEntrega,
      total: orderData.total,
      itens: orderData.itens,
      status: "CONFIRMADO"
    };
    memoryStore.set(id, pedido);
  } else {
    pedido = await prisma.pedido.create({
      data: {
        nome: orderData.nome,
        celular: orderData.celular,
        endereco: orderData.endereco,
        tipoEntrega: orderData.tipoEntrega,
        total: orderData.total,
        itens: orderData.itens,
        status: "CONFIRMADO"
      }
    });
  }

  // Vincula a subscription do cliente ao pedido (para notificações futuras)
  if (pushEndpoint) {
    pushStore.linkToPedido(pushEndpoint, pedido.id);
    console.log(`[Pedido ${pedido.id}] Subscription vinculada: ${pushEndpoint.slice(-20)}...`);
  }

  // Envia notificação de confirmação
  try {
    const result = await notifyPedidoStatus(pedido.id, "CONFIRMADO");
    console.log(`[Pedido ${pedido.id}] Notificação de confirmação enviada: ${result.sent} dispositivo(s)`);
  } catch (error) {
    console.error(`[Pedido ${pedido.id}] Erro ao enviar notificação de confirmação:`, error);
  }

  return NextResponse.json(pedido, { status: 201 });
}
