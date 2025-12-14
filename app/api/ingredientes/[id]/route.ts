import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/requireRole';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/ingredientes/[id] - Buscar ingrediente por ID
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const auth = await requireRole(_request, ['GERENTE', 'ADMIN']);
    if (auth.ok === false) {
      return auth.response;
    }

    const { id } = await params;

    if (!prisma) {
      return NextResponse.json(
        { error: 'Banco de dados não configurado' },
        { status: 503 }
      );
    }

    const ingrediente = await prisma.ingrediente.findUnique({
      where: { id },
      include: {
        categoria: {
          select: { id: true, slug: true, nome: true, cor: true }
        }
      }
    });

    if (!ingrediente) {
      return NextResponse.json(
        { error: 'Ingrediente não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(ingrediente);
  } catch (error) {
    console.error('Erro ao buscar ingrediente:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar ingrediente' },
      { status: 500 }
    );
  }
}

// PATCH /api/ingredientes/[id] - Atualizar ingrediente
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const auth = await requireRole(request, ['GERENTE', 'ADMIN']);
    if (auth.ok === false) {
      return auth.response;
    }

    const { id } = await params;

    if (!prisma) {
      return NextResponse.json(
        { error: 'Banco de dados não configurado' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const {
      slug,
      nome,
      descricao,
      imagem,
      preco,
      custo,
      estoque,
      estoqueMinimo,
      unidade,
      categoriaId,
      ordem,
      ativo
    } = body;

    // Verifica se ingrediente existe
    const existente = await prisma.ingrediente.findUnique({
      where: { id }
    });

    if (!existente) {
      return NextResponse.json(
        { error: 'Ingrediente não encontrado' },
        { status: 404 }
      );
    }

    // Se está alterando o slug, verifica se já existe
    if (slug && slug !== existente.slug) {
      const conflito = await prisma.ingrediente.findUnique({
        where: { slug }
      });
      if (conflito) {
        return NextResponse.json(
          { error: 'Já existe um ingrediente com este slug' },
          { status: 409 }
        );
      }
    }

    // Se está alterando a categoria, verifica se existe
    if (categoriaId && categoriaId !== existente.categoriaId) {
      const categoria = await prisma.categoria.findUnique({
        where: { id: categoriaId }
      });
      if (!categoria) {
        return NextResponse.json(
          { error: 'Categoria não encontrada' },
          { status: 404 }
        );
      }
    }

    const ingrediente = await prisma.ingrediente.update({
      where: { id },
      data: {
        ...(slug !== undefined && { slug }),
        ...(nome !== undefined && { nome }),
        ...(descricao !== undefined && { descricao }),
        ...(imagem !== undefined && { imagem }),
        ...(preco !== undefined && { preco }),
        ...(custo !== undefined && { custo }),
        ...(estoque !== undefined && { estoque }),
        ...(estoqueMinimo !== undefined && { estoqueMinimo }),
        ...(unidade !== undefined && { unidade }),
        ...(categoriaId !== undefined && { categoriaId }),
        ...(ordem !== undefined && { ordem }),
        ...(ativo !== undefined && { ativo })
      },
      include: {
        categoria: {
          select: { id: true, slug: true, nome: true, cor: true }
        }
      }
    });

    return NextResponse.json(ingrediente);
  } catch (error) {
    console.error('Erro ao atualizar ingrediente:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar ingrediente' },
      { status: 500 }
    );
  }
}

// DELETE /api/ingredientes/[id] - Deletar ingrediente (soft delete)
export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const auth = await requireRole(_request, ['GERENTE', 'ADMIN']);
    if (auth.ok === false) {
      return auth.response;
    }

    const { id } = await params;

    if (!prisma) {
      return NextResponse.json(
        { error: 'Banco de dados não configurado' },
        { status: 503 }
      );
    }

    // Verifica se ingrediente existe
    const existente = await prisma.ingrediente.findUnique({
      where: { id }
    });

    if (!existente) {
      return NextResponse.json(
        { error: 'Ingrediente não encontrado' },
        { status: 404 }
      );
    }

    // Soft delete - apenas desativa
    await prisma.ingrediente.update({
      where: { id },
      data: { ativo: false }
    });

    return NextResponse.json({
      message: 'Ingrediente desativado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar ingrediente:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar ingrediente' },
      { status: 500 }
    );
  }
}
