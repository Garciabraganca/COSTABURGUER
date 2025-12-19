"use client";

import { useState, useEffect } from 'react';
import SummaryBox from '@/components/SummaryBox';
import { useOrder } from '@/context/OrderContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NotificationPrompt from '@/components/NotificationPrompt';
import usePushNotifications from '@/hooks/usePushNotifications';
import { SectionCard } from '@/components/widgets/SectionCard';

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
        router.push(`/acompanhar?pedido=${data.pedidoId || data.id}`);
      } else {
        router.push(`/pedido/${data.pedidoId || data.id}`);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black px-4 py-10 text-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">Pagamento</p>
          <h2 className="text-3xl font-black sm:text-4xl">Finalize seu pedido</h2>
          <p className="text-white/60">Simule o pagamento aprovado para testar o fluxo.</p>
        </header>

        <NotificationPrompt
          variant="card"
          onSubscribed={() => {
            console.log('[Pagamento] Notificações ativadas!');
          }}
        />

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <SectionCard title="Resumo do pedido" subtitle="Ingredientes e valores" className="bg-white/5">
            <ul className="space-y-3 text-sm text-white/80">
              {cart.map((item) => (
                <li key={item.id} className="flex items-start justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <div>
                    <p className="font-semibold text-white">{item.nome}</p>
                    <p className="text-xs text-white/60">
                      {Object.values(item.camadas)
                        .map((c) => c.nome)
                        .join(' • ')}
                    </p>
                  </div>
                  <span className="font-semibold text-emerald-200">{currencyFormat(item.preco)}</span>
                </li>
              ))}
            </ul>
          </SectionCard>

          <div className="space-y-4">
            <SectionCard title="Totais" subtitle="Checagem final" className="bg-white/5">
              <SummaryBox />
              {error && <p className="mt-2 text-sm text-red-200">{error}</p>}
            </SectionCard>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <Link
                href="/entrega"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
              >
                Voltar
              </Link>
              <button
                className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${
                  loading || cart.length === 0
                    ? 'cursor-not-allowed bg-white/10 text-white/50'
                    : 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30 hover:scale-[1.02]'
                }`}
                onClick={handleSimulatePayment}
                disabled={loading || cart.length === 0}
              >
                {loading ? 'Processando...' : 'Simular pagamento aprovado'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
