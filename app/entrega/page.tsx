"use client";

import Link from 'next/link';
import { useOrder } from '../../context/OrderContext';

export default function EntregaPage() {
  const { customer, updateCustomer } = useOrder();

  return (
    <div>
      <h2>Entrega</h2>
      <p className="step-subtitle">Preencha os dados para encontramos você.</p>

      <form className="form" onSubmit={(e) => e.preventDefault()}>
        <label>
          Nome completo
          <input
            value={customer.nome || ''}
            onChange={(e) => updateCustomer({ nome: e.target.value })}
            placeholder="Quem vai receber?"
          />
        </label>
        <label>
          Celular / WhatsApp
          <input
            value={customer.celular || ''}
            onChange={(e) => updateCustomer({ celular: e.target.value })}
            placeholder="(00) 99999-0000"
          />
        </label>
        <label>
          Rua e número
          <input
            value={customer.rua || ''}
            onChange={(e) => updateCustomer({ rua: e.target.value })}
            placeholder="Av. da praia, 123"
          />
        </label>
        <label>
          Bairro
          <input
            value={customer.bairro || ''}
            onChange={(e) => updateCustomer({ bairro: e.target.value })}
            placeholder="Centro"
          />
        </label>
        <label>
          Complemento
          <input
            value={customer.complemento || ''}
            onChange={(e) => updateCustomer({ complemento: e.target.value })}
            placeholder="Bloco, apartamento..."
          />
        </label>
        <label>
          Referência
          <input
            value={customer.referencia || ''}
            onChange={(e) => updateCustomer({ referencia: e.target.value })}
            placeholder="Perto do quiosque vermelho"
          />
        </label>
      </form>

      <div className="delivery-type">
        <p>Tipo de entrega</p>
        <label>
          <input
            type="radio"
            name="tipo"
            value="ENTREGA"
            checked={customer.tipoEntrega !== 'RETIRADA'}
            onChange={(e) => updateCustomer({ tipoEntrega: e.target.value as 'ENTREGA' | 'RETIRADA' })}
          />
          Entrega em casa
        </label>
        <label>
          <input
            type="radio"
            name="tipo"
            value="RETIRADA"
            checked={customer.tipoEntrega === 'RETIRADA'}
            onChange={(e) => updateCustomer({ tipoEntrega: e.target.value as 'ENTREGA' | 'RETIRADA' })}
          />
          Retirada no balcão
        </label>
      </div>

      <div className="navigation-row">
        <Link href="/sacola" className="btn ghost">
          Voltar para sacola
        </Link>
        <Link href="/pagamento" className="btn primary">
          Ir para pagamento
        </Link>
      </div>
    </div>
  );
}
