import { useOrder } from '../context/OrderContext';

export default function BurgerPreview() {
  const { selections } = useOrder();

  return (
    <div className="burger-preview">
      <div className="burger-layer bun-top"></div>
      <div className={`burger-layer cheese${selections.queijo ? '' : ' hidden'}`} />
      <div className={`burger-layer patty${selections.carne ? '' : ' hidden'}`} />
      <div className={`burger-layer extras${selections.extras ? '' : ' hidden'}`} />
      <div className="burger-layer bun-bottom"></div>
    </div>
  );
}
