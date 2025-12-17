"use client";

import { useOrder } from '@/context/OrderContext';

type SummaryBoxProps = {
  /** Preço do hambúrguer sendo montado (em tempo real) */
  previewPrice?: number;
  /** Mostrar apenas o preview, sem o carrinho */
  previewOnly?: boolean;
};

export default function SummaryBox({ previewPrice = 0, previewOnly = false }: SummaryBoxProps) {
  const { cartSubtotal, deliveryFee, currencyFormat, cart } = useOrder();

  // Subtotal = itens no carrinho + hambúrguer sendo montado (preview)
  const effectiveSubtotal = previewOnly ? previewPrice : cartSubtotal + previewPrice;
  const total = effectiveSubtotal + deliveryFee;

  return (
    <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-white shadow-inner shadow-black/30 backdrop-blur">
      {/* Itens no carrinho */}
      {!previewOnly && cart.length > 0 && (
        <div className="flex items-center justify-between text-sm text-white/80">
          <span>Carrinho ({cart.length} {cart.length === 1 ? 'item' : 'itens'})</span>
          <span className="font-semibold text-white">{currencyFormat(cartSubtotal)}</span>
        </div>
      )}

      {/* Hambúrguer sendo montado */}
      {previewPrice > 0 && (
        <div className="flex items-center justify-between text-sm text-emerald-300/90">
          <span>Montando agora</span>
          <span className="font-semibold">{currencyFormat(previewPrice)}</span>
        </div>
      )}

      {/* Subtotal */}
      <div className="flex items-center justify-between text-sm text-white/80">
        <span>Subtotal</span>
        <span className="font-semibold text-white">{currencyFormat(effectiveSubtotal)}</span>
      </div>

      {/* Taxa de entrega */}
      <div className="flex items-center justify-between text-sm text-white/80">
        <span>Taxa de entrega</span>
        <span className="font-semibold text-white">{currencyFormat(deliveryFee)}</span>
      </div>

      {/* Total */}
      <div className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-2 text-base font-semibold text-white">
        <span>Total</span>
        <span className="text-emerald-400">{currencyFormat(total)}</span>
      </div>
    </div>
  );
}
