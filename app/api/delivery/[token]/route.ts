import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ token: string }>;
}

// GET /api/delivery/[token] - Buscar informações da entrega pelo token do motoboy
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { token } = await params;

    if (!prisma) {
      return NextResponse.json(
        { error: 'Banco de dados não configurado' },
        { status: 503 }
      );
    }

    const entrega = await prisma.entrega.findUnique({
      where: { token },
      include: {
        pedido: {
          select: {
            id: true,
            numero: true,
            nome: true,
            celular: true,
            endereco: true,
            latitude: true,
            longitude: true,
            status: true,
            total: true,
            observacoes: true
          }
        }
      }
    });

    if (!entrega) {
      return NextResponse.json(
        { error: 'Entrega não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(entrega);
  } catch (error) {
    console.error('Erro ao buscar entrega:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar entrega' },
      { status: 500 }
    );
  }
}

// PATCH /api/delivery/[token] - Atualizar status da entrega
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { token } = await params;

    if (!prisma) {
      return NextResponse.json(
        { error: 'Banco de dados não configurado' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { status } = body;

    const statusValidos = ['AGUARDANDO', 'A_CAMINHO', 'CHEGANDO', 'ENTREGUE'];
    if (!statusValidos.includes(status)) {
      return NextResponse.json(
        { error: `Status inválido. Use: ${statusValidos.join(', ')}` },
        { status: 400 }
      );
    }

    const entrega = await prisma.entrega.findUnique({
      where: { token },
      include: { pedido: true }
    });

    if (!entrega) {
      return NextResponse.json(
        { error: 'Entrega não encontrada' },
        { status: 404 }
      );
    }

    // Atualizar entrega e possivelmente o pedido
    const updateData: Record<string, unknown> = { status };

    if (status === 'A_CAMINHO' && !entrega.iniciadoEm) {
      updateData.iniciadoEm = new Date();
    }

    if (status === 'ENTREGUE') {
      updateData.finalizadoEm = new Date();
    }

    const [entregaAtualizada] = await prisma.$transaction([
      prisma.entrega.update({
        where: { token },
        data: updateData
      }),
      ...(status === 'ENTREGUE' ? [
        prisma.pedido.update({
          where: { id: entrega.pedidoId },
          data: { status: 'ENTREGUE' }
        })
      ] : [])
    ]);

    return NextResponse.json(entregaAtualizada);
  } catch (error) {
    console.error('Erro ao atualizar entrega:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar entrega' },
      { status: 500 }
    );
  }
}
