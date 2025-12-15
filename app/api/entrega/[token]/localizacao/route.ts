import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const lastUpdate: Record<string, number> = {};

export async function POST(request: Request, { params }: { params: { token: string } }) {
  try {
    if (!prisma) {
      return NextResponse.json({ error: 'Banco não configurado (DATABASE_URL)' }, { status: 503 });
    }

    const body = await request.json();
    const { latitude, longitude, precisao, velocidade, direcao } = body ?? {};

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return NextResponse.json({ error: 'Coordenadas inválidas' }, { status: 400 });
    }

    const entrega = await prisma.entrega.findUnique({ where: { token: params.token } });
    if (!entrega) {
      return NextResponse.json({ error: 'Entrega não encontrada' }, { status: 404 });
    }

    const now = Date.now();
    const last = lastUpdate[params.token] ?? 0;
    if (now - last < 3000) {
      return NextResponse.json({ error: 'Aguarde antes de enviar novamente' }, { status: 429 });
    }
    lastUpdate[params.token] = now;

    await prisma.localizacaoEntrega.create({
      data: {
        entregaId: entrega.id,
        latitude,
        longitude,
        precisao,
        velocidade,
        direcao
      }
    });

    await prisma.entrega.update({
      where: { id: entrega.id },
      data: { latitudeAtual: latitude, longitudeAtual: longitude, ultimaAtualizacao: new Date() }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Erro ao registrar localização', error);
    return NextResponse.json({ error: 'Erro ao registrar localização' }, { status: 500 });
  }
}
