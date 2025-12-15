import Link from 'next/link';

const links = [
  { href: '/motoboy', label: 'Painel' },
  { href: '/login', label: 'Sair/Trocar' }
];

export function MotoboyNav() {
  return (
    <nav style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
      {links.map(link => (
        <Link
          key={link.href}
          href={link.href}
          style={{
            padding: '10px 14px',
            background: '#6c3483',
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
