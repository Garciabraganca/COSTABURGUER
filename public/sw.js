// Costa-Burger Service Worker para Push Notifications
const CACHE_NAME = 'costa-burger-v1';

// Assets para cache offline
const STATIC_ASSETS = [
  '/',
  '/montar',
  '/sacola',
  '/logo-kraft.svg',
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Intercepta requisições (estratégia network-first)
self.addEventListener('fetch', (event) => {
  // Ignora requisições de API
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clona a resposta para o cache
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Fallback para cache se offline
        return caches.match(event.request);
      })
  );
});

// ========================================
// PUSH NOTIFICATIONS
// ========================================

// Recebe push notification
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');

  let data = {
    title: 'Costa-Burger',
    body: 'Você tem uma atualização!',
    icon: '/logo-kraft.svg',
    badge: '/logo-kraft.svg',
    tag: 'costa-burger-notification',
    data: {},
  };

  // Tenta parsear os dados do push
  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/logo-kraft.svg',
    badge: data.badge || '/logo-kraft.svg',
    tag: data.tag || 'costa-burger-notification',
    vibrate: [200, 100, 200],
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [],
    data: data.data || {},
    // Personalização visual
    image: data.image,
    silent: false,
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Clique na notificação
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.tag);

  event.notification.close();

  const data = event.notification.data || {};
  let targetUrl = '/';

  // Define URL baseado no tipo de notificação
  if (data.pedidoId) {
    targetUrl = `/pedido/${data.pedidoId}`;
  } else if (data.url) {
    targetUrl = data.url;
  }

  // Ações específicas
  if (event.action === 'ver-pedido' && data.pedidoId) {
    targetUrl = `/pedido/${data.pedidoId}`;
  } else if (event.action === 'acompanhar' && data.pedidoId) {
    targetUrl = `/acompanhar?pedido=${data.pedidoId}`;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Se já tem uma janela aberta, foca nela
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        // Se não, abre uma nova
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

// Fechamento da notificação
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event.notification.tag);
});

// Subscription change (quando a subscription expira ou é invalidada)
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('[SW] Push subscription changed');

  event.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: self.VAPID_PUBLIC_KEY,
    })
      .then((subscription) => {
        // Envia nova subscription para o servidor
        return fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription),
        });
      })
  );
});

// Mensagens do cliente
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'SET_VAPID_KEY') {
    self.VAPID_PUBLIC_KEY = event.data.key;
  }
});
