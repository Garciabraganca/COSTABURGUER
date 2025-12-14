import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/requireRole';

export const dynamic = 'force-dynamic';

// GET /api/ingredientes - Listar todos os ingredientes
export async function GET(request: Request) {
  try {
    const auth = await requireRole(request, ['GERENTE', 'ADM']);
    if (auth.ok === false) {
      return auth.response;
    }

    if (!prisma) {
      return NextResponse.json(
        { error: 'Banco de dados não configurado' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const categoriaId = searchParams.get('categoriaId');
    const categoriaSlug = searchParams.get('categoria');
    const apenasAtivos = searchParams.get('ativos') !== 'false';
    const estoqueBaixo = searchParams.get('estoqueBaixo') === 'true';

    const where: Record<string, unknown> = {};

    if (apenasAtivos) {
      where.ativo = true;
    }

    if (categoriaId) {
      where.categoriaId = categoriaId;
    }

    if (categoriaSlug) {
      where.categoria = { slug: categoriaSlug };
    }

    // Filtro para estoque baixo
    if (estoqueBaixo) {
      // Busca ingredientes onde estoque < estoqueMinimo
      const ingredientes = await prisma.ingrediente.findMany({
        where,
        orderBy: [{ categoria: { ordem: 'asc' } }, { ordem: 'asc' }],
        include: {
          categoria: {
            select: { id: true, slug: true, nome: true, cor: true }
          }
        }
      });

      const comEstoqueBaixo = ingredientes.filter(
        ing => ing.estoque < ing.estoqueMinimo
      );

      return NextResponse.json(comEstoqueBaixo);
    }

    const ingredientes = await prisma.ingrediente.findMany({
      where,
      orderBy: [{ categoria: { ordem: 'asc' } }, { ordem: 'asc' }],
      include: {
        categoria: {
          select: { id: true, slug: true, nome: true, cor: true }
        }
      }
    });

    return NextResponse.json(ingredientes);
  } catch (error) {
    console.error('Erro ao buscar ingredientes:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar ingredientes' },
      { status: 500 }
    );
  }
}

// POST /api/ingredientes - Criar novo ingrediente
export async function POST(request: Request) {
  try {
    const auth = await requireRole(request, ['GERENTE', 'ADM']);
    if (auth.ok === false) {
      return auth.response;
    }

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
      ordem
    } = body;

    // Validação
    if (!slug || !nome || preco === undefined || !categoriaId) {
      return NextResponse.json(
        { error: 'Slug, nome, preço e categoriaId são obrigatórios' },
        { status: 400 }
      );
    }

    // Verifica se já existe ingrediente com o mesmo slug
    const existente = await prisma.ingrediente.findUnique({
      where: { slug }
    });

    if (existente) {
      return NextResponse.json(
        { error: 'Já existe um ingrediente com este slug' },
        { status: 409 }
      );
    }

    // Verifica se a categoria existe
    const categoria = await prisma.categoria.findUnique({
      where: { id: categoriaId }
    });

    if (!categoria) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      );
    }

    const ingrediente = await prisma.ingrediente.create({
      data: {
        slug,
        nome,
        descricao: descricao || null,
        imagem: imagem || null,
        preco,
        custo: custo || 0,
        estoque: estoque || 0,
        estoqueMinimo: estoqueMinimo || 5,
        unidade: unidade || 'un',
        categoriaId,
        ordem: ordem || 0,
        ativo: true
      },
      include: {
        categoria: {
          select: { id: true, slug: true, nome: true, cor: true }
        }
      }
    });

    return NextResponse.json(ingrediente, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar ingrediente:', error);
    return NextResponse.json(
      { error: 'Erro ao criar ingrediente' },
      { status: 500 }
    );
  }
}
