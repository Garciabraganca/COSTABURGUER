// Funções auxiliares para enviar notificações de pedido
import pushStore from './pushStore';
import { sendPushToMany, notificationTemplates, PushPayload } from './webPush';

export type PedidoStatus = 'CONFIRMADO' | 'PREPARANDO' | 'EM_ENTREGA' | 'ENTREGUE' | 'CANCELADO';

// Notifica sobre mudança de status do pedido
export async function notifyPedidoStatus(
  pedidoId: string,
  status: PedidoStatus
): Promise<{ sent: number; failed: number }> {
  let payload: PushPayload;

  switch (status) {
    case 'CONFIRMADO':
      payload = notificationTemplates.pedidoConfirmado(pedidoId);
      break;
    case 'PREPARANDO':
      payload = notificationTemplates.pedidoPreparando(pedidoId);
      break;
    case 'EM_ENTREGA':
      payload = notificationTemplates.pedidoEmEntrega(pedidoId);
      break;
    case 'ENTREGUE':
      payload = notificationTemplates.pedidoEntregue(pedidoId);
      break;
    case 'CANCELADO':
      payload = notificationTemplates.pedidoCancelado(pedidoId);
      break;
    default:
      console.warn(`[NotifyPedido] Status desconhecido: ${status}`);
      return { sent: 0, failed: 0 };
  }

  // Busca subscriptions vinculadas ao pedido
  let subscriptions = pushStore.getSubscriptionsByPedido(pedidoId);

  // Fallback: se não tem subscriptions vinculadas, tenta todas
  if (subscriptions.length === 0) {
    subscriptions = pushStore.getAllSubscriptions();
  }

  if (subscriptions.length === 0) {
    console.log(`[NotifyPedido] Nenhuma subscription para notificar pedido ${pedidoId}`);
    return { sent: 0, failed: 0 };
  }

  const result = await sendPushToMany(subscriptions, payload);

  // Remove subscriptions expiradas
  result.expired.forEach((endpoint) => {
    pushStore.removeSubscription(endpoint);
  });

  console.log(`[NotifyPedido] Pedido ${pedidoId} -> ${status}: ${result.sent} notificações enviadas`);

  return result;
}

// Notifica que o entregador está chegando
export async function notifyEntregadorChegando(
  pedidoId: string,
  minutosEstimados: number = 5
): Promise<{ sent: number; failed: number }> {
  const payload = notificationTemplates.entregadorChegando(pedidoId, minutosEstimados);

  let subscriptions = pushStore.getSubscriptionsByPedido(pedidoId);
  if (subscriptions.length === 0) {
    subscriptions = pushStore.getAllSubscriptions();
  }

  if (subscriptions.length === 0) {
    return { sent: 0, failed: 0 };
  }

  const result = await sendPushToMany(subscriptions, payload);

  result.expired.forEach((endpoint) => {
    pushStore.removeSubscription(endpoint);
  });

  return result;
}

// Envia notificação personalizada para um pedido
export async function notifyPedidoCustom(
  pedidoId: string,
  title: string,
  body: string,
  options: Partial<PushPayload> = {}
): Promise<{ sent: number; failed: number }> {
  const payload: PushPayload = {
    title,
    body,
    icon: '/logo-kraft.svg',
    tag: `pedido-${pedidoId}-custom`,
    pedidoId,
    url: `/pedido/${pedidoId}`,
    ...options,
    data: { pedidoId, ...options.data },
  };

  let subscriptions = pushStore.getSubscriptionsByPedido(pedidoId);
  if (subscriptions.length === 0) {
    subscriptions = pushStore.getAllSubscriptions();
  }

  if (subscriptions.length === 0) {
    return { sent: 0, failed: 0 };
  }

  const result = await sendPushToMany(subscriptions, payload);

  result.expired.forEach((endpoint) => {
    pushStore.removeSubscription(endpoint);
  });

  return result;
}

// Vincula a subscription atual ao pedido (chamar após checkout)
export async function linkSubscriptionToPedido(
  subscriptionEndpoint: string,
  pedidoId: string
): Promise<void> {
  pushStore.linkToPedido(subscriptionEndpoint, pedidoId);
}

// Broadcast para todos os usuários (promoções, etc)
export async function notifyAllUsers(
  title: string,
  body: string,
  url: string = '/'
): Promise<{ sent: number; failed: number }> {
  const payload = notificationTemplates.promocao(title, body, url);
  const subscriptions = pushStore.getAllSubscriptions();

  if (subscriptions.length === 0) {
    return { sent: 0, failed: 0 };
  }

  const result = await sendPushToMany(subscriptions, payload);

  result.expired.forEach((endpoint) => {
    pushStore.removeSubscription(endpoint);
  });

  return result;
}

export default {
  notifyPedidoStatus,
  notifyEntregadorChegando,
  notifyPedidoCustom,
  linkSubscriptionToPedido,
  notifyAllUsers,
};
