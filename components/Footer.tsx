import Link from 'next/link';

const links = [
  { href: '/', label: '🏠 Home' },
  { href: '/montar', label: '🍔 Montar' },
  { href: '/sacola', label: '🛒 Sacola' },
  { href: '/pedido/demo', label: '📍 Pedido' },
];

export default function Footer() {
  return (
    <footer className="app-footer">
      <nav>
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="nav-item">
            {link.label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
