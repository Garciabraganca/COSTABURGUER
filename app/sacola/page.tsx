"use client";

import ExtrasChips from '@/components/ExtrasChips';
import SummaryBox from '@/components/SummaryBox';
import CartView from '@/components/CartView';
import { useOrder } from '@/context/OrderContext';
import Link from 'next/link';

export default function SacolaPage() {
  const { cart, extrasSelecionados } = useOrder();

  return (
    <div>
      <h2>Sacola</h2>
      <p className="step-subtitle">Revise seus burgers artesanais.</p>

      <CartView />

      <section>
        <h3>Extras da casa</h3>
        <ExtrasChips />
        {extrasSelecionados.length === 0 && (
          <p className="step-subtitle">Escolha batata, refri ou sobremesa para acompanhar.</p>
        )}
      </section>

      <SummaryBox />

      <div className="navigation-row">
        <Link href="/montar" className="btn ghost">
          Adicionar mais burgers
        </Link>
        <Link
          href={cart.length === 0 ? '#' : '/entrega'}
          className={`btn primary${cart.length === 0 ? ' disabled' : ''}`}
          aria-disabled={cart.length === 0}
        >
          Continuar para entrega
        </Link>
      </div>
    </div>
  );
}
