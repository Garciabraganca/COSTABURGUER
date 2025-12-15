import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    if (!prisma) {
      return NextResponse.json({ ok: false, message: "Banco não configurado" }, { status: 503 });
    }

    const body = await request.json();
    const { pedidoId, motoboyNome, motoboyCelular } = body || {};

    if (!pedidoId) {
      return NextResponse.json({ ok: false, message: "pedidoId é obrigatório" }, { status: 400 });
    }

    const pedido = await prisma.pedido.findUnique({ where: { id: pedidoId } });
    if (!pedido) {
      return NextResponse.json({ ok: false, message: "Pedido não encontrado" }, { status: 404 });
    }

    const entregaExistente = await prisma.entrega.findUnique({ where: { pedidoId } });

    const entrega = entregaExistente
      ? await prisma.entrega.update({
          where: { id: entregaExistente.id },
          data: { motoboyNome, motoboyCelular }
        })
      : await prisma.entrega.create({
          data: { pedidoId, motoboyNome, motoboyCelular, status: "AGUARDANDO" }
        });

    if (pedido.status !== "EM_ENTREGA" && pedido.status !== "ENTREGUE") {
      await prisma.pedido.update({ where: { id: pedidoId }, data: { status: "EM_ENTREGA" } });
    }

    return NextResponse.json({ ok: true, entregaId: entrega.id, token: entrega.token });
  } catch (error) {
    console.error("Erro ao despachar entrega", error);
    return NextResponse.json({ ok: false, message: "Erro ao despachar" }, { status: 500 });
  }
}
