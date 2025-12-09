"use client";

import { useState } from 'react';
import BurgerPreview from '@/components/BurgerPreview';
import ExtrasChips from '@/components/ExtrasChips';
import OptionsList from '@/components/OptionsList';
import StepsNav from '@/components/StepsNav';
import SummaryBox from '@/components/SummaryBox';
import { useOrder } from '@/context/OrderContext';
import Link from 'next/link';

export default function MontarPage() {
  const {
    steps,
    currentStepIndex,
    setCurrentStepIndex,
    partialTotal,
    addCurrentBurgerToCart,
    currencyFormat,
    selections,
  } = useOrder();
  const step = steps[currentStepIndex];
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <StepsNav />
      <header className="step-header">
        <div>
          <h2>{step.label}</h2>
          <p className="step-subtitle">{step.subtitle}</p>
        </div>
        <div className="partial">Parcial: {currencyFormat(partialTotal)}</div>
      </header>

      <OptionsList />

      <section className="preview-section">
        <h3>Pré-visualização</h3>
        <BurgerPreview />
      </section>

      <section>
        <h3>Quer um combo?</h3>
        <p className="step-subtitle">Adicione batata, refri e sobremesa.</p>
        <ExtrasChips />
      </section>

      <section>
        <h3>Resumo rápido</h3>
        <SummaryBox />
      </section>

      {error && <p className="error-text">{error}</p>}

      <div className="navigation-row">
        <button
          className="btn ghost"
          onClick={() => setCurrentStepIndex(Math.max(currentStepIndex - 1, 0))}
          disabled={currentStepIndex === 0}
        >
          Voltar
        </button>
        <button
          className="btn primary"
          onClick={() => {
            setError(null);
            if (currentStepIndex < steps.length - 1) {
              if (!selections[step.id]) {
                setError('Selecione uma opção para seguir.');
                return;
              }
              setCurrentStepIndex(currentStepIndex + 1);
              return;
            }
            try {
              addCurrentBurgerToCart();
            } catch (err) {
              setError((err as Error).message);
            }
          }}
        >
          {currentStepIndex < steps.length - 1 ? 'Salvar camada e seguir' : 'Adicionar à sacola'}
        </button>
      </div>

      <div className="secondary-action">
        <Link href="/sacola" className="btn ghost">
          Ir para sacola
        </Link>
      </div>
    </div>
  );
}
