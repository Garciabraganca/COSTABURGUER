import Link from 'next/link';

const links = [
  { href: '/cozinha', label: 'Fila' },
  { href: '/login', label: 'Sair/Trocar' }
];

export function CozinhaNav() {
  return (
    <nav style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
      {links.map(link => (
        <Link
          key={link.href}
          href={link.href}
          style={{
            padding: '10px 14px',
            background: '#145a32',
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
