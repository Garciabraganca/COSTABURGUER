import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/admin/zonas-entrega/[id]
export async function GET(request: Request, context: RouteContext) {
  const auth = await requireRole(request, ['ADMIN', 'GERENTE']);
  if (auth.ok === false) return auth.response;

  const { id } = await context.params;

  if (!prisma) {
    return NextResponse.json({ error: 'Banco de dados não configurado' }, { status: 503 });
  }

  try {
    const zona = await prisma.zonaEntrega.findUnique({ where: { id } });

    if (!zona) {
      return NextResponse.json({ error: 'Zona não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, zona });
  } catch (error) {
    console.error('Erro ao buscar zona:', error);
    return NextResponse.json({ error: 'Erro ao buscar zona' }, { status: 500 });
  }
}

// PATCH /api/admin/zonas-entrega/[id]
export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireRole(request, ['ADMIN', 'GERENTE']);
  if (auth.ok === false) return auth.response;

  const { id } = await context.params;

  if (!prisma) {
    return NextResponse.json({ error: 'Banco de dados não configurado' }, { status: 503 });
  }

  try {
    const body = await request.json();

    const zonaExistente = await prisma.zonaEntrega.findUnique({ where: { id } });
    if (!zonaExistente) {
      return NextResponse.json({ error: 'Zona não encontrada' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (body.nome !== undefined) updateData.nome = body.nome;
    if (body.descricao !== undefined) updateData.descricao = body.descricao || null;
    if (body.tipo !== undefined) updateData.tipo = body.tipo;
    if (body.bairros !== undefined) updateData.bairros = body.bairros;
    if (body.distanciaMin !== undefined) updateData.distanciaMin = body.distanciaMin;
    if (body.distanciaMax !== undefined) updateData.distanciaMax = body.distanciaMax;
    if (body.cepInicio !== undefined) updateData.cepInicio = body.cepInicio;
    if (body.cepFim !== undefined) updateData.cepFim = body.cepFim;
    if (body.taxaEntrega !== undefined) updateData.taxaEntrega = body.taxaEntrega;
    if (body.tempoEstimado !== undefined) updateData.tempoEstimado = body.tempoEstimado;
    if (body.ordem !== undefined) updateData.ordem = body.ordem;
    if (body.ativo !== undefined) updateData.ativo = body.ativo;

    const zona = await prisma.zonaEntrega.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ ok: true, zona });
  } catch (error) {
    console.error('Erro ao atualizar zona:', error);
    return NextResponse.json({ error: 'Erro ao atualizar zona' }, { status: 500 });
  }
}

// DELETE /api/admin/zonas-entrega/[id]
export async function DELETE(request: Request, context: RouteContext) {
  const auth = await requireRole(request, ['ADMIN']);
  if (auth.ok === false) return auth.response;

  const { id } = await context.params;

  if (!prisma) {
    return NextResponse.json({ error: 'Banco de dados não configurado' }, { status: 503 });
  }

  try {
    await prisma.zonaEntrega.delete({ where: { id } });
    return NextResponse.json({ ok: true, message: 'Zona removida com sucesso' });
  } catch (error) {
    console.error('Erro ao remover zona:', error);
    return NextResponse.json({ error: 'Erro ao remover zona' }, { status: 500 });
  }
}
