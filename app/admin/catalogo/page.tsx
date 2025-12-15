import Link from 'next/link';

import { AdminNav } from '@/components/AdminNav';

export default function CatalogoAdmin() {
  return (
    <main style={{ padding: 24, maxWidth: 960, margin: '0 auto' }}>
      <AdminNav />
      <h1>Catálogo</h1>
      <p>Gerencie categorias, ingredientes e acompanhamentos.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px,1fr))', gap: 16, marginTop: 16 }}>
        <Link href="/admin/catalogo/categorias" style={{ border: '1px solid #eee', padding: 16, borderRadius: 12 }}>
          Categorias
        </Link>
        <Link href="/admin/catalogo/ingredientes" style={{ border: '1px solid #eee', padding: 16, borderRadius: 12 }}>
          Ingredientes
        </Link>
        <Link href="/admin/catalogo/acompanhamentos" style={{ border: '1px solid #eee', padding: 16, borderRadius: 12 }}>
          Acompanhamentos
        </Link>
      </div>
    </main>
  );
}
