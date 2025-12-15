"use client";

import { useOrder } from '@/context/OrderContext';

export default function SummaryBox() {
  const { cartSubtotal, deliveryFee, currencyFormat } = useOrder();
  const total = cartSubtotal + deliveryFee;

  return (
    <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-white shadow-inner shadow-black/30 backdrop-blur">
      <div className="flex items-center justify-between text-sm text-white/80">
        <span>Subtotal</span>
        <span className="font-semibold text-white">{currencyFormat(cartSubtotal)}</span>
      </div>
      <div className="flex items-center justify-between text-sm text-white/80">
        <span>Taxa de entrega</span>
        <span className="font-semibold text-white">{currencyFormat(deliveryFee)}</span>
      </div>
      <div className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-2 text-base font-semibold text-white">
        <span>Total</span>
        <span>{currencyFormat(total)}</span>
      </div>
    </div>
  );
}
