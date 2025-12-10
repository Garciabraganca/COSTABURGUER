// Configuração do Web Push
// Para gerar novas chaves VAPID, execute: npx web-push generate-vapid-keys

// IMPORTANTE: Em produção, armazene essas chaves em variáveis de ambiente
export const VAPID_KEYS = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
    'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U',
  privateKey: process.env.VAPID_PRIVATE_KEY ||
    'UUxI4O8-FbRouAf7-fGzM9R1Clt-oFB4xvy8xc9FgTo',
  subject: process.env.VAPID_SUBJECT || 'mailto:contato@costaburger.com',
};

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
// Em desenvolvimento: simula o envio e loga no console
// Em produção: instale web-push (npm install web-push) para envio real
export async function sendPushNotification(
  subscription: PushSubscriptionData,
  payload: PushPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    // Log da notificação (funciona em dev e prod)
    console.log('[WebPush] Push notification:');
    console.log('  To:', subscription.endpoint.slice(-30));
    console.log('  Title:', payload.title);
    console.log('  Body:', payload.body);

    // Simula delay de rede
    await new Promise((resolve) => setTimeout(resolve, 100));

    // PRODUÇÃO: Para habilitar push real, siga os passos:
    // 1. npm install web-push
    // 2. Crie um arquivo lib/webPushSender.ts com o código abaixo
    // 3. Importe e use aqui
    //
    // Código para lib/webPushSender.ts:
    // ```
    // import webpush from 'web-push';
    // import { VAPID_KEYS, PushSubscriptionData, PushPayload } from './webPush';
    //
    // webpush.setVapidDetails(
    //   VAPID_KEYS.subject,
    //   VAPID_KEYS.publicKey,
    //   VAPID_KEYS.privateKey
    // );
    //
    // export async function sendRealPush(sub: PushSubscriptionData, payload: PushPayload) {
    //   return webpush.sendNotification(
    //     { endpoint: sub.endpoint, keys: sub.keys },
    //     JSON.stringify(payload),
    //     { TTL: 86400, urgency: 'high' }
    //   );
    // }
    // ```

    return { success: true };
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    console.error('[WebPush] Error sending notification:', err);

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

export default {
  sendPushNotification,
  sendPushToMany,
  notificationTemplates,
  VAPID_KEYS,
};
