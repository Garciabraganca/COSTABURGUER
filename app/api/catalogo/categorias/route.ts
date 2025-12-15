import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!prisma) {
    return NextResponse.json(
      { error: 'Banco de dados não configurado' },
      { status: 503 }
    );
  }

  try {
    const categorias = await prisma.categoria.findMany({
      where: { ativo: true },
      orderBy: [{ ordem: 'asc' }, { nome: 'asc' }],
    });

    return NextResponse.json(
      categorias.map((categoria) => ({
        id: categoria.id,
        slug: categoria.slug,
        nome: categoria.nome,
        cor: categoria.cor,
        ordem: categoria.ordem,
      }))
    );
  } catch (error) {
    console.error('Erro ao buscar categorias do catálogo', error);
    return NextResponse.json(
      { error: 'Erro ao buscar categorias' },
      { status: 500 }
    );
  }
}
