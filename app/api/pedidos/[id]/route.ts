import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const pedido = await prisma.pedido.findUnique({ where: { id: params.id } });
  if (!pedido) {
    return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
  }
  return NextResponse.json(pedido);
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { status } = body;
    if (!status) {
      return NextResponse.json({ error: 'Status obrigatório' }, { status: 400 });
    }
    const pedido = await prisma.pedido.update({
      where: { id: params.id },
      data: { status },
    });
    return NextResponse.json(pedido);
  } catch (error) {
    console.error('Erro ao atualizar pedido', error);
    return NextResponse.json({ error: 'Erro ao atualizar pedido' }, { status: 500 });
  }
}
