import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!prisma) {
    return NextResponse.json(
      { error: 'Banco de dados não configurado' },
      { status: 503 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const categoriaSlug = searchParams.get('categoriaSlug') || undefined;

    const where: Prisma.IngredienteWhereInput = { ativo: true };

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
    return NextResponse.json(
      { error: 'Erro ao buscar ingredientes' },
      { status: 500 }
    );
  }
}
