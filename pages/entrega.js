import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import SummaryBox from '../components/SummaryBox';
import { useOrder } from '../context/OrderContext';

export default function EntregaPage() {
  const router = useRouter();
  const { customer, updateCustomer } = useOrder();

  function handleChange(event) {
    const { name, value } = event.target;
    updateCustomer({ [name]: value });
  }

  function handleSubmit(event) {
    event.preventDefault();
    router.push('/pagamento');
  }

  return (
    <Layout>
      <section className="screen active">
        <div className="step-header">
          <button className="btn ghost small" onClick={() => router.push('/sacola')}>
            ← Voltar
          </button>
          <h2>Endereço de entrega</h2>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <label>
            Nome completo
            <input type="text" name="nome" required value={customer.nome || ''} onChange={handleChange} />
          </label>
          <label>
            Celular (WhatsApp)
            <input type="tel" name="celular" required value={customer.celular || ''} onChange={handleChange} />
          </label>
          <label>
            Rua e número
            <input type="text" name="rua" required value={customer.rua || ''} onChange={handleChange} />
          </label>
          <label>
            Bairro
            <input type="text" name="bairro" required value={customer.bairro || ''} onChange={handleChange} />
          </label>
          <label>
            Complemento
            <input type="text" name="complemento" value={customer.complemento || ''} onChange={handleChange} />
          </label>
          <label>
            Ponto de referência
            <input type="text" name="referencia" value={customer.referencia || ''} onChange={handleChange} />
          </label>

          <div className="delivery-type">
            <p>Tipo de entrega</p>
            <label>
              <input
                type="radio"
                name="tipoEntrega"
                value="entrega"
                checked={(customer.tipoEntrega || 'entrega') === 'entrega'}
                onChange={handleChange}
              />{' '}
              Entrega em casa
            </label>
            <label>
              <input
                type="radio"
                name="tipoEntrega"
                value="retirada"
                checked={customer.tipoEntrega === 'retirada'}
                onChange={handleChange}
              />{' '}
              Retirada no balcão
            </label>
          </div>

          <div className="bottom-bar">
            <button className="btn primary" type="submit">
              Ir para pagamento
            </button>
          </div>
        </form>

        <SummaryBox />
      </section>
    </Layout>
  );
}
