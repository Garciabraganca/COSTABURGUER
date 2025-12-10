"use client";

import { useState, useEffect, useCallback } from 'react';

// VAPID Public Key - Gere uma nova com: npx web-push generate-vapid-keys
// Substitua pela sua chave pública VAPID
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';

export type NotificationPermission = 'default' | 'granted' | 'denied';

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface UsePushNotificationsReturn {
  isSupported: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
  subscription: PushSubscription | null;
  requestPermission: () => Promise<NotificationPermission>;
  subscribe: () => Promise<PushSubscription | null>;
  unsubscribe: () => Promise<boolean>;
  sendTestNotification: () => Promise<void>;
}

// Converte a chave VAPID de base64 para Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Verifica se Push API é suportada
function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Inicialização
  useEffect(() => {
    const init = async () => {
      try {
        // Verifica suporte
        if (!isPushSupported()) {
          setIsSupported(false);
          setIsLoading(false);
          return;
        }

        setIsSupported(true);
        setPermission(Notification.permission as NotificationPermission);

        // Registra o Service Worker
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        console.log('[Push] Service Worker registered:', registration.scope);
        setSwRegistration(registration);

        // Envia a VAPID key para o SW
        if (registration.active) {
          registration.active.postMessage({
            type: 'SET_VAPID_KEY',
            key: VAPID_PUBLIC_KEY,
          });
        }

        // Verifica subscription existente
        const existingSubscription = await registration.pushManager.getSubscription();
        if (existingSubscription) {
          setSubscription(existingSubscription);
          setIsSubscribed(true);
          console.log('[Push] Existing subscription found');
        }
      } catch (err) {
        console.error('[Push] Initialization error:', err);
        setError('Erro ao inicializar notificações');
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  // Solicita permissão
  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      setError('Notificações não são suportadas neste navegador');
      return 'denied';
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result as NotificationPermission);

      if (result === 'denied') {
        setError('Permissão de notificações negada');
      } else {
        setError(null);
      }

      return result as NotificationPermission;
    } catch (err) {
      console.error('[Push] Permission error:', err);
      setError('Erro ao solicitar permissão');
      return 'denied';
    }
  }, [isSupported]);

  // Cria subscription
  const subscribe = useCallback(async (): Promise<PushSubscription | null> => {
    if (!isSupported || !swRegistration) {
      setError('Push notifications não disponível');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Primeiro solicita permissão se necessário
      if (permission !== 'granted') {
        const newPermission = await requestPermission();
        if (newPermission !== 'granted') {
          setIsLoading(false);
          return null;
        }
      }

      // Aguarda o SW estar ativo
      await navigator.serviceWorker.ready;

      // Cria subscription
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      const pushSubscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
      });

      console.log('[Push] Subscription created:', pushSubscription.endpoint);

      // Extrai dados da subscription
      const subscriptionData: PushSubscriptionData = {
        endpoint: pushSubscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...new Uint8Array(pushSubscription.getKey('p256dh')!))),
          auth: btoa(String.fromCharCode(...new Uint8Array(pushSubscription.getKey('auth')!))),
        },
      };

      // Envia para o servidor
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscriptionData),
      });

      if (!response.ok) {
        throw new Error('Falha ao registrar subscription no servidor');
      }

      setSubscription(pushSubscription);
      setIsSubscribed(true);

      // Salva no localStorage para referência
      localStorage.setItem('pushSubscription', JSON.stringify(subscriptionData));

      return pushSubscription;
    } catch (err) {
      console.error('[Push] Subscribe error:', err);
      setError('Erro ao ativar notificações');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, swRegistration, permission, requestPermission]);

  // Remove subscription
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!subscription) {
      return true;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Remove do servidor
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });

      // Remove localmente
      await subscription.unsubscribe();

      setSubscription(null);
      setIsSubscribed(false);
      localStorage.removeItem('pushSubscription');

      console.log('[Push] Unsubscribed successfully');
      return true;
    } catch (err) {
      console.error('[Push] Unsubscribe error:', err);
      setError('Erro ao desativar notificações');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [subscription]);

  // Envia notificação de teste
  const sendTestNotification = useCallback(async (): Promise<void> => {
    if (!isSubscribed) {
      setError('Você precisa ativar as notificações primeiro');
      return;
    }

    try {
      const response = await fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '🍔 Costa-Burger',
          body: 'Notificações ativadas com sucesso! Você receberá atualizações do seu pedido.',
          tag: 'test-notification',
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao enviar notificação de teste');
      }

      console.log('[Push] Test notification sent');
    } catch (err) {
      console.error('[Push] Test notification error:', err);
      setError('Erro ao enviar notificação de teste');
    }
  }, [isSubscribed]);

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    subscription,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
  };
}

export default usePushNotifications;
