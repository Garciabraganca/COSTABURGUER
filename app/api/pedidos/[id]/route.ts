import { prisma } from "@/lib/prisma";
import { memoryStore } from "@/lib/memoryStore";
import { NextResponse } from "next/server";

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

  if (!prisma) {
    const pedido = memoryStore.get(id);
    if (!pedido) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }
    pedido.status = body.status;
    pedido.updatedAt = new Date().toISOString();
    memoryStore.set(id, pedido);
    return NextResponse.json(pedido);
  }

  const pedido = await prisma.pedido.update({
    where: { id },
    data: {
      status: body.status,
      updatedAt: new Date()
    }
  });

  return NextResponse.json(pedido);
}
