import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fallbackCatalogIngredients } from '@/lib/catalogo/fallbackIngredientes';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!prisma) {
    console.warn('Prisma indisponível, servindo catálogo estático de emergência.');
    return NextResponse.json(fallbackCatalogIngredients, {
      headers: {
        'x-catalog-fallback': 'true',
      },
    });
  }

  try {
    const { searchParams } = new URL(request.url);
    const categoriaSlug = searchParams.get('categoriaSlug') || undefined;

    const where: Record<string, unknown> = { ativo: true };

    if (categoriaSlug) {
      where.categoria = { slug: categoriaSlug };
    }

    const ingredientes = await prisma.ingrediente.findMany({
      where,
      orderBy: [
        { categoria: { ordem: 'asc' } },
        { ordem: 'asc' },
        { nome: 'asc' },
      ],
      include: {
        categoria: true,
      },
    });

    return NextResponse.json(
      ingredientes.map((ingrediente) => ({
        id: ingrediente.id,
        slug: ingrediente.slug,
        nome: ingrediente.nome,
        preco: ingrediente.preco,
        imagem: ingrediente.imagem,
        categoriaSlug: ingrediente.categoria?.slug ?? null,
        categoria: ingrediente.categoria
          ? {
              id: ingrediente.categoria.id,
              slug: ingrediente.categoria.slug,
              nome: ingrediente.categoria.nome,
              cor: ingrediente.categoria.cor,
              ordem: ingrediente.categoria.ordem,
            }
          : null,
        ordem: ingrediente.ordem,
      }))
    );
  } catch (error) {
    console.error('Erro ao buscar ingredientes do catálogo', error);

    // Em cenários onde o banco apresenta inconsistências (ex: conflitos de chave única),
    // devolvemos um catálogo estático para não quebrar a experiência do cliente.
    return NextResponse.json(fallbackCatalogIngredients, {
      headers: {
        'x-catalog-fallback': 'true',
        'x-catalog-error': error instanceof Error ? error.message : 'unknown-error',
      },
    });
  }
}
