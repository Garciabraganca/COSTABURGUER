import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/admin/cupons/[id] - Busca um cupom específico
export async function GET(request: Request, context: RouteContext) {
  const auth = await requireRole(request, ['ADMIN', 'GERENTE']);
  if (auth.ok === false) return auth.response;

  const { id } = await context.params;

  if (!prisma) {
    return NextResponse.json({ error: 'Banco de dados não configurado' }, { status: 503 });
  }

  try {
    const cupom = await prisma.cupom.findUnique({
      where: { id },
      include: {
        pedidos: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          select: {
            id: true,
            pedidoId: true,
            codigoUsado: true,
            valorDesconto: true,
            clienteCelular: true,
            createdAt: true
          }
        },
        _count: {
          select: { pedidos: true }
        }
      }
    });

    if (!cupom) {
      return NextResponse.json({ error: 'Cupom não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, cupom });
  } catch (error) {
    console.error('Erro ao buscar cupom:', error);
    return NextResponse.json({ error: 'Erro ao buscar cupom' }, { status: 500 });
  }
}

// PATCH /api/admin/cupons/[id] - Atualiza um cupom
export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireRole(request, ['ADMIN', 'GERENTE']);
  if (auth.ok === false) return auth.response;

  const { id } = await context.params;

  if (!prisma) {
    return NextResponse.json({ error: 'Banco de dados não configurado' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const {
      codigo,
      descricao,
      tipoDesconto,
      valorDesconto,
      valorMinimo,
      valorMaximo,
      dataInicio,
      dataFim,
      limiteUsos,
      usoUnico,
      ativo
    } = body;

    // Verifica se cupom existe
    const cupomExistente = await prisma.cupom.findUnique({ where: { id } });
    if (!cupomExistente) {
      return NextResponse.json({ error: 'Cupom não encontrado' }, { status: 404 });
    }

    // Se está alterando o código, verifica duplicidade
    if (codigo && codigo.toUpperCase().trim() !== cupomExistente.codigo) {
      const codigoNormalizado = codigo.toUpperCase().trim();
      const duplicado = await prisma.cupom.findUnique({
        where: { codigo: codigoNormalizado }
      });

      if (duplicado) {
        return NextResponse.json({
          error: 'Já existe outro cupom com este código'
        }, { status: 400 });
      }
    }

    // Validações
    if (tipoDesconto && !['percentual', 'fixo'].includes(tipoDesconto)) {
      return NextResponse.json({
        error: 'tipoDesconto deve ser "percentual" ou "fixo"'
      }, { status: 400 });
    }

    if (valorDesconto !== undefined && valorDesconto <= 0) {
      return NextResponse.json({
        error: 'valorDesconto deve ser maior que zero'
      }, { status: 400 });
    }

    const tipo = tipoDesconto || cupomExistente.tipoDesconto;
    const valor = valorDesconto ?? cupomExistente.valorDesconto;

    if (tipo === 'percentual' && valor > 100) {
      return NextResponse.json({
        error: 'Desconto percentual não pode ser maior que 100%'
      }, { status: 400 });
    }

    // Monta objeto de atualização
    const updateData: Record<string, unknown> = {};

    if (codigo !== undefined) updateData.codigo = codigo.toUpperCase().trim();
    if (descricao !== undefined) updateData.descricao = descricao || null;
    if (tipoDesconto !== undefined) updateData.tipoDesconto = tipoDesconto;
    if (valorDesconto !== undefined) updateData.valorDesconto = valorDesconto;
    if (valorMinimo !== undefined) updateData.valorMinimo = valorMinimo || null;
    if (valorMaximo !== undefined) updateData.valorMaximo = valorMaximo || null;
    if (dataInicio !== undefined) updateData.dataInicio = new Date(dataInicio);
    if (dataFim !== undefined) updateData.dataFim = dataFim ? new Date(dataFim) : null;
    if (limiteUsos !== undefined) updateData.limiteUsos = limiteUsos || null;
    if (usoUnico !== undefined) updateData.usoUnico = usoUnico;
    if (ativo !== undefined) updateData.ativo = ativo;

    const cupom = await prisma.cupom.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ ok: true, cupom });
  } catch (error) {
    console.error('Erro ao atualizar cupom:', error);
    return NextResponse.json({ error: 'Erro ao atualizar cupom' }, { status: 500 });
  }
}

// DELETE /api/admin/cupons/[id] - Remove um cupom
export async function DELETE(request: Request, context: RouteContext) {
  const auth = await requireRole(request, ['ADMIN']);
  if (auth.ok === false) return auth.response;

  const { id } = await context.params;

  if (!prisma) {
    return NextResponse.json({ error: 'Banco de dados não configurado' }, { status: 503 });
  }

  try {
    // Verifica se cupom existe
    const cupom = await prisma.cupom.findUnique({
      where: { id },
      include: { _count: { select: { pedidos: true } } }
    });

    if (!cupom) {
      return NextResponse.json({ error: 'Cupom não encontrado' }, { status: 404 });
    }

    // Se já foi usado, apenas desativa ao invés de deletar
    if (cupom._count.pedidos > 0) {
      await prisma.cupom.update({
        where: { id },
        data: { ativo: false }
      });

      return NextResponse.json({
        ok: true,
        message: 'Cupom desativado (já foi utilizado em pedidos)'
      });
    }

    // Se nunca foi usado, pode deletar
    await prisma.cupom.delete({ where: { id } });

    return NextResponse.json({ ok: true, message: 'Cupom removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover cupom:', error);
    return NextResponse.json({ error: 'Erro ao remover cupom' }, { status: 500 });
  }
}
