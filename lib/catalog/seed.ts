import { catalogManifest } from '@/lib/catalog/manifest';
import { Prisma, type PrismaClient } from '@prisma/client';

const LOCK_KEY = 'auto-seed-catalog';

type SeedResult = {
  seeded: boolean;
  categoriesUpserted?: number;
  itemsUpserted?: number;
  reason?: string;
};

type TablesCheckResult = {
  missing: string[];
  ok: boolean;
};

export const EXPECTED_CATALOG_TABLES = [
  'categoria',
  'ingrediente',
  'acompanhamento',
  'configuracao',
  'pedido',
  'entrega',
  'catalog_seed_state',
];

const MISSING_TABLE_ERROR_CODES = new Set(['P2021', 'P2019']);

function isMissingTableError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    MISSING_TABLE_ERROR_CODES.has(error.code)
  );
}

async function checkTable(prisma: PrismaClient, name: string, check: () => Promise<unknown>) {
  try {
    await check();
    return { name, exists: true } as const;
  } catch (error) {
    if (isMissingTableError(error)) {
      return { name, exists: false } as const;
    }

    console.error(`[catalog] erro ao verificar tabela ${name}`, error);
    throw error;
  }
}

export async function catalogTablesStatus(prisma: PrismaClient): Promise<TablesCheckResult> {
  const tables = [
    { name: 'categoria', check: () => prisma.categoria.count({ take: 1 }) },
    { name: 'ingrediente', check: () => prisma.ingrediente.count({ take: 1 }) },
    { name: 'acompanhamento', check: () => prisma.acompanhamento.count({ take: 1 }) },
    { name: 'configuracao', check: () => prisma.configuracao.count({ take: 1 }) },
    { name: 'pedido', check: () => prisma.pedido.count({ take: 1 }) },
    { name: 'entrega', check: () => prisma.entrega.count({ take: 1 }) },
    { name: 'catalog_seed_state', check: () => prisma.catalogSeedState.count({ take: 1 }) },
  ];

  const results = await Promise.all(tables.map((table) => checkTable(prisma, table.name, table.check)));
  const missing = results.filter((result) => !result.exists).map((result) => result.name);

  return { missing, ok: missing.length === 0 };
}

export async function ensureCatalogSeeded(
  prisma?: PrismaClient | null,
  opts: { force?: boolean } = {}
): Promise<SeedResult> {
  if (!prisma) return { seeded: false, reason: 'no-prisma' };

  const { ok: tablesReady } = await catalogTablesStatus(prisma);
  if (!tablesReady) return { seeded: false, reason: 'missing-tables' };

  const activeItems = await prisma.ingrediente.count({ where: { ativo: true } });
  if (activeItems > 0) return { seeded: false, reason: 'catalog-not-empty' };

  const envEnabled = ['1', 'true', 'yes'].includes(
    String(process.env.AUTO_SEED_CATALOG ?? '').toLowerCase()
  );

  if (!envEnabled && !opts.force) {
    return { seeded: false, reason: 'env-disabled' };
  }

  const lock = await prisma.catalogSeedState.upsert({
    where: { key: LOCK_KEY },
    update: {},
    create: { key: LOCK_KEY },
  });

  if (lock.doneAt) {
    return { seeded: false, reason: 'already-done' };
  }

  try {
    const categoryRecords = await Promise.all(
      catalogManifest.categories.map((category) =>
        prisma.categoria.upsert({
          where: { slug: category.slug },
          update: {
            nome: category.nome,
            cor: category.cor,
            ordem: category.ordem,
            ativo: category.ativo ?? true,
          },
          create: {
            slug: category.slug,
            nome: category.nome,
            cor: category.cor,
            ordem: category.ordem,
            ativo: category.ativo ?? true,
          },
        })
      )
    );

    const categoriesBySlug = categoryRecords.reduce<Record<string, string>>((acc, category) => {
      acc[category.slug] = category.id;
      return acc;
    }, {});

    const ingredientRecords = await Promise.all(
      catalogManifest.ingredients.map((ingredient) => {
        const categoriaId = categoriesBySlug[ingredient.categoriaSlug];
        if (!categoriaId) return null;

        return prisma.ingrediente.upsert({
          where: { slug: ingredient.slug },
          update: {
            nome: ingredient.nome,
            preco: ingredient.preco,
            custo: ingredient.custo,
            ordem: ingredient.ordem,
            imagem: ingredient.imagemPath,
            ativo: ingredient.ativo ?? true,
            categoriaId,
          },
          create: {
            slug: ingredient.slug,
            nome: ingredient.nome,
            preco: ingredient.preco,
            custo: ingredient.custo,
            ordem: ingredient.ordem,
            imagem: ingredient.imagemPath,
            ativo: ingredient.ativo ?? true,
            categoriaId,
          },
        });
      })
    );

    await prisma.catalogSeedState.update({
      where: { key: LOCK_KEY },
      data: { doneAt: new Date() },
    });

    return {
      seeded: true,
      categoriesUpserted: categoryRecords.length,
      itemsUpserted: ingredientRecords.filter(Boolean).length,
    };
  } catch (error) {
    console.error('[catalog-seed] erro ao popular catálogo', error);
    return { seeded: false, reason: 'seed-error' };
  }
}
