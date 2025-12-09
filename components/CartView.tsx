"use client";

import { useOrder } from '@/context/OrderContext';

export default function CartView() {
  const { cart, currencyFormat, removeCartItem } = useOrder();

  if (cart.length === 0) {
    return <p>Sua sacola está vazia. Monte um burger para começar.</p>;
  }

  return (
    <div>
      {cart.map((item) => (
        <div key={item.id} className="cart-item">
          <div className="cart-item-header">
            <div>{item.nome}</div>
            <div>{currencyFormat(item.preco)}</div>
          </div>
          <div className="cart-item-desc">
            {Object.values(item.camadas)
              .map((c) => c.nome)
              .join(' • ')}
          </div>
          <div className="cart-item-actions">
            <button className="btn ghost small" onClick={() => removeCartItem(item.id)}>
              Remover
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
