import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ token: string }>;
}

// POST /api/delivery/[token]/location - Atualizar localização do motoboy
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { token } = await params;

    if (!prisma) {
      return NextResponse.json(
        { error: 'Banco de dados não configurado' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { latitude, longitude, precisao, velocidade, direcao } = body;

    // Validar coordenadas
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return NextResponse.json(
        { error: 'Latitude e longitude são obrigatórias' },
        { status: 400 }
      );
    }

    // Validar range das coordenadas
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { error: 'Coordenadas inválidas' },
        { status: 400 }
      );
    }

    const entrega = await prisma.entrega.findUnique({
      where: { token }
    });

    if (!entrega) {
      return NextResponse.json(
        { error: 'Entrega não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se a entrega ainda está ativa
    if (entrega.status === 'ENTREGUE') {
      return NextResponse.json(
        { error: 'Entrega já finalizada' },
        { status: 400 }
      );
    }

    const agora = new Date();

    // Atualizar localização atual e criar registro no histórico
    const [entregaAtualizada, localizacao] = await prisma.$transaction([
      prisma.entrega.update({
        where: { token },
        data: {
          latitudeAtual: latitude,
          longitudeAtual: longitude,
          ultimaAtualizacao: agora,
          // Se ainda está aguardando e recebeu localização, muda para a_caminho
          ...(entrega.status === 'AGUARDANDO' ? {
            status: 'A_CAMINHO',
            iniciadoEm: agora
          } : {})
        }
      }),
      prisma.localizacaoEntrega.create({
        data: {
          entregaId: entrega.id,
          latitude,
          longitude,
          precisao: precisao || null,
          velocidade: velocidade || null,
          direcao: direcao || null
        }
      })
    ]);

    return NextResponse.json({
      entrega: entregaAtualizada,
      localizacao,
      message: 'Localização atualizada'
    });
  } catch (error) {
    console.error('Erro ao atualizar localização:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar localização' },
      { status: 500 }
    );
  }
}

// GET /api/delivery/[token]/location - Buscar histórico de localizações
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
        localizacoes: {
          orderBy: { createdAt: 'desc' },
          take: 100
        },
        pedido: {
          select: {
            latitude: true,
            longitude: true,
            endereco: true
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

    return NextResponse.json({
      localizacaoAtual: entrega.latitudeAtual && entrega.longitudeAtual ? {
        latitude: entrega.latitudeAtual,
        longitude: entrega.longitudeAtual,
        ultimaAtualizacao: entrega.ultimaAtualizacao
      } : null,
      destino: entrega.pedido.latitude && entrega.pedido.longitude ? {
        latitude: entrega.pedido.latitude,
        longitude: entrega.pedido.longitude,
        endereco: entrega.pedido.endereco
      } : null,
      historico: entrega.localizacoes
    });
  } catch (error) {
    console.error('Erro ao buscar localizações:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar localizações' },
      { status: 500 }
    );
  }
}
