"use client";

import { useState } from 'react';
import BurgerBuilder from '@/components/BurgerBuilder';
import ExtrasChips from '@/components/ExtrasChips';
import SummaryBox from '@/components/SummaryBox';
import { useOrder } from '@/context/OrderContext';
import Link from 'next/link';
import { SectionCard } from '@/components/widgets/SectionCard';
import { NeonCard } from '@/components/widgets/NeonCard';
import { ShoppingBag } from 'lucide-react';

export default function MontarPage() {
  const {
    addCustomBurgerToCart,
    currencyFormat,
    cart,
  } = useOrder();

  // Preço do hambúrguer sendo montado em tempo real
  const [currentBurgerPrice, setCurrentBurgerPrice] = useState(0);

  const handleBurgerComplete = (ingredientes: string[], preco: number) => {
    addCustomBurgerToCart(ingredientes, preco);
    setCurrentBurgerPrice(0); // Reset após adicionar à sacola
  };

  const handlePriceChange = (preco: number) => {
    setCurrentBurgerPrice(preco);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black px-4 py-8 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">Montagem personalizada</p>
          <h1 className="text-3xl font-black sm:text-4xl">Monte seu hambúrguer</h1>
          <p className="text-white/70">Escolha ingredientes, combos e visualize em tempo real.</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <SectionCard title="Monte seu Hambúrguer" subtitle="Selecione os ingredientes" className="bg-white/5">
              <BurgerBuilder
                onBurgerComplete={handleBurgerComplete}
                currencyFormat={currencyFormat}
                onPriceChange={handlePriceChange}
              />
            </SectionCard>

            <SectionCard title="Quer um combo?" subtitle="Adicione batata, refri e sobremesa">
              <ExtrasChips />
            </SectionCard>
          </div>

          <div className="space-y-6">
            <SectionCard title="Sacola e checkout" subtitle="Resumo do que já foi adicionado">
              <div className="space-y-4">
                <NeonCard
                  title="Itens na sacola"
                  subtitle={cart.length === 0 && currentBurgerPrice === 0 ? 'Aguardando seleção' : currentBurgerPrice > 0 ? 'Montando hambúrguer...' : 'Pronto para enviar'}
                  value={cart.length}
                  icon={ShoppingBag}
                  accent="cyan"
                />
                <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-inner shadow-black/30 backdrop-blur">
                  {cart.length === 0 && currentBurgerPrice === 0 ? (
                    <p className="text-sm text-white/70">Nenhum ingrediente adicionado.</p>
                  ) : currentBurgerPrice > 0 ? (
                    <p className="text-sm text-emerald-400/80">Montando seu hambúrguer...</p>
                  ) : (
                    <p className="text-sm text-white/70">{cart.length} item(s) aguardando checkout.</p>
                  )}
                  <SummaryBox previewPrice={currentBurgerPrice} />
                </div>
                <Link
                  href="/sacola"
                  className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${cart.length === 0 ? 'cursor-not-allowed bg-white/10 text-white/50' : 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30 hover:scale-[1.02]'}`}
                >
                  {cart.length === 0 ? 'Adicione ingredientes para continuar' : `Ir para sacola (${cart.length})`}
                </Link>
                <div className="flex items-center justify-between text-xs text-white/60">
                  <Link href="/" className="underline-offset-4 hover:underline">Voltar</Link>
                  <span className="text-white/50">Total dinâmico baseado nas escolhas</span>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </main>
  );
}
