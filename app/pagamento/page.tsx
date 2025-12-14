"use client";

import { useState, useEffect } from 'react';
import SummaryBox from '../../components/SummaryBox';
import { useOrder } from '../../context/OrderContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NotificationPrompt from '../../components/NotificationPrompt';
import usePushNotifications from '../../hooks/usePushNotifications';

export default function PagamentoPage() {
  const { cart, buildOrderPayload, currencyFormat, resetAfterOrder } = useOrder();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isSubscribed, subscription } = usePushNotifications();

  async function handleSimulatePayment() {
    setLoading(true);
    setError(null);
    try {
      const payload = buildOrderPayload();

      // Adiciona o endpoint da subscription ao pedido para vincular
      const payloadWithSubscription = {
        ...payload,
        pushEndpoint: subscription?.endpoint,
      };

      const response = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadWithSubscription),
      });
      if (!response.ok) {
        throw new Error('Não foi possível criar o pedido.');
      }
      const data = await response.json();
      resetAfterOrder();

      // Redireciona para a página de acompanhamento se tiver notificações ativas
      if (isSubscribed) {
        router.push(`/acompanhar?pedido=${data.id}`);
      } else {
        router.push(`/pedido/${data.id}`);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2>Pagamento</h2>
      <p className="step-subtitle">Simule o pagamento aprovado para testar o fluxo.</p>

      {/* Prompt de Notificações */}
      <NotificationPrompt
        variant="card"
        onSubscribed={() => {
          console.log('[Pagamento] Notificações ativadas!');
        }}
      />

      <section className="payment-info">
        <h3>Resumo do pedido</h3>
        <ul>
          {cart.map((item) => (
            <li key={item.id}>
              {item.nome}: {currencyFormat(item.preco)}
            </li>
          ))}
        </ul>
        <SummaryBox />
      </section>

      {error && <p className="error-text">{error}</p>}

      <div className="navigation-row">
        <Link href="/entrega" className="btn ghost">
          Voltar
        </Link>
        <button className="btn primary" onClick={handleSimulatePayment} disabled={loading || cart.length === 0}>
          {loading ? 'Processando...' : 'Simular pagamento aprovado'}
        </button>
      </div>
    </div>
  );
}
