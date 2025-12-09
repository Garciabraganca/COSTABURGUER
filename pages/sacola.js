import Link from 'next/link';
import { useRouter } from 'next/router';
import CartView from '../components/CartView';
import ExtrasChips from '../components/ExtrasChips';
import Layout from '../components/Layout';
import SummaryBox from '../components/SummaryBox';
import { useOrder } from '../context/OrderContext';

export default function SacolaPage() {
  const router = useRouter();
  const { cart } = useOrder();

  return (
    <Layout>
      <section className="screen active">
        <div className="step-header">
          <Link className="btn ghost small" href="/montar">
            ← Voltar
          </Link>
          <h2>Sua sacola</h2>
        </div>

        <CartView />

        {cart.length > 0 && (
          <>
            <div className="extras">
              <h3>Adicionar extras</h3>
              <ExtrasChips />
            </div>

            <SummaryBox />

            <div className="bottom-bar">
              <button className="btn primary" onClick={() => router.push('/entrega')}>
                Continuar para entrega
              </button>
            </div>
          </>
        )}
      </section>
    </Layout>
  );
}
