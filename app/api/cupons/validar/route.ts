import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/cupons/validar - Valida um cupom
export async function POST(request: Request) {
  if (!prisma) {
    return NextResponse.json({ error: 'Banco de dados não configurado' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { codigo, valorPedido, celular } = body;

    if (!codigo) {
      return NextResponse.json({
        ok: false,
        valido: false,
        error: 'Código do cupom é obrigatório'
      }, { status: 400 });
    }

    const codigoNormalizado = codigo.toUpperCase().trim();

    // Busca o cupom
    const cupom = await prisma.cupom.findUnique({
      where: { codigo: codigoNormalizado }
    });

    if (!cupom) {
      return NextResponse.json({
        ok: true,
        valido: false,
        error: 'Cupom não encontrado'
      });
    }

    // Verifica se está ativo
    if (!cupom.ativo) {
      return NextResponse.json({
        ok: true,
        valido: false,
        error: 'Este cupom não está mais ativo'
      });
    }

    // Verifica data de início
    const agora = new Date();
    if (cupom.dataInicio > agora) {
      return NextResponse.json({
        ok: true,
        valido: false,
        error: 'Este cupom ainda não está válido'
      });
    }

    // Verifica data de fim
    if (cupom.dataFim && cupom.dataFim < agora) {
      return NextResponse.json({
        ok: true,
        valido: false,
        error: 'Este cupom expirou'
      });
    }

    // Verifica limite de usos
    if (cupom.limiteUsos && cupom.usosAtual >= cupom.limiteUsos) {
      return NextResponse.json({
        ok: true,
        valido: false,
        error: 'Este cupom atingiu o limite de usos'
      });
    }

    // Verifica uso único por cliente
    if (cupom.usoUnico && celular) {
      const usoExistente = await prisma.pedidoCupom.findFirst({
        where: {
          cupomId: cupom.id,
          clienteCelular: celular
        }
      });

      if (usoExistente) {
        return NextResponse.json({
          ok: true,
          valido: false,
          error: 'Você já utilizou este cupom'
        });
      }
    }

    // Verifica valor mínimo
    if (cupom.valorMinimo && valorPedido && valorPedido < cupom.valorMinimo) {
      return NextResponse.json({
        ok: true,
        valido: false,
        error: `Valor mínimo do pedido: R$ ${cupom.valorMinimo.toFixed(2)}`
      });
    }

    // Calcula o desconto
    let valorDescontoCalculado: number;

    if (cupom.tipoDesconto === 'percentual') {
      valorDescontoCalculado = valorPedido
        ? (valorPedido * cupom.valorDesconto) / 100
        : 0;

      // Aplica limite máximo se houver
      if (cupom.valorMaximo && valorDescontoCalculado > cupom.valorMaximo) {
        valorDescontoCalculado = cupom.valorMaximo;
      }
    } else {
      // Desconto fixo
      valorDescontoCalculado = cupom.valorDesconto;

      // Não pode dar desconto maior que o valor do pedido
      if (valorPedido && valorDescontoCalculado > valorPedido) {
        valorDescontoCalculado = valorPedido;
      }
    }

    return NextResponse.json({
      ok: true,
      valido: true,
      cupom: {
        id: cupom.id,
        codigo: cupom.codigo,
        descricao: cupom.descricao,
        tipoDesconto: cupom.tipoDesconto,
        valorDesconto: cupom.valorDesconto,
        valorMinimo: cupom.valorMinimo,
        valorMaximo: cupom.valorMaximo
      },
      valorDescontoCalculado: Math.round(valorDescontoCalculado * 100) / 100,
      valorFinal: valorPedido
        ? Math.round((valorPedido - valorDescontoCalculado) * 100) / 100
        : null
    });
  } catch (error) {
    console.error('Erro ao validar cupom:', error);
    return NextResponse.json({ error: 'Erro ao validar cupom' }, { status: 500 });
  }
}
