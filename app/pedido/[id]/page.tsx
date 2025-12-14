"use client";

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import OrderTimeline, { OrderStatus } from '../../../components/OrderTimeline';
import DeliveryTracker from '../../../components/DeliveryTracker';

const statusOrder: OrderStatus[] = ['CONFIRMADO', 'PREPARANDO', 'PRONTO', 'EM_ENTREGA', 'ENTREGUE'];

interface Pedido {
  id: string;
  numero?: number;
  status: string;
  nome: string;
  celular: string;
  endereco: string;
  tipoEntrega: string;
  total: number;
  itens?: Array<{ nome: string; preco: number }>;
  entrega?: {
    id: string;
    status: string;
    motoboyNome?: string;
  };
}

export default function PedidoPage() {
  const params = useParams();
  const id = params?.id as string;
  const [pedido, setPedido] = useState<Pedido | null>(null);
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
      // Atualizar a cada 30 segundos
      const interval = setInterval(fetchPedido, 30000);
      return () => clearInterval(interval);
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

  const mostrarRastreamento = pedido.status === 'EM_ENTREGA' && pedido.tipoEntrega === 'ENTREGA';

  return (
    <div>
      <h2>Pedido #{pedido.numero || pedido.id.slice(-6)}</h2>
      <p className="step-subtitle">Status atual: {pedido.status}</p>

      <OrderTimeline currentStatus={pedido.status as OrderStatus} />

      {/* Rastreamento de entrega em tempo real */}
      {mostrarRastreamento && (
        <DeliveryTracker pedidoId={pedido.id} />
      )}

      <section className="summary">
        <h3>Itens</h3>
        <ul>
          {pedido.itens?.map((item, idx: number) => (
            <li key={idx}>
              {item.nome} — R$ {Number(item.preco).toFixed(2)}
            </li>
          ))}
        </ul>
        <p>Total: R$ {Number(pedido.total).toFixed(2)}</p>
      </section>

      {/* Informações de entrega */}
      <section className="summary" style={{ marginTop: '1rem' }}>
        <h3>Entrega</h3>
        <p><strong>Cliente:</strong> {pedido.nome}</p>
        <p><strong>Celular:</strong> {pedido.celular}</p>
        <p><strong>Tipo:</strong> {pedido.tipoEntrega === 'RETIRADA' ? 'Retirada no balcão' : 'Delivery'}</p>
        {pedido.tipoEntrega === 'ENTREGA' && (
          <p><strong>Endereço:</strong> {pedido.endereco}</p>
        )}
      </section>

      {error && <p className="error-text">{error}</p>}

      <button className="btn primary" onClick={advanceStatus} disabled={pedido.status === 'ENTREGUE' || loading}>
        {pedido.status === 'ENTREGUE' ? 'Pedido finalizado' : 'Simular avanço de status'}
      </button>

      {/* Mensagem de conclusão */}
      {pedido.status === 'ENTREGUE' && (
        <div style={{
          background: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)',
          color: '#fff',
          padding: '1.5rem',
          borderRadius: '0.75rem',
          textAlign: 'center',
          marginTop: '1.5rem'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Pedido Entregue!</div>
          <div style={{ marginTop: '0.5rem', opacity: 0.9 }}>
            Obrigado por pedir na Costa Burger!
          </div>
        </div>
      )}
    </div>
  );
}
