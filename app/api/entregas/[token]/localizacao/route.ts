import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: { token: string } }) {
  try {
    if (!prisma) {
      return NextResponse.json({ ok: false, message: "Banco não configurado" }, { status: 503 });
    }

    const body = await request.json();
    const { latitude, longitude, precisao, velocidade, direcao } = body ?? {};

    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return NextResponse.json({ ok: false, message: "Coordenadas inválidas" }, { status: 400 });
    }

    const entrega = await prisma.entrega.findUnique({ where: { token: params.token } });
    if (!entrega) {
      return NextResponse.json({ ok: false, message: "Entrega não encontrada" }, { status: 404 });
    }

    await prisma.localizacaoEntrega.create({
      data: { entregaId: entrega.id, latitude, longitude, precisao, velocidade, direcao }
    });

    await prisma.entrega.update({
      where: { id: entrega.id },
      data: { latitudeAtual: latitude, longitudeAtual: longitude, ultimaAtualizacao: new Date() }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao registrar localização", error);
    return NextResponse.json({ ok: false, message: "Erro ao registrar localização" }, { status: 500 });
  }
}
