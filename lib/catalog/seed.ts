import { catalogManifest } from '@/lib/catalog/manifest';
import type { PrismaClient } from '@prisma/client';

const LOCK_KEY = 'auto-seed-catalog';

type SeedResult = {
  seeded: boolean;
  categoriesUpserted?: number;
  itemsUpserted?: number;
  reason?: string;
};

export async function ensureCatalogSeeded(prisma?: PrismaClient | null): Promise<SeedResult> {
  if (!prisma) return { seeded: false, reason: 'no-prisma' };

  const activeItems = await prisma.ingrediente.count({ where: { ativo: true } });
  if (activeItems > 0) return { seeded: false, reason: 'catalog-not-empty' };

  if (process.env.AUTO_SEED_CATALOG !== 'true') {
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
