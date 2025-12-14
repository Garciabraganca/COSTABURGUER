import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/requireRole';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/acompanhamentos/[id] - Buscar acompanhamento por ID
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

    const acompanhamento = await prisma.acompanhamento.findUnique({
      where: { id }
    });

    if (!acompanhamento) {
      return NextResponse.json(
        { error: 'Acompanhamento não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(acompanhamento);
  } catch (error) {
    console.error('Erro ao buscar acompanhamento:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar acompanhamento' },
      { status: 500 }
    );
  }
}

// PATCH /api/acompanhamentos/[id] - Atualizar acompanhamento
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
      ordem,
      ativo
    } = body;

    // Verifica se acompanhamento existe
    const existente = await prisma.acompanhamento.findUnique({
      where: { id }
    });

    if (!existente) {
      return NextResponse.json(
        { error: 'Acompanhamento não encontrado' },
        { status: 404 }
      );
    }

    // Se está alterando o slug, verifica se já existe
    if (slug && slug !== existente.slug) {
      const conflito = await prisma.acompanhamento.findUnique({
        where: { slug }
      });
      if (conflito) {
        return NextResponse.json(
          { error: 'Já existe um acompanhamento com este slug' },
          { status: 409 }
        );
      }
    }

    const acompanhamento = await prisma.acompanhamento.update({
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
        ...(ordem !== undefined && { ordem }),
        ...(ativo !== undefined && { ativo })
      }
    });

    return NextResponse.json(acompanhamento);
  } catch (error) {
    console.error('Erro ao atualizar acompanhamento:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar acompanhamento' },
      { status: 500 }
    );
  }
}

// DELETE /api/acompanhamentos/[id] - Deletar acompanhamento (soft delete)
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

    // Verifica se acompanhamento existe
    const existente = await prisma.acompanhamento.findUnique({
      where: { id }
    });

    if (!existente) {
      return NextResponse.json(
        { error: 'Acompanhamento não encontrado' },
        { status: 404 }
      );
    }

    // Soft delete - apenas desativa
    await prisma.acompanhamento.update({
      where: { id },
      data: { ativo: false }
    });

    return NextResponse.json({
      message: 'Acompanhamento desativado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar acompanhamento:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar acompanhamento' },
      { status: 500 }
    );
  }
}
