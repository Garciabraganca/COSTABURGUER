import { NextRequest, NextResponse } from 'next/server';
import { getIngredientImage } from '@/lib/assets/ingredientImages';
import { prisma } from '@/lib/prisma';
import { catalogTablesStatus, ensureCatalogSeeded } from '@/lib/catalog/seed';

export const dynamic = 'force-dynamic';

function log(message: string, extra?: unknown) {
  if (extra) {
    console.log(`[catalog] ${message}`, extra);
  } else {
    console.log(`[catalog] ${message}`);
  }
}

function buildCatalogResponse(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export async function GET(request: NextRequest) {
  if (!prisma) {
    return buildCatalogResponse(
      { ok: false, code: 'PRISMA_UNAVAILABLE', message: 'Prisma não inicializado', categories: [], items: [] },
      503
    );
  }

  const { searchParams } = request.nextUrl;
  const shouldSeed = searchParams.get('seed') === '1';

  let tablesOk = false;
  let missing: string[] = [];

  try {
    const status = await catalogTablesStatus(prisma);
    tablesOk = status.ok;
    missing = status.missing;
  } catch (error) {
    console.error('[catalog] falha ao validar tabelas', error);
    return buildCatalogResponse({
      ok: false,
      code: 'CATALOG_CHECK_FAILED',
      message: 'Erro ao verificar tabelas do catálogo.',
      categories: [],
      items: [],
    });
  }

  if (!tablesOk) {
    log('tabelas ausentes', { missing });
    return buildCatalogResponse({
      ok: false,
      code: 'MISSING_TABLES',
      message: 'Tabelas necessárias não encontradas.',
      missing,
      categories: [],
      items: [],
      action: 'APPLY_MIGRATIONS',
    });
  }

  let seeded;
  try {
    seeded = await ensureCatalogSeeded(prisma, { force: shouldSeed });
  } catch (error) {
    console.error('[catalog] falha ao tentar auto seed', error);
    seeded = { seeded: false, reason: 'seed-error' };
  }

  try {
    const [categories, items] = await Promise.all([
      prisma.categoria.findMany({
        where: { ativo: true },
        orderBy: [{ ordem: 'asc' }, { nome: 'asc' }],
      }),
      prisma.ingrediente.findMany({
        where: { ativo: true },
        orderBy: [
          { categoria: { ordem: 'asc' } },
          { ordem: 'asc' },
          { nome: 'asc' },
        ],
        include: { categoria: true },
      }),
    ]);

    const normalizedCategories = categories.map((categoria) => ({
      id: categoria.id,
      slug: categoria.slug,
      nome: categoria.nome,
      cor: categoria.cor,
      ordem: categoria.ordem,
    }));

    const normalizedItems = items.map((item) => {
      const manifestImage = getIngredientImage(item.slug) || getIngredientImage(item.categoria?.slug);
      return {
        id: item.id,
        slug: item.slug,
        nome: item.nome,
        preco: item.preco,
        imagem: manifestImage || item.imagem,
        categoriaSlug: item.categoria?.slug ?? null,
        categoria: item.categoria
          ? {
              id: item.categoria.id,
              slug: item.categoria.slug,
              nome: item.categoria.nome,
              cor: item.categoria.cor,
              ordem: item.categoria.ordem,
            }
          : null,
        ordem: item.ordem,
      };
    });

    if (normalizedItems.length === 0) {
      const payload = {
        ok: false,
        code: 'CATALOG_EMPTY',
        message: 'Catálogo vazio. Rode as migrations e o seed.',
        action: 'RUN_SEED',
        categories: normalizedCategories,
        items: normalizedItems,
        seeded,
      } as const;

      log('catálogo vazio', payload);
      return buildCatalogResponse(payload, 200);
    }

    return buildCatalogResponse({
      ok: true,
      message: 'catálogo carregado',
      categories: normalizedCategories,
      items: normalizedItems,
      seeded,
    });
  } catch (error) {
    console.error('[catalog] erro ao buscar catálogo', error);
    return buildCatalogResponse({
      ok: false,
      code: 'CATALOG_QUERY_ERROR',
      message: 'Erro ao consultar catálogo',
      categories: [],
      items: [],
      seeded,
    });
  }
}
