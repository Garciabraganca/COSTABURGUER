import { useMemo } from 'react';
import { useRouter } from 'next/router';
import BurgerPreview from '../components/BurgerPreview';
import Layout from '../components/Layout';
import OptionsList from '../components/OptionsList';
import StepsNav from '../components/StepsNav';
import { useOrder } from '../context/OrderContext';

export default function MontarPage() {
  const router = useRouter();
  const { steps, currentStepIndex, setCurrentStepIndex, partialTotal, currencyFormat, addCurrentBurgerToCart } =
    useOrder();

  const subtitle = useMemo(() => steps[currentStepIndex]?.subtitle, [currentStepIndex, steps]);

  function handleNext() {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      return;
    }

    try {
      addCurrentBurgerToCart();
      router.push('/sacola');
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <Layout>
      <section className="screen active">
        <div className="step-header">
          <button className="btn ghost small" onClick={() => router.push('/')}>← Voltar</button>
          <div>
            <h2>Monte seu burger em camadas</h2>
            <p className="step-subtitle">{subtitle}</p>
          </div>
        </div>

        <BurgerPreview />
        <StepsNav />
        <OptionsList />

        <div className="bottom-bar">
          <div className="total">Total parcial: {currencyFormat(partialTotal)}</div>
          <button className="btn primary" onClick={handleNext}>
            {currentStepIndex < steps.length - 1 ? 'Próxima camada' : 'Adicionar à sacola'}
          </button>
        </div>
      </section>
    </Layout>
  );
}
