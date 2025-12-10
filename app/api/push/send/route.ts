import { NextRequest, NextResponse } from 'next/server';
import pushStore from '@/lib/pushStore';
import { sendPushToMany, notificationTemplates, PushPayload } from '@/lib/webPush';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      // Para notificação personalizada
      title,
      body: notificationBody,
      icon,
      tag,
      url,
      pedidoId,
      // Para template
      template,
      // Para envio específico
      endpoint, // Se fornecido, envia só para esta subscription
    } = body;

    let payload: PushPayload;

    // Templates de pedido (precisam de pedidoId)
    const pedidoTemplates = ['pedidoConfirmado', 'pedidoPreparando', 'pedidoEmEntrega', 'pedidoEntregue'];

    // Se tem template, usa o template
    if (template && pedidoId && pedidoTemplates.includes(template)) {
      switch (template) {
        case 'pedidoConfirmado':
          payload = notificationTemplates.pedidoConfirmado(pedidoId);
          break;
        case 'pedidoPreparando':
          payload = notificationTemplates.pedidoPreparando(pedidoId);
          break;
        case 'pedidoEmEntrega':
          payload = notificationTemplates.pedidoEmEntrega(pedidoId);
          break;
        case 'pedidoEntregue':
          payload = notificationTemplates.pedidoEntregue(pedidoId);
          break;
        default:
          return NextResponse.json(
            { error: 'Template inválido' },
            { status: 400 }
          );
      }
    } else if (title && notificationBody) {
      // Notificação personalizada
      payload = {
        title,
        body: notificationBody,
        icon: icon || '/logo-kraft.svg',
        tag: tag || 'costa-burger',
        url,
        pedidoId,
        data: { pedidoId },
      };
    } else {
      return NextResponse.json(
        { error: 'Forneça title/body ou template/pedidoId' },
        { status: 400 }
      );
    }

    // Determina para quem enviar
    let subscriptions;

    if (endpoint) {
      // Envia para subscription específica
      const sub = pushStore.getSubscription(endpoint);
      subscriptions = sub ? [sub] : [];
    } else if (pedidoId) {
      // Envia para todas subscriptions do pedido
      subscriptions = pushStore.getSubscriptionsByPedido(pedidoId);

      // Se não tem nenhuma vinculada ao pedido, envia para todas (fallback)
      if (subscriptions.length === 0) {
        subscriptions = pushStore.getAllSubscriptions();
      }
    } else {
      // Broadcast para todas subscriptions
      subscriptions = pushStore.getAllSubscriptions();
    }

    if (subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        sent: 0,
        message: 'Nenhuma subscription encontrada',
      });
    }

    // Envia as notificações
    const result = await sendPushToMany(subscriptions, payload);

    // Remove subscriptions expiradas
    result.expired.forEach((expiredEndpoint) => {
      pushStore.removeSubscription(expiredEndpoint);
    });

    console.log(`[API] Push sent: ${result.sent} success, ${result.failed} failed`);

    return NextResponse.json({
      success: true,
      ...result,
      message: `Notificação enviada para ${result.sent} dispositivo(s)`,
    });
  } catch (error) {
    console.error('[API] Send push error:', error);
    return NextResponse.json(
      { error: 'Erro ao enviar notificação' },
      { status: 500 }
    );
  }
}

// Endpoint para enviar notificação de teste
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const pedidoId = searchParams.get('pedido') || 'TESTE';

  const subscriptions = pushStore.getAllSubscriptions();

  if (subscriptions.length === 0) {
    return NextResponse.json({
      success: false,
      message: 'Nenhuma subscription registrada. Ative as notificações primeiro.',
    });
  }

  const payload = notificationTemplates.pedidoConfirmado(pedidoId);
  const result = await sendPushToMany(subscriptions, payload);

  return NextResponse.json({
    success: true,
    ...result,
    message: `Notificação de teste enviada para ${result.sent} dispositivo(s)`,
  });
}
