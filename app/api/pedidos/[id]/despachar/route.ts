import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/pedidos/[id]/despachar - Criar entrega e despachar pedido
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!prisma) {
      return NextResponse.json(
        { error: 'Banco de dados não configurado' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { motoboyNome, motoboyCelular } = body;

    // Buscar pedido
    const pedido = await prisma.pedido.findUnique({
      where: { id },
      include: { entrega: true }
    });

    if (!pedido) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se é entrega (não retirada)
    if (pedido.tipoEntrega !== 'ENTREGA') {
      return NextResponse.json(
        { error: 'Este pedido é para retirada, não pode ser despachado' },
        { status: 400 }
      );
    }

    // Verificar se já existe entrega
    if (pedido.entrega) {
      return NextResponse.json(
        { error: 'Este pedido já foi despachado', entrega: pedido.entrega },
        { status: 409 }
      );
    }

    // Verificar se pedido está pronto
    if (pedido.status !== 'PRONTO' && pedido.status !== 'PREPARANDO') {
      return NextResponse.json(
        { error: `Pedido não pode ser despachado no status ${pedido.status}` },
        { status: 400 }
      );
    }

    // Criar entrega e atualizar status do pedido
    const [entrega, pedidoAtualizado] = await prisma.$transaction([
      prisma.entrega.create({
        data: {
          pedidoId: id,
          motoboyNome: motoboyNome || null,
          motoboyCelular: motoboyCelular || null,
          status: 'AGUARDANDO'
        }
      }),
      prisma.pedido.update({
        where: { id },
        data: { status: 'EM_ENTREGA' }
      })
    ]);

    // URL para o motoboy acessar
    const motoboyUrl = `/motoboy/${entrega.token}`;

    return NextResponse.json({
      entrega,
      pedido: pedidoAtualizado,
      motoboyUrl,
      message: 'Pedido despachado com sucesso'
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao despachar pedido:', error);
    return NextResponse.json(
      { error: 'Erro ao despachar pedido' },
      { status: 500 }
    );
  }
}

// GET /api/pedidos/[id]/despachar - Buscar informações da entrega
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!prisma) {
      return NextResponse.json(
        { error: 'Banco de dados não configurado' },
        { status: 503 }
      );
    }

    const pedido = await prisma.pedido.findUnique({
      where: { id },
      include: {
        entrega: {
          include: {
            localizacoes: {
              orderBy: { createdAt: 'desc' },
              take: 10
            }
          }
        }
      }
    });

    if (!pedido) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      );
    }

    if (!pedido.entrega) {
      return NextResponse.json(
        { error: 'Entrega não encontrada para este pedido' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      entrega: pedido.entrega,
      pedido: {
        id: pedido.id,
        numero: pedido.numero,
        endereco: pedido.endereco,
        latitude: pedido.latitude,
        longitude: pedido.longitude,
        status: pedido.status
      }
    });
  } catch (error) {
    console.error('Erro ao buscar entrega:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar entrega' },
      { status: 500 }
    );
  }
}
