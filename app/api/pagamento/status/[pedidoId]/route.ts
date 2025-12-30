import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { pedidoId: string } }
) {
  try {
    const { pedidoId } = params;

    if (!pedidoId) {
      return NextResponse.json(
        { error: 'pedidoId é obrigatório' },
        { status: 400 }
      );
    }

    if (!prisma) {
      return NextResponse.json(
        { error: 'Banco de dados não disponível' },
        { status: 503 }
      );
    }

    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId },
      select: {
        id: true,
        numero: true,
        status: true,
        statusPagamento: true,
        mercadoPagoPaymentId: true,
        formaPagamento: true,
        total: true,
        createdAt: true,
      },
    });

    if (!pedido) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      pedido: {
        id: pedido.id,
        numero: pedido.numero,
        status: pedido.status,
        statusPagamento: pedido.statusPagamento,
        paymentId: pedido.mercadoPagoPaymentId,
        formaPagamento: pedido.formaPagamento,
        total: pedido.total,
        criadoEm: pedido.createdAt,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar status do pagamento:', error);
    return NextResponse.json(
      { error: 'Erro interno' },
      { status: 500 }
    );
  }
}
