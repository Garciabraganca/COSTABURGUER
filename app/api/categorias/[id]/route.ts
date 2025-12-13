import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/categorias/[id] - Buscar categoria por ID
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!prisma) {
      return NextResponse.json(
        { error: 'Banco de dados não configurado' },
        { status: 503 }
      );
    }

    const categoria = await prisma.categoria.findUnique({
      where: { id },
      include: {
        ingredientes: {
          where: { ativo: true },
          orderBy: { ordem: 'asc' }
        }
      }
    });

    if (!categoria) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(categoria);
  } catch (error) {
    console.error('Erro ao buscar categoria:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar categoria' },
      { status: 500 }
    );
  }
}

// PATCH /api/categorias/[id] - Atualizar categoria
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!prisma) {
      return NextResponse.json(
        { error: 'Banco de dados não configurado' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { slug, nome, cor, ordem, ativo } = body;

    // Verifica se categoria existe
    const existente = await prisma.categoria.findUnique({
      where: { id }
    });

    if (!existente) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      );
    }

    // Se está alterando o slug, verifica se já existe
    if (slug && slug !== existente.slug) {
      const conflito = await prisma.categoria.findUnique({
        where: { slug }
      });
      if (conflito) {
        return NextResponse.json(
          { error: 'Já existe uma categoria com este slug' },
          { status: 409 }
        );
      }
    }

    const categoria = await prisma.categoria.update({
      where: { id },
      data: {
        ...(slug !== undefined && { slug }),
        ...(nome !== undefined && { nome }),
        ...(cor !== undefined && { cor }),
        ...(ordem !== undefined && { ordem }),
        ...(ativo !== undefined && { ativo })
      }
    });

    return NextResponse.json(categoria);
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar categoria' },
      { status: 500 }
    );
  }
}

// DELETE /api/categorias/[id] - Deletar categoria (soft delete)
export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!prisma) {
      return NextResponse.json(
        { error: 'Banco de dados não configurado' },
        { status: 503 }
      );
    }

    // Verifica se categoria existe
    const existente = await prisma.categoria.findUnique({
      where: { id },
      include: {
        _count: { select: { ingredientes: true } }
      }
    });

    if (!existente) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      );
    }

    // Verifica se há ingredientes ativos nesta categoria
    if (existente._count.ingredientes > 0) {
      // Soft delete - apenas desativa
      await prisma.categoria.update({
        where: { id },
        data: { ativo: false }
      });
      return NextResponse.json({
        message: 'Categoria desativada (possui ingredientes vinculados)'
      });
    }

    // Hard delete se não houver ingredientes
    await prisma.categoria.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Categoria removida com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar categoria:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar categoria' },
      { status: 500 }
    );
  }
}
