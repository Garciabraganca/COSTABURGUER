// Configuração do Web Push
// Para gerar novas chaves VAPID, execute: npx web-push generate-vapid-keys
import webpush from 'web-push';

// IMPORTANTE: Em produção, armazene essas chaves em variáveis de ambiente
export const VAPID_KEYS = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
    'BJrcdSSyFlgTjLjlYWH60c2Fm_GY986uc2VNlEVjYA_67uMCpMhVism89AQUMydKJsbnV3zphf-5W1RwgxT84nw',
  privateKey: process.env.VAPID_PRIVATE_KEY ||
    'XihUxbBWlJhgaj-zs1Ul0lPnbvZejaIhgnIj9XhvmgU',
  subject: process.env.VAPID_SUBJECT || 'mailto:contato@costaburguer.com.br',
};

// Flag para garantir que VAPID seja configurado apenas uma vez
let vapidConfigured = false;

// Configura VAPID de forma lazy (apenas quando necessário)
function ensureVapidConfigured() {
  if (vapidConfigured) return;

  try {
    webpush.setVapidDetails(
      VAPID_KEYS.subject,
      VAPID_KEYS.publicKey,
      VAPID_KEYS.privateKey
    );
    vapidConfigured = true;
  } catch (error) {
    console.error('[WebPush] Erro ao configurar VAPID:', error);
    throw error;
  }
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  url?: string;
  pedidoId?: string;
  requireInteraction?: boolean;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  data?: Record<string, unknown>;
}

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// Função para enviar push notification
export async function sendPushNotification(
  subscription: PushSubscriptionData,
  payload: PushPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    // Garante que VAPID está configurado antes de enviar
    ensureVapidConfigured();

    console.log('[WebPush] Enviando notificação:');
    console.log('  To:', subscription.endpoint.slice(-30));
    console.log('  Title:', payload.title);

    await webpush.sendNotification(
      { endpoint: subscription.endpoint, keys: subscription.keys },
      JSON.stringify(payload),
      { TTL: 86400, urgency: 'high' }
    );

    console.log('[WebPush] Notificação enviada com sucesso!');
    return { success: true };
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    console.error('[WebPush] Erro ao enviar notificação:', err);

    // Se a subscription expirou ou é inválida
    if (err.statusCode === 410 || err.statusCode === 404) {
      return { success: false, error: 'subscription_expired' };
    }

    return { success: false, error: err.message || 'unknown_error' };
  }
}

// Envia para múltiplas subscriptions
export async function sendPushToMany(
  subscriptions: PushSubscriptionData[],
  payload: PushPayload
): Promise<{
  sent: number;
  failed: number;
  expired: string[];
}> {
  const results = await Promise.all(
    subscriptions.map((sub) => sendPushNotification(sub, payload))
  );

  const expired: string[] = [];
  let sent = 0;
  let failed = 0;

  results.forEach((result, index) => {
    if (result.success) {
      sent++;
    } else {
      failed++;
      if (result.error === 'subscription_expired') {
        expired.push(subscriptions[index].endpoint);
      }
    }
  });

  return { sent, failed, expired };
}

// Templates de notificação para diferentes eventos
export const notificationTemplates = {
  pedidoConfirmado: (pedidoId: string): PushPayload => ({
    title: '✅ Pedido Confirmado!',
    body: `Seu pedido #${pedidoId} foi confirmado e logo começará a ser preparado.`,
    icon: '/logo-kraft.svg',
    tag: `pedido-${pedidoId}-confirmado`,
    pedidoId,
    url: `/pedido/${pedidoId}`,
    actions: [
      { action: 'ver-pedido', title: 'Ver pedido' },
      { action: 'acompanhar', title: 'Acompanhar' },
    ],
    data: { pedidoId, status: 'CONFIRMADO' },
  }),

  pedidoPreparando: (pedidoId: string): PushPayload => ({
    title: '👨‍🍳 Preparando seu pedido!',
    body: `O chef começou a preparar seu pedido #${pedidoId}. Em breve estará pronto!`,
    icon: '/logo-kraft.svg',
    tag: `pedido-${pedidoId}-preparando`,
    pedidoId,
    url: `/acompanhar?pedido=${pedidoId}`,
    actions: [
      { action: 'acompanhar', title: 'Ver preparo' },
    ],
    data: { pedidoId, status: 'PREPARANDO' },
  }),

  pedidoEmEntrega: (pedidoId: string): PushPayload => ({
    title: '🛵 Pedido saiu para entrega!',
    body: `Seu pedido #${pedidoId} está a caminho! Tempo estimado: 15-25 min.`,
    icon: '/logo-kraft.svg',
    tag: `pedido-${pedidoId}-entrega`,
    pedidoId,
    url: `/pedido/${pedidoId}`,
    requireInteraction: true,
    actions: [
      { action: 'ver-pedido', title: 'Rastrear' },
    ],
    data: { pedidoId, status: 'EM_ENTREGA' },
  }),

  pedidoEntregue: (pedidoId: string): PushPayload => ({
    title: '🎉 Pedido entregue!',
    body: `Seu pedido #${pedidoId} foi entregue. Bom apetite!`,
    icon: '/logo-kraft.svg',
    tag: `pedido-${pedidoId}-entregue`,
    pedidoId,
    url: `/pedido/${pedidoId}`,
    data: { pedidoId, status: 'ENTREGUE' },
  }),

  pedidoCancelado: (pedidoId: string): PushPayload => ({
    title: '❌ Pedido cancelado',
    body: `Seu pedido #${pedidoId} foi cancelado.`,
    icon: '/logo-kraft.svg',
    tag: `pedido-${pedidoId}-cancelado`,
    pedidoId,
    url: `/pedido/${pedidoId}`,
    data: { pedidoId, status: 'CANCELADO' },
  }),

  entregadorChegando: (pedidoId: string, minutos: number = 5): PushPayload => ({
    title: '📍 Entregador chegando!',
    body: `O entregador está a ${minutos} minutos de você. Prepare-se para receber!`,
    icon: '/logo-kraft.svg',
    tag: `pedido-${pedidoId}-chegando`,
    pedidoId,
    url: `/pedido/${pedidoId}`,
    requireInteraction: true,
    data: { pedidoId, status: 'CHEGANDO', minutos },
  }),

  promocao: (titulo: string, mensagem: string, url: string = '/'): PushPayload => ({
    title: `🍔 ${titulo}`,
    body: mensagem,
    icon: '/logo-kraft.svg',
    tag: 'promocao',
    url,
    data: { type: 'promocao' },
  }),
};

const webPushApi = {
  sendPushNotification,
  sendPushToMany,
  notificationTemplates,
  VAPID_KEYS,
};

export default webPushApi;
