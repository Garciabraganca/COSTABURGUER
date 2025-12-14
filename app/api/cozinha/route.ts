import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { memoryStore } from '@/lib/memoryStore';
import { requireRole } from '@/lib/requireRole';

export const dynamic = 'force-dynamic';

// GET /api/cozinha - Listar pedidos para a cozinha
export async function GET(request: Request) {
  try {
    const auth = await requireRole(request, ['COZINHEIRO', 'GERENTE', 'ADMIN']);
    if (auth.ok === false) {
      return auth.response;
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // Filtrar por status
    const hoje = searchParams.get('hoje') === 'true'; // Apenas pedidos de hoje

    if (!prisma) {
      // Modo demo
      const pedidos = Array.from(memoryStore.values());
      return NextResponse.json(pedidos);
    }

    const where: Record<string, unknown> = {};

    // Filtro por status
    if (status) {
      where.status = status;
    } else {
      // Por padrão, mostrar apenas pedidos ativos (não entregues ou cancelados)
      where.status = {
        in: ['CONFIRMADO', 'PREPARANDO', 'PRONTO', 'EM_ENTREGA']
      };
    }

    // Filtro por data
    if (hoje) {
      const inicioHoje = new Date();
      inicioHoje.setHours(0, 0, 0, 0);

      where.createdAt = {
        gte: inicioHoje
      };
    }

    const pedidos = await prisma.pedido.findMany({
      where,
      orderBy: [
        { status: 'asc' }, // CONFIRMADO primeiro
        { createdAt: 'asc' } // Mais antigos primeiro
      ],
      include: {
        burgers: {
          include: {
            ingredientes: {
              include: {
                ingrediente: {
                  select: { id: true, slug: true, nome: true }
                }
              }
            }
          }
        },
        acompanhamentos: {
          include: {
            acompanhamento: {
              select: { id: true, slug: true, nome: true }
            }
          }
        },
        entrega: {
          select: {
            id: true,
            token: true,
            status: true,
            motoboyNome: true,
            latitudeAtual: true,
            longitudeAtual: true,
            ultimaAtualizacao: true
          }
        }
      }
    });

    // Calcular estatísticas
    const stats = {
      confirmados: pedidos.filter(p => p.status === 'CONFIRMADO').length,
      preparando: pedidos.filter(p => p.status === 'PREPARANDO').length,
      prontos: pedidos.filter(p => p.status === 'PRONTO').length,
      emEntrega: pedidos.filter(p => p.status === 'EM_ENTREGA').length,
      total: pedidos.length
    };

    return NextResponse.json({
      pedidos,
      stats
    });
  } catch (error) {
    console.error('Erro ao buscar pedidos da cozinha:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar pedidos' },
      { status: 500 }
    );
  }
}
