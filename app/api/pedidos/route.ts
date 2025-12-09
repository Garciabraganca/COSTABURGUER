import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, celular, endereco, tipoEntrega, total, itens } = body;

    if (!nome || !celular || !endereco || !tipoEntrega || typeof total !== 'number') {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    const pedido = await prisma.pedido.create({
      data: {
        nome,
        celular,
        endereco,
        tipoEntrega,
        total,
        itens,
        status: 'CONFIRMADO',
      },
    });

    return NextResponse.json(pedido, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar pedido', error);
    return NextResponse.json({ error: 'Erro ao criar pedido' }, { status: 500 });
  }
}

export async function GET() {
  const pedidos = await prisma.pedido.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(pedidos);
}
