import { prisma } from "@/lib/prisma";
import { memoryStore } from "@/lib/memoryStore";
import { NextResponse } from "next/server";

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

  if (!prisma) {
    // Demo mode - store in memory
    const id = `demo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const pedido = {
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      nome: data.nome,
      celular: data.celular,
      endereco: data.endereco,
      tipoEntrega: data.tipoEntrega,
      total: data.total,
      itens: data.itens,
      status: "CONFIRMADO"
    };
    memoryStore.set(id, pedido);
    return NextResponse.json(pedido, { status: 201 });
  }

  const pedido = await prisma.pedido.create({
    data: {
      nome: data.nome,
      celular: data.celular,
      endereco: data.endereco,
      tipoEntrega: data.tipoEntrega,
      total: data.total,
      itens: data.itens,
      status: "CONFIRMADO"
    }
  });

  return NextResponse.json(pedido, { status: 201 });
}
