"use client";

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import OrderTimeline, { OrderStatus } from '@/components/OrderTimeline';
import DeliveryTracker from '@/components/DeliveryTracker';
import { SectionCard } from '@/components/widgets/SectionCard';
import { StepsWidget } from '@/components/widgets/StepsWidget';

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
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black px-4 py-10 text-white">
        <div className="mx-auto max-w-3xl">
          <SectionCard title="Status do Pedido" subtitle="Algo deu errado" className="bg-white/5">
            <p className="text-sm text-red-200">{error}</p>
          </SectionCard>
        </div>
      </main>
    );
  }

  if (!pedido) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black px-4 py-10 text-white">
        <div className="mx-auto max-w-3xl">
          <SectionCard title="Status do Pedido" subtitle="Carregando" className="bg-white/5">
            <p className="text-sm text-white/70">Carregando dados do pedido...</p>
          </SectionCard>
        </div>
      </main>
    );
  }

  const mostrarRastreamento = pedido.status === 'EM_ENTREGA' && pedido.tipoEntrega === 'ENTREGA';
  const currentIndex = statusOrder.indexOf(pedido.status as OrderStatus);
  const completedSteps = currentIndex >= 0 ? currentIndex + 1 : 1;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black px-4 py-10 text-white">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <header className="space-y-1">
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">Pedido #{pedido.numero || pedido.id.slice(-6)}</p>
          <h2 className="text-3xl font-black">Status: {pedido.status}</h2>
          {error && <p className="text-sm text-red-200">{error}</p>}
        </header>

        <SectionCard title="Acompanhamento" subtitle="Linha do tempo" className="bg-white/5">
          <div className="space-y-6">
            <StepsWidget
              title="Status do pedido"
              metaLabel={`${statusOrder.length} etapas`}
              current={completedSteps}
              total={statusOrder.length}
              completedSteps={completedSteps}
              totalSteps={statusOrder.length}
              highlight={pedido.status}
            />
            <OrderTimeline currentStatus={pedido.status as OrderStatus} />
            {mostrarRastreamento ? (
              <DeliveryTracker pedidoId={pedido.id} />
            ) : (
              <div className="rounded-xl border border-dashed border-white/10 bg-white/5 p-4 text-sm text-white/70">
                Nenhum pedido ativo em rota.
              </div>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Detalhes do pedido" subtitle="Itens e valores" className="bg-white/5">
          <div className="space-y-4">
            {pedido.itens && pedido.itens.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {pedido.itens.map((item, idx: number) => (
                  <li key={idx} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-3 py-2">
                    <span>{item.nome}</span>
                    <span className="font-semibold">R$ {Number(item.preco).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-white/70">Nenhum item listado.</p>
            )}
            <div className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-base font-semibold">
              <span>Total</span>
              <span>R$ {Number(pedido.total).toFixed(2)}</span>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Entrega" subtitle="Dados do cliente" className="bg-white/5">
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <p><span className="text-white/60">Cliente:</span> {pedido.nome}</p>
            <p><span className="text-white/60">Celular:</span> {pedido.celular}</p>
            <p><span className="text-white/60">Tipo:</span> {pedido.tipoEntrega === 'RETIRADA' ? 'Retirada no balcão' : 'Delivery'}</p>
            {pedido.tipoEntrega === 'ENTREGA' && (
              <p className="sm:col-span-2"><span className="text-white/60">Endereço:</span> {pedido.endereco}</p>
            )}
          </div>
        </SectionCard>

        <div className="flex flex-wrap items-center gap-3">
          <button
            className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/60 disabled:shadow-none"
            onClick={advanceStatus}
            disabled={pedido.status === 'ENTREGUE' || loading}
          >
            {pedido.status === 'ENTREGUE' ? 'Pedido finalizado' : 'Simular avanço de status'}
          </button>
          {loading && <span className="text-xs text-white/70">Atualizando status...</span>}
        </div>

        {pedido.status === 'ENTREGUE' && (
          <div className="rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 p-6 text-center text-slate-950 shadow-lg shadow-emerald-500/30">
            <div className="text-3xl">✅</div>
            <div className="text-xl font-bold">Pedido Entregue!</div>
            <div className="mt-2 text-sm">Obrigado por pedir na Costa Burger!</div>
          </div>
        )}
      </div>
    </main>
  );
}
