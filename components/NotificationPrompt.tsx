"use client";

import { useState, useEffect } from 'react';
import usePushNotifications from '@/hooks/usePushNotifications';

interface NotificationPromptProps {
  variant?: 'banner' | 'card' | 'minimal';
  onSubscribed?: () => void;
  onDismissed?: () => void;
  showTestButton?: boolean;
}

export default function NotificationPrompt({
  variant = 'card',
  onSubscribed,
  onDismissed,
  showTestButton = false,
}: NotificationPromptProps) {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    sendTestNotification,
  } = usePushNotifications();

  const [isDismissed, setIsDismissed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Verifica se já foi descartado anteriormente
  useEffect(() => {
    const dismissed = localStorage.getItem('notificationPromptDismissed');
    if (dismissed) {
      setIsDismissed(true);
    }
  }, []);

  // Não mostra se não suportado, já inscrito, ou descartado
  if (!isSupported || isDismissed) {
    return null;
  }

  const handleSubscribe = async () => {
    const result = await subscribe();
    if (result) {
      setShowSuccess(true);
      onSubscribed?.();
      // Envia notificação de boas-vindas
      setTimeout(() => {
        sendTestNotification();
      }, 1000);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('notificationPromptDismissed', 'true');
    setIsDismissed(true);
    onDismissed?.();
  };

  const handleUnsubscribe = async () => {
    await unsubscribe();
    setShowSuccess(false);
  };

  // Se já está inscrito, mostra status
  if (isSubscribed) {
    if (variant === 'minimal') {
      return (
        <div className="notification-status notification-status--active">
          <span className="notification-status__icon">🔔</span>
          <span>Notificações ativadas</span>
          {showTestButton && (
            <button
              className="notification-status__test"
              onClick={sendTestNotification}
              disabled={isLoading}
            >
              Testar
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="notification-prompt notification-prompt--subscribed">
        <div className="notification-prompt__icon">🔔</div>
        <div className="notification-prompt__content">
          <h4>Notificações ativadas!</h4>
          <p>Você receberá atualizações sobre seu pedido.</p>
        </div>
        <div className="notification-prompt__actions">
          {showTestButton && (
            <button
              className="btn small ghost"
              onClick={sendTestNotification}
              disabled={isLoading}
            >
              Testar
            </button>
          )}
          <button
            className="btn small ghost"
            onClick={handleUnsubscribe}
            disabled={isLoading}
          >
            Desativar
          </button>
        </div>
      </div>
    );
  }

  // Prompt para permissão negada
  if (permission === 'denied') {
    return (
      <div className="notification-prompt notification-prompt--denied">
        <div className="notification-prompt__icon">🔕</div>
        <div className="notification-prompt__content">
          <h4>Notificações bloqueadas</h4>
          <p>Para receber atualizações do seu pedido, permita notificações nas configurações do navegador.</p>
        </div>
        <button className="btn small ghost" onClick={handleDismiss}>
          Entendi
        </button>
      </div>
    );
  }

  // Prompt de sucesso temporário
  if (showSuccess) {
    return (
      <div className="notification-prompt notification-prompt--success">
        <div className="notification-prompt__icon">✅</div>
        <div className="notification-prompt__content">
          <h4>Notificações ativadas!</h4>
          <p>Você receberá uma notificação de confirmação.</p>
        </div>
      </div>
    );
  }

  // Banner variant
  if (variant === 'banner') {
    return (
      <div className="notification-banner">
        <div className="notification-banner__content">
          <span className="notification-banner__icon">🔔</span>
          <span className="notification-banner__text">
            Ative as notificações para acompanhar seu pedido em tempo real!
          </span>
        </div>
        <div className="notification-banner__actions">
          <button
            className="notification-banner__btn notification-banner__btn--primary"
            onClick={handleSubscribe}
            disabled={isLoading}
          >
            {isLoading ? 'Ativando...' : 'Ativar'}
          </button>
          <button
            className="notification-banner__btn notification-banner__btn--ghost"
            onClick={handleDismiss}
          >
            Agora não
          </button>
        </div>
      </div>
    );
  }

  // Minimal variant
  if (variant === 'minimal') {
    return (
      <button
        className="notification-toggle"
        onClick={handleSubscribe}
        disabled={isLoading}
      >
        <span className="notification-toggle__icon">🔔</span>
        <span>{isLoading ? 'Ativando...' : 'Ativar notificações'}</span>
      </button>
    );
  }

  // Card variant (default)
  return (
    <div className="notification-prompt">
      <button className="notification-prompt__close" onClick={handleDismiss}>
        ×
      </button>
      <div className="notification-prompt__icon">🔔</div>
      <div className="notification-prompt__content">
        <h4>Não perca nenhuma atualização!</h4>
        <p>
          Ative as notificações para saber quando seu pedido estiver sendo
          preparado, pronto e a caminho.
        </p>
        {error && <p className="notification-prompt__error">{error}</p>}
      </div>
      <div className="notification-prompt__actions">
        <button
          className="btn primary"
          onClick={handleSubscribe}
          disabled={isLoading}
        >
          {isLoading ? 'Ativando...' : 'Ativar notificações'}
        </button>
        <button className="btn ghost" onClick={handleDismiss}>
          Agora não
        </button>
      </div>
    </div>
  );
}

// Componente para configurações de notificação
export function NotificationSettings() {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
    sendTestNotification,
  } = usePushNotifications();

  if (!isSupported) {
    return (
      <div className="notification-settings">
        <h4>Notificações</h4>
        <p className="notification-settings__unsupported">
          Seu navegador não suporta notificações push.
        </p>
      </div>
    );
  }

  return (
    <div className="notification-settings">
      <div className="notification-settings__header">
        <h4>🔔 Notificações Push</h4>
        <span className={`notification-settings__status ${isSubscribed ? 'active' : ''}`}>
          {isSubscribed ? 'Ativadas' : 'Desativadas'}
        </span>
      </div>

      <p className="notification-settings__description">
        Receba atualizações em tempo real sobre o status do seu pedido.
      </p>

      {permission === 'denied' && (
        <p className="notification-settings__warning">
          ⚠️ Notificações estão bloqueadas. Permita nas configurações do navegador.
        </p>
      )}

      <div className="notification-settings__actions">
        {isSubscribed ? (
          <>
            <button
              className="btn small primary"
              onClick={sendTestNotification}
              disabled={isLoading}
            >
              Enviar teste
            </button>
            <button
              className="btn small ghost"
              onClick={unsubscribe}
              disabled={isLoading}
            >
              Desativar
            </button>
          </>
        ) : (
          <button
            className="btn primary"
            onClick={subscribe}
            disabled={isLoading || permission === 'denied'}
          >
            {isLoading ? 'Ativando...' : 'Ativar notificações'}
          </button>
        )}
      </div>

      <div className="notification-settings__info">
        <p><strong>Você será notificado quando:</strong></p>
        <ul>
          <li>✅ Pedido confirmado</li>
          <li>👨‍🍳 Pedido em preparação</li>
          <li>🛵 Pedido saiu para entrega</li>
          <li>📍 Entregador chegou</li>
        </ul>
      </div>
    </div>
  );
}
