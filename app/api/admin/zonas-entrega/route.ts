import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

// GET /api/admin/zonas-entrega - Lista todas as zonas
export async function GET(request: Request) {
  const auth = await requireRole(request, ['ADMIN', 'GERENTE']);
  if (!auth.ok) return auth.response;

  if (!prisma) {
    return NextResponse.json({ error: 'Banco de dados não configurado' }, { status: 503 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const ativo = searchParams.get('ativo');

    const where: { ativo?: boolean } = {};
    if (ativo !== null) {
      where.ativo = ativo === 'true';
    }

    const zonas = await prisma.zonaEntrega.findMany({
      where,
      orderBy: { ordem: 'asc' }
    });

    return NextResponse.json({ ok: true, zonas });
  } catch (error) {
    console.error('Erro ao listar zonas de entrega:', error);
    return NextResponse.json({ error: 'Erro ao listar zonas' }, { status: 500 });
  }
}

// POST /api/admin/zonas-entrega - Cria nova zona
export async function POST(request: Request) {
  const auth = await requireRole(request, ['ADMIN', 'GERENTE']);
  if (!auth.ok) return auth.response;

  if (!prisma) {
    return NextResponse.json({ error: 'Banco de dados não configurado' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const {
      nome,
      descricao,
      tipo,
      bairros,
      distanciaMin,
      distanciaMax,
      cepInicio,
      cepFim,
      taxaEntrega,
      tempoEstimado,
      ordem
    } = body;

    if (!nome) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }

    if (!['bairro', 'distancia', 'cep'].includes(tipo || 'bairro')) {
      return NextResponse.json({ error: 'Tipo deve ser: bairro, distancia ou cep' }, { status: 400 });
    }

    const zona = await prisma.zonaEntrega.create({
      data: {
        nome,
        descricao: descricao || null,
        tipo: tipo || 'bairro',
        bairros: bairros || [],
        distanciaMin: distanciaMin || null,
        distanciaMax: distanciaMax || null,
        cepInicio: cepInicio || null,
        cepFim: cepFim || null,
        taxaEntrega: taxaEntrega || 0,
        tempoEstimado: tempoEstimado || null,
        ordem: ordem || 0,
        ativo: true
      }
    });

    return NextResponse.json({ ok: true, zona }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar zona de entrega:', error);
    return NextResponse.json({ error: 'Erro ao criar zona' }, { status: 500 });
  }
}
