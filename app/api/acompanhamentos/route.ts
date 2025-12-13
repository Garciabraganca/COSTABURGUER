import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/acompanhamentos - Listar todos os acompanhamentos
export async function GET(request: Request) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: 'Banco de dados não configurado' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const apenasAtivos = searchParams.get('ativos') !== 'false';
    const estoqueBaixo = searchParams.get('estoqueBaixo') === 'true';

    const where: Record<string, unknown> = {};

    if (apenasAtivos) {
      where.ativo = true;
    }

    const acompanhamentos = await prisma.acompanhamento.findMany({
      where,
      orderBy: { ordem: 'asc' }
    });

    // Filtro para estoque baixo
    if (estoqueBaixo) {
      const comEstoqueBaixo = acompanhamentos.filter(
        ac => ac.estoque < ac.estoqueMinimo
      );
      return NextResponse.json(comEstoqueBaixo);
    }

    return NextResponse.json(acompanhamentos);
  } catch (error) {
    console.error('Erro ao buscar acompanhamentos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar acompanhamentos' },
      { status: 500 }
    );
  }
}

// POST /api/acompanhamentos - Criar novo acompanhamento
export async function POST(request: Request) {
  try {
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
      ordem
    } = body;

    // Validação
    if (!slug || !nome || preco === undefined) {
      return NextResponse.json(
        { error: 'Slug, nome e preço são obrigatórios' },
        { status: 400 }
      );
    }

    // Verifica se já existe acompanhamento com o mesmo slug
    const existente = await prisma.acompanhamento.findUnique({
      where: { slug }
    });

    if (existente) {
      return NextResponse.json(
        { error: 'Já existe um acompanhamento com este slug' },
        { status: 409 }
      );
    }

    const acompanhamento = await prisma.acompanhamento.create({
      data: {
        slug,
        nome,
        descricao: descricao || null,
        imagem: imagem || null,
        preco,
        custo: custo || 0,
        estoque: estoque || 0,
        estoqueMinimo: estoqueMinimo || 10,
        unidade: unidade || 'un',
        ordem: ordem || 0,
        ativo: true
      }
    });

    return NextResponse.json(acompanhamento, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar acompanhamento:', error);
    return NextResponse.json(
      { error: 'Erro ao criar acompanhamento' },
      { status: 500 }
    );
  }
}
