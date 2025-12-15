import { cookies } from 'next/headers';
import Link from 'next/link';

import { MotoboyNav } from '@/components/MotoboyNav';
import { verificarJwt } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export default async function MotoboyDashboard() {
  const token = cookies().get('token')?.value;
  const payload = token ? await verificarJwt(token) : null;

  const entregas = prisma
    ? await prisma.entrega.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: { id: true, status: true, token: true, pedidoId: true, latitudeAtual: true, longitudeAtual: true, ultimaAtualizacao: true }
      })
    : [];

  return (
    <main style={{ padding: '24px', maxWidth: 1000, margin: '0 auto' }}>
      <MotoboyNav />
      <h1 style={{ marginBottom: 8 }}>Painel do Motoboy</h1>
      <p style={{ color: '#555' }}>Sessão: <strong>{payload?.role ?? 'MOTOBOY'}</strong></p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px,1fr))', gap: 16, marginTop: 16 }}>
        {entregas.map(entrega => (
          <div key={entrega.id} style={{ border: '1px solid #eee', borderRadius: 12, padding: 16 }}>
            <div style={{ fontWeight: 700 }}>Entrega #{entrega.pedidoId}</div>
            <div style={{ color: '#555', margin: '4px 0' }}>Status: {entrega.status}</div>
            <div style={{ fontSize: 12, color: '#666' }}>
              Última atualização: {entrega.ultimaAtualizacao ? new Date(entrega.ultimaAtualizacao).toLocaleTimeString('pt-BR') : '—'}
            </div>
            <div style={{ marginTop: 8 }}>
              <Link href={`/entrega/${entrega.token}`} style={{ color: '#b22222' }}>
                Abrir rastreio
              </Link>
            </div>
          </div>
        ))}
        {entregas.length === 0 && (
          <div style={{ padding: 16, border: '1px dashed #ddd', borderRadius: 12 }}>
            Nenhuma entrega atribuída.
          </div>
        )}
      </div>
    </main>
  );
}
