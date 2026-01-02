import { NextRequest, NextResponse } from 'next/server';
import { preferenceClient, isMercadoPagoEnabled } from '@/lib/mercadopago';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    if (!isMercadoPagoEnabled() || !preferenceClient) {
      return NextResponse.json(
        { error: 'Mercado Pago não está configurado' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { pedidoId } = body;

    if (!pedidoId) {
      return NextResponse.json(
        { error: 'pedidoId é obrigatório' },
        { status: 400 }
      );
    }

    // Busca o pedido no banco
    const pedido = await prisma?.pedido.findUnique({
      where: { id: pedidoId },
      include: {
        burgers: {
          include: {
            ingredientes: {
              include: {
                ingrediente: true,
              },
            },
          },
        },
        acompanhamentos: {
          include: {
            acompanhamento: true,
          },
        },
      },
    });

    if (!pedido) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      );
    }

    // Monta os itens para o Mercado Pago
    const items: Array<{
      id: string;
      title: string;
      quantity: number;
      unit_price: number;
      currency_id: string;
    }> = [];

    // Adiciona burgers
    for (const burger of pedido.burgers) {
      items.push({
        id: burger.id,
        title: burger.nome || 'Burger Personalizado',
        quantity: burger.quantidade,
        unit_price: burger.preco,
        currency_id: 'BRL',
      });
    }

    // Adiciona acompanhamentos
    for (const acomp of pedido.acompanhamentos) {
      items.push({
        id: acomp.id,
        title: acomp.acompanhamento.nome,
        quantity: acomp.quantidade,
        unit_price: acomp.precoUnitario,
        currency_id: 'BRL',
      });
    }

    // Adiciona taxa de entrega se houver
    if (pedido.taxaEntrega > 0) {
      items.push({
        id: 'taxa-entrega',
        title: 'Taxa de Entrega',
        quantity: 1,
        unit_price: pedido.taxaEntrega,
        currency_id: 'BRL',
      });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Cria a preferência de pagamento
    const preference = await preferenceClient.create({
      body: {
        items,
        payer: {
          name: pedido.nome,
          phone: {
            number: pedido.celular,
          },
        },
        external_reference: pedidoId,
        back_urls: {
          success: `${appUrl}/pedido/${pedidoId}?status=approved`,
          failure: `${appUrl}/pagamento?pedido=${pedidoId}&status=failure`,
          pending: `${appUrl}/pedido/${pedidoId}?status=pending`,
        },
        auto_return: 'approved',
        notification_url: `${appUrl}/api/pagamento/webhook`,
        statement_descriptor: 'COSTA BURGER',
        metadata: {
          pedido_id: pedidoId,
          numero_pedido: pedido.numero,
        },
      },
    });

    return NextResponse.json({
      preferenceId: preference.id,
      initPoint: preference.init_point,
      sandboxInitPoint: preference.sandbox_init_point,
    });
  } catch (error) {
    console.error('Erro ao criar preferência:', error);

    // Extract more detailed error info from Mercado Pago errors
    let errorMessage = 'Erro ao criar preferência de pagamento';
    let statusCode = 500;

    if (error && typeof error === 'object') {
      const mpError = error as { cause?: Array<{ code?: string; description?: string }>; message?: string; status?: number };

      if (mpError.cause && Array.isArray(mpError.cause) && mpError.cause.length > 0) {
        const cause = mpError.cause[0];
        if (cause.code === 'unauthorized' || cause.description?.includes('invalid access token')) {
          errorMessage = 'Token de acesso do Mercado Pago inválido. Verifique as credenciais.';
          statusCode = 401;
        } else {
          errorMessage = cause.description || mpError.message || errorMessage;
        }
      } else if (mpError.message) {
        if (mpError.message.includes('invalid access token') || mpError.message.includes('unauthorized')) {
          errorMessage = 'Token de acesso do Mercado Pago inválido. Verifique as credenciais.';
          statusCode = 401;
        } else {
          errorMessage = mpError.message;
        }
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}
