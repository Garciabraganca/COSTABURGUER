import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const pedidos = await prisma.pedido.findMany({
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(pedidos);
}

export async function POST(req: Request) {
  const data = await req.json();

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
