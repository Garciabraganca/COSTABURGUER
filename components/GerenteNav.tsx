import Link from 'next/link';

const links = [
  { href: '/gerente', label: 'Dashboard' },
  { href: '/gerente/pedidos', label: 'Pedidos' },
  { href: '/gerente/estoque', label: 'Estoque' },
  { href: '/login', label: 'Sair/Trocar' }
];

export function GerenteNav() {
  return (
    <nav className="manager-nav">
      {links.map(link => (
        <Link key={link.href} href={link.href}>
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
