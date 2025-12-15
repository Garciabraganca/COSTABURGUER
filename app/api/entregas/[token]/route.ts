import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: { token: string } }) {
  try {
    if (!prisma) {
      return NextResponse.json({ ok: false, message: "Banco não configurado" }, { status: 503 });
    }

    const entrega = await prisma.entrega.findUnique({
      where: { token: params.token },
      include: {
        pedido: {
          select: {
            id: true,
            numero: true,
            nome: true,
            celular: true,
            endereco: true,
            tipoEntrega: true,
            status: true,
            observacoes: true
          }
        },
        localizacoes: {
          orderBy: { createdAt: "desc" },
          take: 20
        }
      }
    });

    if (!entrega) {
      return NextResponse.json({ ok: false, message: "Entrega não encontrada" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, entrega });
  } catch (error) {
    console.error("Erro ao buscar entrega", error);
    return NextResponse.json({ ok: false, message: "Erro ao buscar entrega" }, { status: 500 });
  }
}
