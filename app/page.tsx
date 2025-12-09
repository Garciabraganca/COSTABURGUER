import Link from 'next/link';
import BurgerPreview from '@/components/BurgerPreview';

export default function HomePage() {
  return (
    <div className="hero">
      <p className="eyebrow">Bem-vindo à Costa-Burger</p>
      <h2>Monte seu burger em camadas</h2>
      <p>Escolha pão, carne, queijos, extras e molhos para criar a combinação perfeita.</p>
      <BurgerPreview />
      <div className="cta-group">
        <Link href="/montar" className="btn primary">
          Começar meu burger
        </Link>
        <Link href="/montar" className="btn ghost">
          Ver burgers da casa
        </Link>
      </div>
    </div>
  );
}
