import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: { token: string } };

const allowed = ["AGUARDANDO", "A_CAMINHO", "CHEGANDO", "ENTREGUE"] as const;
type StatusEntrega = typeof allowed[number];

export async function PATCH(request: Request, { params }: Params) {
  try {
    if (!prisma) {
      return NextResponse.json({ ok: false, message: "Banco não configurado" }, { status: 503 });
    }

    const { status } = await request.json();
    if (!allowed.includes(status)) {
      return NextResponse.json({ ok: false, message: "Status inválido" }, { status: 400 });
    }

    const entrega = await prisma.entrega.findUnique({ where: { token: params.token } });
    if (!entrega) {
      return NextResponse.json({ ok: false, message: "Entrega não encontrada" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = { status };
    if (status === "A_CAMINHO" && !entrega.iniciadoEm) updateData.iniciadoEm = new Date();
    if (status === "ENTREGUE") updateData.finalizadoEm = new Date();

    const entregaAtualizada = await prisma.entrega.update({ where: { id: entrega.id }, data: updateData });

    if (status === "ENTREGUE") {
      await prisma.pedido.update({ where: { id: entrega.pedidoId }, data: { status: "ENTREGUE" } });
    }

    return NextResponse.json({ ok: true, entrega: entregaAtualizada });
  } catch (error) {
    console.error("Erro ao atualizar entrega", error);
    return NextResponse.json({ ok: false, message: "Erro ao atualizar" }, { status: 500 });
  }
}
