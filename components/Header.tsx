import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="app-header">
      <div className="logo">
        <Image src="/logo-kraft.svg" alt="Costa-Burger Artesanal" width={52} height={52} />
      </div>
      <div className="header-title">
        <Link href="/" className="brand-link">
          <h1>Costa-Burger</h1>
          <p>Hambúrguer artesanal do litoral • Monte em camadas</p>
        </Link>
      </div>
    </header>
  );
}
