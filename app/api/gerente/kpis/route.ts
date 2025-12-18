export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    if (!prisma) {
      return NextResponse.json({ ok: false, message: "Banco não configurado" }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || "today";

    const inicio = new Date();
    if (date === "today") {
      inicio.setHours(0, 0, 0, 0);
    }

    const pedidos = await prisma.pedido.findMany({
      where: date === "today" ? { createdAt: { gte: inicio } } : undefined,
      select: { status: true, total: true }
    });

    const pedidosTipados = pedidos as Array<{ status: string; total: number }>;

    const contagens = pedidosTipados.reduce<Record<string, number>>((acc, pedido) => {
      acc[pedido.status] = (acc[pedido.status] || 0) + 1;
      return acc;
    }, {});

    const ticketMedio = pedidosTipados.length > 0
      ? pedidosTipados.reduce((sum, p) => sum + p.total, 0) / pedidosTipados.length
      : 0;

    return NextResponse.json({ ok: true, kpis: { contagens, ticketMedio, totalPedidos: pedidos.length } });
  } catch (error) {
    console.error("Erro ao calcular KPIs", error);
    return NextResponse.json({ ok: false, message: "Erro ao calcular KPIs" }, { status: 500 });
  }
}
