import { AdminNav } from '@/components/AdminNav';

export default function AcompanhamentosPage() {
  return (
    <main style={{ padding: 24, maxWidth: 960, margin: '0 auto' }}>
      <AdminNav />
      <h1>Acompanhamentos</h1>
      <p>Use as APIs /api/admin/acompanhamentos para CRUD de acompanhamentos.</p>
    </main>
  );
}
