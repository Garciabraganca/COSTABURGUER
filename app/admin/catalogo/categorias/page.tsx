import { AdminNav } from '@/components/AdminNav';

export default function CategoriasPage() {
  return (
    <main style={{ padding: 24, maxWidth: 960, margin: '0 auto' }}>
      <AdminNav />
      <h1>Categorias</h1>
      <p>Use as APIs /api/admin/categorias para gerenciar categorias.</p>
    </main>
  );
}
