"use client";

import { useOrder } from '@/context/OrderContext';

export default function CartView() {
  const { cart, currencyFormat, removeCartItem } = useOrder();

  if (cart.length === 0) {
    return (
      <div className="flex min-h-[160px] items-center justify-center rounded-xl border border-dashed border-emerald-300/40 bg-emerald-500/5 p-6 text-center text-sm text-white/70">
        <div>
          <p className="text-lg font-semibold text-white">Sua sacola está vazia</p>
          <p className="mt-1 text-white/60">Monte um burger para começar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {cart.map((item) => (
        <div
          key={item.id}
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-slate-900/60 to-slate-800/60 p-4 shadow-md shadow-black/30 ring-1 ring-white/5"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/50">Burger personalizado</p>
              <h4 className="text-lg font-semibold text-white">{item.nome}</h4>
              <p className="mt-1 text-sm text-white/70">
                {Object.values(item.camadas)
                  .map((c) => c.nome)
                  .join(' • ')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.2em] text-white/50">{item.quantidade}x</p>
              <p className="text-sm text-white/60">{currencyFormat(item.precoUnitario)} cada</p>
              <p className="text-xl font-bold text-emerald-200">{currencyFormat(item.precoTotal)}</p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-white/50">
            <span>{item.ingredientes.length} ingrediente(s) selecionado(s)</span>
            <button
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white/80 transition hover:border-red-300 hover:text-red-100"
              onClick={() => removeCartItem(item.id)}
            >
              Remover
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
