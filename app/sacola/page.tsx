"use client";

import ExtrasChips from '@/components/ExtrasChips';
import SummaryBox from '@/components/SummaryBox';
import CartView from '@/components/CartView';
import { useOrder } from '@/context/OrderContext';
import Link from 'next/link';
import { SectionCard } from '@/components/widgets/SectionCard';

export default function SacolaPage() {
  const { cart, extrasSelecionados } = useOrder();

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black px-4 py-10 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">Sacola</p>
            <h2 className="text-3xl font-black sm:text-4xl">Revise seus burgers artesanais</h2>
            <p className="text-white/60">Tudo pronto para seguir para entrega e pagamento.</p>
          </div>
          <div className="rounded-2xl bg-emerald-500/15 px-4 py-3 text-right text-sm font-semibold text-emerald-100 ring-1 ring-emerald-400/40">
            <p className="text-xs uppercase tracking-[0.2em]">Itens</p>
            <p className="text-2xl font-black">{cart.length}</p>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <SectionCard title="Meus burgers" subtitle="Toque para remover ou editar" className="bg-white/5">
            <CartView />
          </SectionCard>

          <div className="space-y-4">
            <SectionCard title="Extras da casa" subtitle="Batata, refri ou sobremesa" className="bg-white/5">
              <ExtrasChips />
              {extrasSelecionados.length === 0 && (
                <p className="mt-2 text-sm text-white/60">Escolha um acompanhamento para deixar a experiência completa.</p>
              )}
            </SectionCard>

            <SectionCard title="Resumo" subtitle="Valores atualizados em tempo real" className="bg-white/5">
              <SummaryBox />
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-between">
                <Link
                  href="/montar"
                  className="inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
                >
                  Adicionar mais burgers
                </Link>
                <Link
                  href={cart.length === 0 ? '#' : '/entrega'}
                  className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${
                    cart.length === 0
                      ? 'cursor-not-allowed bg-white/10 text-white/50'
                      : 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30 hover:scale-[1.02]'
                  }`}
                  aria-disabled={cart.length === 0}
                >
                  {cart.length === 0 ? 'Adicione um burger para continuar' : 'Continuar para entrega'}
                </Link>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </main>
  );
}
