import { useOrder } from '../context/OrderContext';

export default function SummaryBox() {
  const { cartSubtotal, deliveryFee, currencyFormat } = useOrder();
  const total = cartSubtotal + deliveryFee;

  return (
    <div className="summary">
      <div className="summary-line">
        <span>Subtotal</span>
        <span>{currencyFormat(cartSubtotal)}</span>
      </div>
      <div className="summary-line">
        <span>Taxa de entrega</span>
        <span>{currencyFormat(deliveryFee)}</span>
      </div>
      <div className="summary-line total">
        <span>Total</span>
        <span>{currencyFormat(total)}</span>
      </div>
    </div>
  );
}
