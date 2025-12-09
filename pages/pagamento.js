import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import SummaryBox from '../components/SummaryBox';
import { useOrder } from '../context/OrderContext';

export default function PagamentoPage() {
  const router = useRouter();
  const { cart, customer, cartSubtotal, deliveryFee, extrasSelecionados, createOrderOnServer } = useOrder();

  async function handleSimulatePayment() {
    if (cart.length === 0) {
      alert('Monte e adicione um burger antes de pagar.');
      return;
    }

    const payload = {
      itens: cart,
      cliente: customer,
      extras: Array.from(extrasSelecionados),
      valores: {
        subtotal: cartSubtotal,
        entrega: deliveryFee,
        total: cartSubtotal + deliveryFee,
      },
    };

    try {
      const order = await createOrderOnServer(payload);
      router.push(`/pedido/${order.id}`);
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <Layout>
      <section className="screen active">
        <div className="step-header">
          <button className="btn ghost small" onClick={() => router.push('/entrega')}>
            ← Voltar
          </button>
          <h2>Pagamento Seguro</h2>
        </div>

        <div className="payment-info">
          <p>
            Seu pedido será processado pelo <strong>Mercado Pago</strong>.
          </p>
          <p>Neste MVP o pagamento é simulado e nenhum valor real será cobrado.</p>
          <button className="btn primary" onClick={handleSimulatePayment}>
            Simular pagamento aprovado
          </button>
        </div>

        <SummaryBox />
      </section>
    </Layout>
  );
}
