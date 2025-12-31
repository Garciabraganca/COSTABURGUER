import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

// GET /api/admin/limites-burger - Busca configuração de limites
export async function GET(request: Request) {
  const auth = await requireRole(request, ['ADMIN', 'GERENTE']);
  if (!auth.ok) return auth.response;

  if (!prisma) {
    return NextResponse.json({ error: 'Banco de dados não configurado' }, { status: 503 });
  }

  try {
    let limites = await prisma.limiteBurger.findFirst({
      where: { ativo: true }
    });

    // Se não existir, cria configuração padrão
    if (!limites) {
      limites = await prisma.limiteBurger.create({
        data: {
          maxIngredientes: 15,
          maxPorCategoria: 5,
          maxBurgersNoPedido: 10,
          limitesPorCategoria: {
            pao: 2,
            carne: 4,
            queijo: 3,
            molho: 4,
            vegetal: 6,
            extra: 5
          },
          ativo: true
        }
      });
    }

    return NextResponse.json({ ok: true, limites });
  } catch (error) {
    console.error('Erro ao buscar limites:', error);
    return NextResponse.json({ error: 'Erro ao buscar limites' }, { status: 500 });
  }
}

// PATCH /api/admin/limites-burger - Atualiza configuração de limites
export async function PATCH(request: Request) {
  const auth = await requireRole(request, ['ADMIN']);
  if (!auth.ok) return auth.response;

  if (!prisma) {
    return NextResponse.json({ error: 'Banco de dados não configurado' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const {
      maxIngredientes,
      maxPorCategoria,
      maxBurgersNoPedido,
      limitesPorCategoria,
      valorMinimo,
      valorMaximo
    } = body;

    // Busca configuração ativa
    let limites = await prisma.limiteBurger.findFirst({
      where: { ativo: true }
    });

    const updateData: Record<string, unknown> = {};

    if (maxIngredientes !== undefined) {
      if (maxIngredientes < 1 || maxIngredientes > 50) {
        return NextResponse.json({
          error: 'maxIngredientes deve estar entre 1 e 50'
        }, { status: 400 });
      }
      updateData.maxIngredientes = maxIngredientes;
    }

    if (maxPorCategoria !== undefined) {
      if (maxPorCategoria < 1 || maxPorCategoria > 20) {
        return NextResponse.json({
          error: 'maxPorCategoria deve estar entre 1 e 20'
        }, { status: 400 });
      }
      updateData.maxPorCategoria = maxPorCategoria;
    }

    if (maxBurgersNoPedido !== undefined) {
      if (maxBurgersNoPedido < 1 || maxBurgersNoPedido > 50) {
        return NextResponse.json({
          error: 'maxBurgersNoPedido deve estar entre 1 e 50'
        }, { status: 400 });
      }
      updateData.maxBurgersNoPedido = maxBurgersNoPedido;
    }

    if (limitesPorCategoria !== undefined) {
      updateData.limitesPorCategoria = limitesPorCategoria;
    }

    if (valorMinimo !== undefined) {
      updateData.valorMinimo = valorMinimo || null;
    }

    if (valorMaximo !== undefined) {
      updateData.valorMaximo = valorMaximo || null;
    }

    if (limites) {
      limites = await prisma.limiteBurger.update({
        where: { id: limites.id },
        data: updateData
      });
    } else {
      limites = await prisma.limiteBurger.create({
        data: {
          maxIngredientes: maxIngredientes || 15,
          maxPorCategoria: maxPorCategoria || 5,
          maxBurgersNoPedido: maxBurgersNoPedido || 10,
          limitesPorCategoria: limitesPorCategoria || {},
          valorMinimo: valorMinimo || null,
          valorMaximo: valorMaximo || null,
          ativo: true
        }
      });
    }

    return NextResponse.json({ ok: true, limites });
  } catch (error) {
    console.error('Erro ao atualizar limites:', error);
    return NextResponse.json({ error: 'Erro ao atualizar limites' }, { status: 500 });
  }
}
