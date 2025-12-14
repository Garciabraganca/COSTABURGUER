'use client';

import { useCallback, useMemo, useState } from 'react';

type SubscribePayload = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

type HookState = {
  isSupported: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
  subscription: PushSubscription | null;
};

export default function usePushNotifications() {
  const supported = useMemo(
    () => typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && typeof Notification !== 'undefined',
    []
  );

  const [state, setState] = useState<HookState>({
    isSupported: supported,
    permission: typeof Notification !== 'undefined' ? Notification.permission : 'default',
    isSubscribed: false,
    isLoading: false,
    error: null,
    subscription: null,
  });

  const requestPermission = useCallback(async () => {
    if (!supported) return { ok: false, reason: 'unsupported' as const };
    const p = await Notification.requestPermission();
    setState((s) => ({ ...s, permission: p }));
    return { ok: p === 'granted', permission: p };
  }, [supported]);

  const subscribe = useCallback(async () => {
    if (!supported) return false;
    if (state.permission !== 'granted') {
      const res = await requestPermission();
      if (!res.ok) return false;
    }

    setState((s) => ({ ...s, isLoading: true, error: null }));

    const reg = await navigator.serviceWorker.register('/sw.js').catch(() => null);
    if (!reg) {
      setState((s) => ({ ...s, isLoading: false, error: 'Service worker não disponível.' }));
      return false;
    }

    const sub = await reg.pushManager
      .subscribe({ userVisibleOnly: true, applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY })
      .catch(() => null);

    if (!sub) {
      setState((s) => ({ ...s, isLoading: false, error: 'Não foi possível inscrever.' }));
      return false;
    }

    const json = sub.toJSON() as any;
    const payload: SubscribePayload = {
      endpoint: sub.endpoint,
      keys: { p256dh: json.keys?.p256dh, auth: json.keys?.auth },
    };

    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => null);

    setState((s) => ({ ...s, isSubscribed: true, isLoading: false, subscription: sub }));
    return true;
  }, [requestPermission, state.permission, supported]);

  const unsubscribe = useCallback(async () => {
    if (!state.subscription) return;
    await state.subscription.unsubscribe().catch(() => null);
    setState((s) => ({ ...s, isSubscribed: false, subscription: null }));
  }, [state.subscription]);

  const sendTestNotification = useCallback(async () => {
    if (!state.subscription) return;
    await fetch('/api/push/test', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ endpoint: state.subscription.endpoint }),
    }).catch(() => null);
  }, [state.subscription]);

  return {
    ...state,
    supported,
    isSupported: state.isSupported,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
  };
}
