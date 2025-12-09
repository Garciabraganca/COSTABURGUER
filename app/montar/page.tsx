"use client";

import BurgerBuilder from '@/components/BurgerBuilder';
import ExtrasChips from '@/components/ExtrasChips';
import SummaryBox from '@/components/SummaryBox';
import { useOrder } from '@/context/OrderContext';
import Link from 'next/link';

export default function MontarPage() {
  const {
    addCustomBurgerToCart,
    currencyFormat,
    cart,
  } = useOrder();

  const handleBurgerComplete = (ingredientes: string[], preco: number) => {
    addCustomBurgerToCart(ingredientes, preco);
  };

  return (
    <div className="montar-page">
      <BurgerBuilder
        onBurgerComplete={handleBurgerComplete}
        currencyFormat={currencyFormat}
      />

      <section className="extras-section">
        <h3>Quer um combo?</h3>
        <p className="step-subtitle">Adicione batata, refri e sobremesa.</p>
        <ExtrasChips />
      </section>

      <section className="summary-section">
        <h3>Resumo rápido</h3>
        <SummaryBox />
      </section>

      <div className="navigation-row">
        <Link href="/" className="btn ghost">
          Voltar
        </Link>
        <Link
          href="/sacola"
          className={`btn primary ${cart.length === 0 ? 'disabled' : ''}`}
        >
          Ir para Sacola ({cart.length})
        </Link>
      </div>
    </div>
  );
}
