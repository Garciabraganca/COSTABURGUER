import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/categorias - Listar todas as categorias
export async function GET() {
  try {
    // Verifica se o Prisma está configurado
    if (!prisma) {
      return NextResponse.json(
        { error: 'Banco de dados não configurado' },
        { status: 503 }
      );
    }

    const categorias = await prisma.categoria.findMany({
      where: { ativo: true },
      orderBy: { ordem: 'asc' },
      include: {
        _count: {
          select: { ingredientes: true }
        }
      }
    });

    return NextResponse.json(categorias);
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar categorias' },
      { status: 500 }
    );
  }
}

// POST /api/categorias - Criar nova categoria
export async function POST(request: Request) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: 'Banco de dados não configurado' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { slug, nome, cor, ordem } = body;

    // Validação
    if (!slug || !nome) {
      return NextResponse.json(
        { error: 'Slug e nome são obrigatórios' },
        { status: 400 }
      );
    }

    // Verifica se já existe categoria com o mesmo slug
    const existente = await prisma.categoria.findUnique({
      where: { slug }
    });

    if (existente) {
      return NextResponse.json(
        { error: 'Já existe uma categoria com este slug' },
        { status: 409 }
      );
    }

    const categoria = await prisma.categoria.create({
      data: {
        slug,
        nome,
        cor: cor || null,
        ordem: ordem || 0,
        ativo: true
      }
    });

    return NextResponse.json(categoria, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    return NextResponse.json(
      { error: 'Erro ao criar categoria' },
      { status: 500 }
    );
  }
}
