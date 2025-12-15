import Link from 'next/link';

const links = [
  { href: '/gerente', label: 'Dashboard' },
  { href: '/gerente/pedidos', label: 'Pedidos' },
  { href: '/gerente/estoque', label: 'Estoque' },
  { href: '/login', label: 'Sair/Trocar' }
];

export function GerenteNav() {
  return (
    <nav style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
      {links.map(link => (
        <Link
          key={link.href}
          href={link.href}
          style={{
            padding: '10px 14px',
            background: '#0a3d62',
            color: '#fff',
            borderRadius: '10px',
            textDecoration: 'none'
          }}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
