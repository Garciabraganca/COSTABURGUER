"use client";

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import OrderTimeline, { OrderStatus } from '@/components/OrderTimeline';

const statusOrder: OrderStatus[] = ['CONFIRMADO', 'PREPARANDO', 'EM_ENTREGA', 'ENTREGUE'];

export default function PedidoPage() {
  const params = useParams();
  const id = params?.id as string;
  const [pedido, setPedido] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchPedido() {
    try {
      const response = await fetch(`/api/pedidos/${id}`);
      if (!response.ok) {
        throw new Error('Pedido não encontrado');
      }
      const data = await response.json();
      setPedido(data);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  useEffect(() => {
    if (id) {
      fetchPedido();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const nextStatus = useMemo(() => {
    if (!pedido) return null;
    const currentIndex = statusOrder.indexOf(pedido.status as OrderStatus);
    return statusOrder[Math.min(currentIndex + 1, statusOrder.length - 1)];
  }, [pedido]);

  async function advanceStatus() {
    if (!nextStatus || !pedido) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/pedidos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!response.ok) {
        throw new Error('Não foi possível atualizar o status.');
      }
      const data = await response.json();
      setPedido(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (error && !pedido) {
    return <p className="error-text">{error}</p>;
  }

  if (!pedido) {
    return <p>Carregando dados do pedido...</p>;
  }

  return (
    <div>
      <h2>Pedido #{pedido.id}</h2>
      <p className="step-subtitle">Status atual: {pedido.status}</p>

      <OrderTimeline currentStatus={pedido.status} />

      <section className="summary">
        <h3>Itens</h3>
        <ul>
          {pedido.itens?.map((item: any, idx: number) => (
            <li key={idx}>
              {item.nome} — R$ {Number(item.preco).toFixed(2)}
            </li>
          ))}
        </ul>
        <p>Total: R$ {Number(pedido.total).toFixed(2)}</p>
      </section>

      {error && <p className="error-text">{error}</p>}

      <button className="btn primary" onClick={advanceStatus} disabled={pedido.status === 'ENTREGUE' || loading}>
        {pedido.status === 'ENTREGUE' ? 'Pedido finalizado' : 'Simular avanço de status'}
      </button>
    </div>
  );
}
