import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const pedido = await prisma.pedido.findUnique({
    where: { id: params.id }
  });

  if (!pedido) {
    return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  }

  return NextResponse.json(pedido);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();

  const pedido = await prisma.pedido.update({
    where: { id: params.id },
    data: {
      status: body.status,
      updatedAt: new Date()
    }
  });

  return NextResponse.json(pedido);
}
