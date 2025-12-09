"use client";

import { useState } from 'react';
import SummaryBox from '@/components/SummaryBox';
import { useOrder } from '@/context/OrderContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PagamentoPage() {
  const { cart, buildOrderPayload, currencyFormat, resetAfterOrder } = useOrder();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSimulatePayment() {
    setLoading(true);
    setError(null);
    try {
      const payload = buildOrderPayload();
      const response = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error('Não foi possível criar o pedido.');
      }
      const data = await response.json();
      resetAfterOrder();
      router.push(`/pedido/${data.id}`);
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
