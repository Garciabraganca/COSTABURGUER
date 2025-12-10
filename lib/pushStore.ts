// Store em memória para subscriptions (substituir por banco de dados em produção)
// Em produção, use Redis, PostgreSQL ou outro banco de dados persistente

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  createdAt: Date;
  userId?: string;
  pedidoId?: string;
}

// Store em memória (não persiste entre restarts)
const subscriptions: Map<string, PushSubscription> = new Map();

// Subscriptions por pedido (para notificações específicas)
const pedidoSubscriptions: Map<string, Set<string>> = new Map();

export const pushStore = {
  // Adiciona uma subscription
  addSubscription(data: Omit<PushSubscription, 'createdAt'>): PushSubscription {
    const subscription: PushSubscription = {
      ...data,
      createdAt: new Date(),
    };
    subscriptions.set(data.endpoint, subscription);
    console.log(`[PushStore] Subscription added: ${data.endpoint.slice(-20)}...`);
    return subscription;
  },

  // Remove uma subscription
  removeSubscription(endpoint: string): boolean {
    const deleted = subscriptions.delete(endpoint);

    // Remove de todas as associações de pedido
    pedidoSubscriptions.forEach((endpoints) => {
      endpoints.delete(endpoint);
    });

    console.log(`[PushStore] Subscription removed: ${endpoint.slice(-20)}...`);
    return deleted;
  },

  // Busca uma subscription
  getSubscription(endpoint: string): PushSubscription | undefined {
    return subscriptions.get(endpoint);
  },

  // Lista todas subscriptions
  getAllSubscriptions(): PushSubscription[] {
    return Array.from(subscriptions.values());
  },

  // Associa subscription a um pedido
  linkToPedido(endpoint: string, pedidoId: string): void {
    const subscription = subscriptions.get(endpoint);
    if (subscription) {
      subscription.pedidoId = pedidoId;

      if (!pedidoSubscriptions.has(pedidoId)) {
        pedidoSubscriptions.set(pedidoId, new Set());
      }
      pedidoSubscriptions.get(pedidoId)!.add(endpoint);

      console.log(`[PushStore] Subscription linked to pedido ${pedidoId}`);
    }
  },

  // Busca subscriptions de um pedido
  getSubscriptionsByPedido(pedidoId: string): PushSubscription[] {
    const endpoints = pedidoSubscriptions.get(pedidoId);
    if (!endpoints) return [];

    return Array.from(endpoints)
      .map((endpoint) => subscriptions.get(endpoint))
      .filter((sub): sub is PushSubscription => sub !== undefined);
  },

  // Conta subscriptions
  count(): number {
    return subscriptions.size;
  },

  // Limpa subscriptions antigas (mais de 30 dias)
  cleanup(): number {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    let removed = 0;

    subscriptions.forEach((sub, endpoint) => {
      if (sub.createdAt < thirtyDaysAgo) {
        this.removeSubscription(endpoint);
        removed++;
      }
    });

    console.log(`[PushStore] Cleanup: ${removed} old subscriptions removed`);
    return removed;
  },
};

export default pushStore;
