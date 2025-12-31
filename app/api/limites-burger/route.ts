import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/limites-burger - Busca limites (público)
export async function GET() {
  if (!prisma) {
    // Retorna limites padrão se não há banco
    return NextResponse.json({
      ok: true,
      limites: {
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
        }
      }
    });
  }

  try {
    const limites = await prisma.limiteBurger.findFirst({
      where: { ativo: true },
      select: {
        maxIngredientes: true,
        maxPorCategoria: true,
        maxBurgersNoPedido: true,
        limitesPorCategoria: true,
        valorMinimo: true,
        valorMaximo: true
      }
    });

    if (!limites) {
      return NextResponse.json({
        ok: true,
        limites: {
          maxIngredientes: 15,
          maxPorCategoria: 5,
          maxBurgersNoPedido: 10,
          limitesPorCategoria: {}
        }
      });
    }

    return NextResponse.json({ ok: true, limites });
  } catch (error) {
    console.error('Erro ao buscar limites:', error);
    return NextResponse.json({ error: 'Erro ao buscar limites' }, { status: 500 });
  }
}

// POST /api/limites-burger - Valida um burger contra os limites
export async function POST(request: Request) {
  if (!prisma) {
    return NextResponse.json({ ok: true, valido: true });
  }

  try {
    const body = await request.json();
    const { ingredientes, burgers } = body;

    const limites = await prisma.limiteBurger.findFirst({
      where: { ativo: true }
    });

    if (!limites) {
      return NextResponse.json({ ok: true, valido: true });
    }

    const erros: string[] = [];

    // Valida quantidade de burgers no pedido
    if (burgers && burgers.length > limites.maxBurgersNoPedido) {
      erros.push(`Máximo de ${limites.maxBurgersNoPedido} burgers por pedido`);
    }

    // Valida ingredientes de um burger
    if (ingredientes) {
      // Total de ingredientes
      const totalIngredientes = ingredientes.reduce(
        (acc: number, ing: { quantidade?: number }) => acc + (ing.quantidade || 1),
        0
      );

      if (totalIngredientes > limites.maxIngredientes) {
        erros.push(`Máximo de ${limites.maxIngredientes} ingredientes por burger`);
      }

      // Valida por categoria se houver limites específicos
      const limitesCat = limites.limitesPorCategoria as Record<string, number> | null;
      if (limitesCat && Object.keys(limitesCat).length > 0) {
        // Agrupa por categoria
        const porCategoria: Record<string, number> = {};

        for (const ing of ingredientes) {
          if (ing.categoriaSlug) {
            const cat = ing.categoriaSlug.toLowerCase();
            porCategoria[cat] = (porCategoria[cat] || 0) + (ing.quantidade || 1);
          }
        }

        // Verifica limites por categoria
        for (const [cat, quantidade] of Object.entries(porCategoria)) {
          const limite = limitesCat[cat] || limites.maxPorCategoria;
          if (quantidade > limite) {
            erros.push(`Máximo de ${limite} itens da categoria ${cat}`);
          }
        }
      }

      // Valida valor mínimo/máximo se informado
      if (body.valorBurger !== undefined) {
        if (limites.valorMinimo && body.valorBurger < limites.valorMinimo) {
          erros.push(`Valor mínimo do burger: R$ ${limites.valorMinimo.toFixed(2)}`);
        }
        if (limites.valorMaximo && body.valorBurger > limites.valorMaximo) {
          erros.push(`Valor máximo do burger: R$ ${limites.valorMaximo.toFixed(2)}`);
        }
      }
    }

    return NextResponse.json({
      ok: true,
      valido: erros.length === 0,
      erros,
      limites: {
        maxIngredientes: limites.maxIngredientes,
        maxPorCategoria: limites.maxPorCategoria,
        maxBurgersNoPedido: limites.maxBurgersNoPedido,
        limitesPorCategoria: limites.limitesPorCategoria
      }
    });
  } catch (error) {
    console.error('Erro ao validar limites:', error);
    return NextResponse.json({ error: 'Erro ao validar' }, { status: 500 });
  }
}
