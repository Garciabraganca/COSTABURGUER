import Link from 'next/link';
import Image from 'next/image';

function FooterNav() {
  return (
    <footer className="app-footer">
      <nav>
        <Link href="/montar" className="nav-item">🍔 Montar</Link>
        <Link href="/sacola" className="nav-item">🛒 Sacola</Link>
        <Link href="/pedido/sample" className="nav-item">📍 Pedidos</Link>
        <Link href="/conta" className="nav-item disabled">👤 Conta</Link>
      </nav>
    </footer>
  );
}

export default function Layout({ children }) {
  return (
    <div className="page-shell">
      <header className="app-header">
        <div className="logo">
          <Image src="/logo-kraft.svg" alt="Costa-Burger Artesanal" width={52} height={52} />
        </div>
        <div className="header-title">
          <h1>Costa-Burger</h1>
          <p>Hambúrguer artesanal do litoral • Monte em camadas</p>
        </div>
      </header>
      <main id="app">{children}</main>
      <FooterNav />
    </div>
  );
}
