"use client";

import { useOrder } from '@/context/OrderContext';

export default function ExtrasChips() {
  const { extras, extrasSelecionados, toggleExtra, currencyFormat } = useOrder();

  return (
    <div className="chips">
      {extras.map((extra) => (
        <button
          key={extra.id}
          className={`chip${extrasSelecionados.includes(extra.id) ? ' selected' : ''}`}
          onClick={() => toggleExtra(extra.id)}
        >
          {extra.nome} ({currencyFormat(extra.preco)})
        </button>
      ))}
    </div>
  );
}
