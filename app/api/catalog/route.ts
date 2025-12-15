import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureCatalogSeeded } from '@/lib/catalog/seed';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!prisma) {
    return NextResponse.json({ ok: false, categories: [], items: [] }, { status: 503 });
  }

  let seeded;
  try {
    seeded = await ensureCatalogSeeded(prisma);
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

    return NextResponse.json({
      ok: true,
      categories: categories.map((categoria) => ({
        id: categoria.id,
        slug: categoria.slug,
        nome: categoria.nome,
        cor: categoria.cor,
        ordem: categoria.ordem,
      })),
      items: items.map((item) => ({
        id: item.id,
        slug: item.slug,
        nome: item.nome,
        preco: item.preco,
        imagem: item.imagem,
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
      })),
      seeded,
    });
  } catch (error) {
    console.error('[catalog] erro ao buscar catálogo', error);
    return NextResponse.json({ ok: true, categories: [], items: [], seeded });
  }
}
