import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

// GET /api/admin/cupons - Lista todos os cupons
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

    const cupons = await prisma.cupom.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { pedidos: true }
        }
      }
    });

    // Adiciona informações calculadas
    const cuponsComInfo = cupons.map(cupom => ({
      ...cupom,
      usosRestantes: cupom.limiteUsos ? cupom.limiteUsos - cupom.usosAtual : null,
      valido: verificarValidadeCupom(cupom)
    }));

    return NextResponse.json({
      ok: true,
      cupons: cuponsComInfo,
      total: cupons.length
    });
  } catch (error) {
    console.error('Erro ao listar cupons:', error);
    return NextResponse.json({ error: 'Erro ao listar cupons' }, { status: 500 });
  }
}

// POST /api/admin/cupons - Cria um novo cupom
export async function POST(request: Request) {
  const auth = await requireRole(request, ['ADMIN', 'GERENTE']);
  if (!auth.ok) return auth.response;

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
      usoUnico
    } = body;

    // Validações
    if (!codigo || !tipoDesconto || valorDesconto === undefined) {
      return NextResponse.json({
        error: 'codigo, tipoDesconto e valorDesconto são obrigatórios'
      }, { status: 400 });
    }

    if (!['percentual', 'fixo'].includes(tipoDesconto)) {
      return NextResponse.json({
        error: 'tipoDesconto deve ser "percentual" ou "fixo"'
      }, { status: 400 });
    }

    if (valorDesconto <= 0) {
      return NextResponse.json({
        error: 'valorDesconto deve ser maior que zero'
      }, { status: 400 });
    }

    if (tipoDesconto === 'percentual' && valorDesconto > 100) {
      return NextResponse.json({
        error: 'Desconto percentual não pode ser maior que 100%'
      }, { status: 400 });
    }

    // Verifica se código já existe
    const codigoNormalizado = codigo.toUpperCase().trim();
    const existente = await prisma.cupom.findUnique({
      where: { codigo: codigoNormalizado }
    });

    if (existente) {
      return NextResponse.json({
        error: 'Já existe um cupom com este código'
      }, { status: 400 });
    }

    const cupom = await prisma.cupom.create({
      data: {
        codigo: codigoNormalizado,
        descricao: descricao || null,
        tipoDesconto,
        valorDesconto,
        valorMinimo: valorMinimo || null,
        valorMaximo: valorMaximo || null,
        dataInicio: dataInicio ? new Date(dataInicio) : new Date(),
        dataFim: dataFim ? new Date(dataFim) : null,
        limiteUsos: limiteUsos || null,
        usoUnico: usoUnico || false,
        ativo: true
      }
    });

    return NextResponse.json({ ok: true, cupom }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar cupom:', error);
    return NextResponse.json({ error: 'Erro ao criar cupom' }, { status: 500 });
  }
}

// Função auxiliar para verificar validade
function verificarValidadeCupom(cupom: {
  ativo: boolean;
  dataInicio: Date;
  dataFim: Date | null;
  limiteUsos: number | null;
  usosAtual: number;
}): boolean {
  if (!cupom.ativo) return false;

  const agora = new Date();

  if (cupom.dataInicio > agora) return false;
  if (cupom.dataFim && cupom.dataFim < agora) return false;
  if (cupom.limiteUsos && cupom.usosAtual >= cupom.limiteUsos) return false;

  return true;
}
