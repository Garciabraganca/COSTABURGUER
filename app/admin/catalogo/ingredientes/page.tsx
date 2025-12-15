import { AdminNav } from '@/components/AdminNav';

export default function IngredientesPage() {
  return (
    <main style={{ padding: 24, maxWidth: 960, margin: '0 auto' }}>
      <AdminNav />
      <h1>Ingredientes</h1>
      <p>Use as APIs /api/admin/ingredientes para CRUD de ingredientes.</p>
    </main>
  );
}
