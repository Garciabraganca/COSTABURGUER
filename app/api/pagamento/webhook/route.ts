import { NextRequest, NextResponse } from 'next/server';
import { paymentClient, isMercadoPagoEnabled } from '@/lib/mercadopago';
import { prisma } from '@/lib/prisma';

// Mapeia status do MP para status interno
function mapPaymentStatus(mpStatus: string): string {
  switch (mpStatus) {
    case 'approved':
      return 'PAGO';
    case 'pending':
    case 'in_process':
      return 'AGUARDANDO_PAGAMENTO';
    case 'rejected':
      return 'PAGAMENTO_REJEITADO';
    case 'cancelled':
      return 'CANCELADO';
    case 'refunded':
      return 'REEMBOLSADO';
    default:
      return 'AGUARDANDO_PAGAMENTO';
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('[Webhook MP] Recebido:', JSON.stringify(body, null, 2));

    // Mercado Pago envia diferentes tipos de notificação
    const { type, data, action } = body;

    // Verifica se é uma notificação de pagamento
    if (type === 'payment' && data?.id) {
      if (!isMercadoPagoEnabled() || !paymentClient) {
        console.warn('[Webhook MP] Mercado Pago não configurado');
        return NextResponse.json({ received: true });
      }

      // Busca detalhes do pagamento no Mercado Pago
      const payment = await paymentClient.get({ id: data.id });

      if (!payment) {
        console.error('[Webhook MP] Pagamento não encontrado:', data.id);
        return NextResponse.json({ received: true });
      }

      const pedidoId = payment.external_reference;
      const paymentStatus = payment.status || 'pending';
      const statusInterno = mapPaymentStatus(paymentStatus);

      console.log('[Webhook MP] Payment:', {
        paymentId: data.id,
        status: paymentStatus,
        statusInterno,
        pedidoId,
        amount: payment.transaction_amount,
      });

      // Atualiza o pedido no banco
      if (pedidoId && prisma) {
        await prisma.pedido.update({
          where: { id: pedidoId },
          data: {
            statusPagamento: statusInterno,
            mercadoPagoPaymentId: String(data.id),
            // Se aprovado, atualiza status do pedido para CONFIRMADO
            ...(paymentStatus === 'approved' && {
              status: 'CONFIRMADO',
            }),
          },
        });

        console.log('[Webhook MP] Pedido atualizado:', pedidoId);
      }
    }

    // Notificação do tipo merchant_order
    if (type === 'merchant_order' && data?.id) {
      console.log('[Webhook MP] Merchant order:', data.id);
      // Pode ser usado para tracking adicional
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Webhook MP] Erro:', error);
    // Retorna 200 para o MP não reenviar
    return NextResponse.json({ received: true, error: 'internal' });
  }
}

// Mercado Pago também pode enviar via GET para validação
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const topic = searchParams.get('topic');
  const id = searchParams.get('id');

  console.log('[Webhook MP] GET validation:', { topic, id });

  return NextResponse.json({ status: 'ok' });
}
